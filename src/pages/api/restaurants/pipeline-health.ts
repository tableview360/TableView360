import type { APIRoute } from 'astro';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REQUIRED_BINARIES = [
  'colmap',
  'InterfaceCOLMAP',
  'DensifyPointCloud',
  'ReconstructMesh',
  'TextureMesh',
  'blender',
] as const;

const checkBinary = async (binary: string) => {
  try {
    const { stdout } = await execFileAsync('which', [binary]);
    return { binary, ok: true, path: stdout.trim() };
  } catch {
    return { binary, ok: false, path: null };
  }
};

export const GET: APIRoute = async () => {
  const checks = await Promise.all(
    REQUIRED_BINARIES.map((b) => checkBinary(b))
  );
  const missing = checks.filter((c) => !c.ok).map((c) => c.binary);
  const hasColmap = checks.some((c) => c.binary === 'colmap' && c.ok);
  const hasBlender = checks.some((c) => c.binary === 'blender' && c.ok);
  const hasOpenMvs = [
    'InterfaceCOLMAP',
    'DensifyPointCloud',
    'ReconstructMesh',
    'TextureMesh',
  ].every((binary) => checks.some((c) => c.binary === binary && c.ok));
  const ready = hasColmap && hasBlender;
  const mode = hasOpenMvs
    ? 'full-openmvs'
    : ready
      ? 'fallback-colmap-dense'
      : 'not-ready';

  return new Response(
    JSON.stringify({
      success: true,
      ready,
      mode,
      checks,
      missing,
      message:
        mode === 'full-openmvs'
          ? 'Pipeline completo listo (COLMAP + OpenMVS + Blender).'
          : mode === 'fallback-colmap-dense'
            ? 'Pipeline usable en modo fallback denso (COLMAP stereo+mesher + Blender). Para máxima calidad instala OpenMVS.'
            : `Faltan binarios críticos: ${missing.join(', ')}`,
    }),
    { status: 200 }
  );
};
