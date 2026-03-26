import sharp from 'sharp';

export type AtmosphereLevel = 'light' | 'light-medium' | 'medium' | 'heavy';

interface AtmosphereParams {
  /** Sepia tint intensity 0-1. */
  sepiaStrength: number;
  /** Saturation multiplier (1 = unchanged). */
  saturation: number;
  /** Brightness multiplier. */
  brightness: number;
  /** Vignette opacity 0-1. */
  vignetteOpacity: number;
}

const ATMOSPHERE_PRESETS: Record<AtmosphereLevel, AtmosphereParams> = {
  light: {
    sepiaStrength: 0.05,
    saturation: 0.97,
    brightness: 1.0,
    vignetteOpacity: 0.08,
  },
  'light-medium': {
    sepiaStrength: 0.12,
    saturation: 0.92,
    brightness: 0.97,
    vignetteOpacity: 0.15,
  },
  medium: {
    sepiaStrength: 0.22,
    saturation: 0.85,
    brightness: 0.93,
    vignetteOpacity: 0.25,
  },
  heavy: {
    sepiaStrength: 0.38,
    saturation: 0.72,
    brightness: 0.87,
    vignetteOpacity: 0.40,
  },
};

/**
 * Stage 5 -- Atmospheric Blend
 *
 * Applies a warm, ambient atmosphere to the sprite to help it settle into the
 * room scene.  Effects include:
 *  - Sepia-like colour toning (via tint + desaturation)
 *  - Brightness / contrast tweaks
 *  - A radial vignette overlay composited on top
 */
export async function applyAtmosphere(
  imageBuffer: Buffer,
  atmosphere: AtmosphereLevel,
): Promise<Buffer> {
  const params = ATMOSPHERE_PRESETS[atmosphere];
  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width ?? 1;
  const height = meta.height ?? 1;

  // --- Toning & colour adjustments -----------------------------------------
  let pipeline = sharp(imageBuffer).modulate({
    brightness: params.brightness,
    saturation: params.saturation,
  });

  // Sepia tint: blend towards a warm brownish tone.
  if (params.sepiaStrength > 0) {
    // We approximate sepia by tinting towards a warm colour whose influence is
    // controlled by first slightly desaturating then applying a tint.
    pipeline = pipeline.tint({
      r: Math.round(112 + 30 * params.sepiaStrength),
      g: Math.round(90 + 16 * params.sepiaStrength),
      b: Math.round(60 + 8 * params.sepiaStrength),
    });
  }

  const toned = await pipeline.png().toBuffer();

  // --- Vignette overlay ----------------------------------------------------
  if (params.vignetteOpacity > 0) {
    const vignette = buildVignetteSvg(width, height, params.vignetteOpacity);
    const vignetteBuffer = await sharp(Buffer.from(vignette))
      .resize(width, height)
      .png()
      .toBuffer();

    const composited = await sharp(toned)
      .composite([{ input: vignetteBuffer, blend: 'multiply' }])
      .png()
      .toBuffer();

    return composited;
  }

  return toned;
}

// ---------------------------------------------------------------------------
// Vignette helper
// ---------------------------------------------------------------------------

/**
 * Generates an SVG with a radial gradient vignette.  The centre is transparent
 * and the edges darken to black at the given opacity.
 */
function buildVignetteSvg(w: number, h: number, opacity: number): string {
  const alpha = Math.min(1, Math.max(0, opacity));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="white" stop-opacity="1" />
      <stop offset="100%" stop-color="black" stop-opacity="${alpha}" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#vig)" />
</svg>`;
}
