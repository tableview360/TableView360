import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { SupabaseClient } from '@supabase/supabase-js';

const execFileAsync = promisify(execFile);
const UPLOAD_BUCKET = 'restaurant-uploads';
const MODEL_BUCKET = 'restaurant-models';

interface PipelineResult {
  modelUrl: string;
  photosCount: number;
  mode: 'full-openmvs' | 'fallback-colmap-dense';
  elapsedMs: number;
}

const ensureBinary = async (binary: string): Promise<void> => {
  try {
    await execFileAsync('which', [binary]);
  } catch {
    throw new Error(
      `No se encontró "${binary}". Instálalo y asegúrate de que esté en PATH.`
    );
  }
};
const hasBinary = async (binary: string): Promise<boolean> => {
  try {
    await execFileAsync('which', [binary]);
    return true;
  } catch {
    return false;
  }
};

const run = async (command: string, args: string[]): Promise<void> => {
  try {
    await execFileAsync(command, args, { maxBuffer: 20 * 1024 * 1024 });
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr;
    throw new Error(
      `Falló comando ${command} ${args.join(' ')}${stderr ? `: ${stderr}` : ''}`,
      { cause: error }
    );
  }
};
const runSafe = async (
  command: string,
  args: string[]
): Promise<{ ok: boolean; error?: string }> => {
  try {
    await run(command, args);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown command error',
    };
  }
};
const convertImageToJpeg = async (
  sourcePath: string,
  outputPath: string
): Promise<void> => {
  try {
    await run('sips', [
      '-s',
      'format',
      'jpeg',
      sourcePath,
      '--out',
      outputPath,
    ]);
  } catch {
    await copyFile(sourcePath, outputPath);
  }
};

