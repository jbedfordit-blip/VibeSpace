import { resolve, basename, extname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import type { LightingSchema, PipelineResult, ShadowPrimitive } from '@vibespace/schema';
import { PRODUCT_TAG_TO_SHADOW } from '@vibespace/schema';

import { removeBackground } from './stages/background-removal';
import { assessPerspective } from './stages/perspective';
import { relightSprite } from './stages/relighting';
import { generateShadow } from './stages/shadow-generation';
import { applyAtmosphere, type AtmosphereLevel } from './stages/atmospheric-blend';

export { removeBackground } from './stages/background-removal';
export { assessPerspective } from './stages/perspective';
export { relightSprite } from './stages/relighting';
export { generateShadow } from './stages/shadow-generation';
export { applyAtmosphere } from './stages/atmospheric-blend';

export interface ProcessSpriteOptions {
  lighting: LightingSchema;
  /** Product tag used to look up the shadow primitive (e.g. "mug", "book"). */
  productTag?: string;
  /** Directory to write output files.  Defaults to packages/pipeline/output/. */
  outputDir?: string;
  /** Forward to background-removal stage. */
  useRemoteFallback?: boolean;
}

/**
 * Main pipeline orchestrator.  Runs stages 1-5 sequentially and writes the
 * resulting sprite and shadow PNGs to `outputDir`.
 *
 * Returns a {@link PipelineResult} with URLs (local paths), blend parameters,
 * perspective classification, and advisory text.
 */
export async function processSprite(
  inputPath: string,
  options: ProcessSpriteOptions,
): Promise<PipelineResult> {
  const {
    lighting,
    productTag,
    outputDir = resolve(__dirname, '../../output'),
    useRemoteFallback = false,
  } = options;

  await mkdir(outputDir, { recursive: true });

  const stem = basename(inputPath, extname(inputPath));

  // ---- Stage 1: Background Removal ----------------------------------------
  console.log('[pipeline] Stage 1 -- background removal');
  let spriteBuffer = await removeBackground(inputPath, { useRemoteFallback });

  // ---- Stage 2: Perspective Assessment ------------------------------------
  console.log('[pipeline] Stage 2 -- perspective assessment');
  const perspective = await assessPerspective(spriteBuffer);
  if (perspective.corrected) {
    spriteBuffer = perspective.corrected;
  }

  // ---- Stage 3: Relighting ------------------------------------------------
  console.log('[pipeline] Stage 3 -- relighting');
  spriteBuffer = await relightSprite(spriteBuffer, lighting);

  // ---- Stage 4: Shadow Generation -----------------------------------------
  console.log('[pipeline] Stage 4 -- shadow generation');
  const meta = await sharp(spriteBuffer).metadata();
  const spriteWidth = meta.width ?? 256;
  const spriteHeight = meta.height ?? 256;

  const primitive: ShadowPrimitive =
    (productTag && PRODUCT_TAG_TO_SHADOW[productTag]) || 'box';

  const shadowBuffer = await generateShadow(
    spriteBuffer,
    primitive,
    spriteWidth,
    spriteHeight,
  );

  // ---- Stage 5: Atmospheric Blend -----------------------------------------
  console.log('[pipeline] Stage 5 -- atmospheric blend');
  const atmosphere: AtmosphereLevel = lighting.atmosphere ?? 'medium';
  spriteBuffer = await applyAtmosphere(spriteBuffer, atmosphere);

  // ---- Write outputs ------------------------------------------------------
  const spritePath = join(outputDir, `${stem}-sprite.png`);
  const shadowPath = join(outputDir, `${stem}-shadow.png`);

  await Promise.all([
    writeFile(spritePath, spriteBuffer),
    writeFile(shadowPath, shadowBuffer),
  ]);

  console.log(`[pipeline] Wrote sprite  -> ${spritePath}`);
  console.log(`[pipeline] Wrote shadow  -> ${shadowPath}`);

  // ---- Build result -------------------------------------------------------
  const result: PipelineResult = {
    sprite_url: spritePath,
    shadow_url: shadowPath,
    blend_params: {
      warmth: lighting.warmth ?? 50,
      brightness: lighting.brightness ?? 50,
      contrast: lighting.contrast ?? 50,
      atmosphere,
    },
    perspective: perspective.classification,
    advisory: perspective.advisory,
  };

  return result;
}
