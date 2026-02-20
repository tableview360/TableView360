import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface ModelStatus {
  status: 'idle' | 'processing' | 'done' | 'error';
  message?: string;
  updatedAt: string;
  photosCount?: number;
}

const PROJECT_ROOT = process.cwd();
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');

const ensureSafeSlug = (rawSlug: string): string => {
  const slug = rawSlug.trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug inválido. Usa solo letras, números y guiones.');
  }
  return slug;
};

export const getRestaurantModelFolder = (rawSlug: string): string => {
  const slug = ensureSafeSlug(rawSlug);
  return path.join(PUBLIC_ROOT, 'models', 'restaurants', slug);
};

export const getRestaurantModelUrl = (rawSlug: string): string => {
  const slug = ensureSafeSlug(rawSlug);
  return `/models/restaurants/${slug}/model.glb`;
};

export const getRestaurantStatusPath = (rawSlug: string): string => {
  return path.join(getRestaurantModelFolder(rawSlug), 'status.json');
};

export const readModelStatus = async (
  rawSlug: string
): Promise<ModelStatus | null> => {
  try {
    const content = await readFile(getRestaurantStatusPath(rawSlug), 'utf-8');
    return JSON.parse(content) as ModelStatus;
  } catch {
    return null;
  }
};

export const writeModelStatus = async (
  rawSlug: string,
  status: ModelStatus
): Promise<void> => {
  const folder = getRestaurantModelFolder(rawSlug);
  await mkdir(folder, { recursive: true });
  await writeFile(
    getRestaurantStatusPath(rawSlug),
    JSON.stringify(status, null, 2)
  );
};

export const saveRestaurantPhotos = async (
  rawSlug: string,
  photos: File[]
): Promise<void> => {
  const folder = getRestaurantModelFolder(rawSlug);
  const originalsFolder = path.join(folder, 'originals');

  await mkdir(originalsFolder, { recursive: true });
  await rm(originalsFolder, { recursive: true, force: true });
  await mkdir(originalsFolder, { recursive: true });

  for (let i = 0; i < photos.length; i += 1) {
    const photo = photos[i];
    const ext = photo.type.split('/')[1] || 'jpg';
    const fileName = `photo-${String(i + 1).padStart(2, '0')}.${ext}`;
    const filePath = path.join(originalsFolder, fileName);
    const buffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(filePath, buffer);
  }
};

export const hasModelGlb = async (rawSlug: string): Promise<boolean> => {
  const modelPath = path.join(getRestaurantModelFolder(rawSlug), 'model.glb');
  try {
    const modelInfo = await stat(modelPath);
    return modelInfo.isFile();
  } catch {
    return false;
  }
};