export const runPhotogrammetryPipeline = async ({
  supabase,
  supabaseUrl,
  slug,
}: {
  supabase: SupabaseClient;
  supabaseUrl: string;
  slug: string;
}): Promise<PipelineResult> => {
  const startedAt = Date.now();
  await ensureBinary('colmap');
  await ensureBinary('blender');
  const openMvsReady = (
    await Promise.all(
      [
        'InterfaceCOLMAP',
        'DensifyPointCloud',
        'ReconstructMesh',
        'TextureMesh',
      ].map((bin) => hasBinary(bin))
    )
  ).every(Boolean);

  const { data: photos, error: listError } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .list(`${slug}/originals`, {
      limit: 500,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (listError) throw new Error(listError.message);
  if (!photos || photos.length < 8) {
    throw new Error(
      'Se requieren al menos 8 fotos para una reconstrucción útil.'
    );
  }

  const workspace = await mkdtemp(path.join(tmpdir(), `tv360-${slug}-`));
  const imagesDir = path.join(workspace, 'images');
  const normalizedDir = path.join(workspace, 'images_jpg');
  const sparseDir = path.join(workspace, 'sparse');
  const denseDir = path.join(workspace, 'dense');
  const mvsDir = path.join(workspace, 'mvs');
  const distDir = path.join(workspace, 'dist');
  const databasePath = path.join(workspace, 'database.db');

  await mkdir(imagesDir, { recursive: true });
  await mkdir(normalizedDir, { recursive: true });
  await mkdir(sparseDir, { recursive: true });
  await mkdir(denseDir, { recursive: true });
  await mkdir(mvsDir, { recursive: true });
  await mkdir(distDir, { recursive: true });

  try {
    for (const photo of photos) {
      const remotePath = `${slug}/originals/${photo.name}`;
      const { data, error } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .download(remotePath);
      if (error || !data) {
        throw new Error(
          `No se pudo descargar ${remotePath}: ${error?.message ?? ''}`
        );
      }
      const arrayBuffer = await data.arrayBuffer();
      const sourcePath = path.join(imagesDir, photo.name);
      await writeFile(sourcePath, Buffer.from(arrayBuffer));
      const normalizedName = `${path.parse(photo.name).name}.jpg`;
      await convertImageToJpeg(
        sourcePath,
        path.join(normalizedDir, normalizedName)
      );
    }

    await run('colmap', [
      'feature_extractor',
      '--database_path',
      databasePath,
      '--image_path',
      normalizedDir,
      '--ImageReader.single_camera',
      '1',
      '--FeatureExtraction.num_threads',
      '1',
      '--FeatureExtraction.use_gpu',
      '0',
      '--SiftExtraction.max_image_size',
      '1600',
      '--SiftExtraction.max_num_features',
      '4096',
    ]);
    await run('colmap', [
      'exhaustive_matcher',
      '--database_path',
      databasePath,
      '--FeatureMatching.num_threads',
      '1',
      '--FeatureMatching.use_gpu',
      '0',
    ]);
    await run('colmap', [
      'mapper',
      '--database_path',
      databasePath,
      '--image_path',
      normalizedDir,
      '--output_path',
      sparseDir,
    ]);
    await run('colmap', [
      'image_undistorter',
      '--image_path',
      normalizedDir,
      '--input_path',
      path.join(sparseDir, '0'),
      '--output_path',
      denseDir,
      '--output_type',
      'COLMAP',
    ]);

    let meshInputPath = '';
    if (openMvsReady) {
      const mvsFile = path.join(mvsDir, 'scene.mvs');
      await run('InterfaceCOLMAP', ['-i', denseDir, '-o', mvsFile]);
      await run('DensifyPointCloud', [mvsFile, '--resolution-level', '1']);
      const denseMvs = path.join(mvsDir, 'scene_dense.mvs');
      await run('ReconstructMesh', [denseMvs]);
      const meshMvs = path.join(mvsDir, 'scene_dense_mesh.mvs');
      await run('TextureMesh', [meshMvs]);
      meshInputPath = path.join(mvsDir, 'scene_dense_mesh_texture.obj');
    } else {
      const patchMatch = await runSafe('colmap', [
        'patch_match_stereo',
        '--workspace_path',
        denseDir,
        '--workspace_format',
        'COLMAP',
        '--PatchMatchStereo.gpu_index',
        '-1',
      ]);
      if (patchMatch.ok) {
        const fusedPly = path.join(distDir, 'fused.ply');
        await run('colmap', [
          'stereo_fusion',
          '--workspace_path',
          denseDir,
          '--workspace_format',
          'COLMAP',
          '--input_type',
          'geometric',
          '--output_path',
          fusedPly,
        ]);
        const meshedPly = path.join(distDir, 'meshed-poisson.ply');
        await run('colmap', [
          'poisson_mesher',
          '--input_path',
          fusedPly,
          '--output_path',
          meshedPly,
        ]);
        meshInputPath = meshedPly;
      } else {
        const sparsePly = path.join(distDir, 'sparse_points.ply');
        await run('colmap', [
          'model_converter',
          '--input_path',
          path.join(sparseDir, '0'),
          '--output_path',
          sparsePly,
          '--output_type',
          'PLY',
        ]);
        meshInputPath = sparsePly;
      }
    }
    const glbPath = path.join(distDir, 'model.glb');
    const blenderScript = `
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
path = r"${meshInputPath}"
if path.lower().endswith('.obj'):
    bpy.ops.import_scene.obj(filepath=path)
else:
    bpy.ops.wm.ply_import(filepath=path)
bpy.ops.export_scene.gltf(filepath=r"${glbPath}", export_format='GLB')
`;
    await run('blender', ['--background', '--python-expr', blenderScript]);

    const { readFile } = await import('node:fs/promises');
    const modelBuffer = await readFile(glbPath);
    const modelPath = `${slug}/model.glb`;
    const { error: uploadError } = await supabase.storage
      .from(MODEL_BUCKET)
      .upload(modelPath, modelBuffer, {
        contentType: 'model/gltf-binary',
        upsert: true,
      });
    if (uploadError) throw new Error(uploadError.message);

    return {
      modelUrl: `${supabaseUrl}/storage/v1/object/public/${MODEL_BUCKET}/${encodeURIComponent(slug)}/model.glb`,
      photosCount: photos.length,
      mode: openMvsReady ? 'full-openmvs' : 'fallback-colmap-dense',
      elapsedMs: Date.now() - startedAt,
    };
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
};
