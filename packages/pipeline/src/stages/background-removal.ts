import { readFile } from 'node:fs/promises';
import removeBackgroundImpl from '@imgly/background-removal-node';

export interface BackgroundRemovalOptions {
  /** If true and REMOVE_BG_API_KEY is set, use the Remove.bg API as fallback. */
  useRemoteFallback?: boolean;
}

/**
 * Stage 1 -- Background Removal
 *
 * Removes the background from a product photo, producing a transparent PNG
 * buffer. Uses the local @imgly/background-removal-node WASM model by default.
 * When `useRemoteFallback` is true *and* the environment variable
 * `REMOVE_BG_API_KEY` is set, the Remove.bg HTTP API is tried as a fallback if
 * the local model fails.
 */
export async function removeBackground(
  inputPath: string,
  options: BackgroundRemovalOptions = {},
): Promise<Buffer> {
  try {
    return await removeBackgroundLocal(inputPath);
  } catch (localError) {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (options.useRemoteFallback && apiKey) {
      console.warn(
        '[background-removal] Local WASM model failed, falling back to Remove.bg API',
        localError,
      );
      return removeBackgroundRemote(inputPath, apiKey);
    }
    throw localError;
  }
}

// ---------------------------------------------------------------------------
// Local WASM-based removal
// ---------------------------------------------------------------------------

async function removeBackgroundLocal(inputPath: string): Promise<Buffer> {
  const inputBuffer = await readFile(inputPath);
  const blob = new Blob([inputBuffer], { type: 'image/png' });

  const resultBlob: Blob = await removeBackgroundImpl(blob, {
    output: { format: 'image/png' as const, quality: 1 },
  });

  const arrayBuffer = await resultBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// Remote Remove.bg API fallback
// ---------------------------------------------------------------------------

async function removeBackgroundRemote(
  inputPath: string,
  apiKey: string,
): Promise<Buffer> {
  const inputBuffer = await readFile(inputPath);

  const formData = new FormData();
  formData.append(
    'image_file',
    new Blob([inputBuffer], { type: 'image/png' }),
    'image.png',
  );
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Remove.bg API error (${response.status}): ${text}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
