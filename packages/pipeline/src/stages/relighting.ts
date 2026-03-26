import sharp from 'sharp';
import type { LightingSchema } from '@vibespace/schema';

/**
 * Stage 3 -- Relighting
 *
 * Adjusts the sprite to match a room's lighting schema by mapping the
 * warmth / brightness / contrast values (each 0-100) onto Sharp image
 * operations.
 *
 *  - **Warmth** is implemented via `tint` -- shifting towards amber for high
 *    warmth and towards cooler blue for low warmth.
 *  - **Brightness** maps to Sharp `modulate({ brightness })` where 50 is
 *    neutral (1.0).
 *  - **Contrast** is applied through a linear adjustment using Sharp
 *    `linear(a, b)` where a > 1 increases contrast and a < 1 decreases it.
 */
export async function relightSprite(
  imageBuffer: Buffer,
  lighting: LightingSchema,
): Promise<Buffer> {
  const { warmth = 50, brightness = 50, contrast = 50 } = lighting;

  // --- Brightness ----------------------------------------------------------
  // 0 -> 0.4x, 50 -> 1.0x, 100 -> 1.6x
  const brightnessFactor = 0.4 + (brightness / 100) * 1.2;

  // --- Contrast ------------------------------------------------------------
  // 0 -> 0.5, 50 -> 1.0, 100 -> 1.8
  const contrastMultiplier = 0.5 + (contrast / 100) * 1.3;
  // The offset keeps the midpoint (128) stable:  b = 128 * (1 - a)
  const contrastOffset = Math.round(128 * (1 - contrastMultiplier));

  // --- Warmth (tint) -------------------------------------------------------
  // Warmth 0 = cool blue tint, 50 = neutral, 100 = warm amber tint.
  // Sharp `tint` blends the supplied colour over the image.
  const warmthTint = warmthToTint(warmth);

  let pipeline = sharp(imageBuffer).modulate({ brightness: brightnessFactor });

  // Apply contrast via linear transform: output = a * input + b
  pipeline = pipeline.linear(contrastMultiplier, contrastOffset);

  // Apply tint only when warmth deviates meaningfully from neutral.
  if (Math.abs(warmth - 50) > 5) {
    pipeline = pipeline.tint(warmthTint);
  }

  return pipeline.png().toBuffer();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Map a 0-100 warmth value to an RGB tint colour.
 * Low warmth -> cool blue (#6688cc), high warmth -> warm amber (#cc8844).
 */
function warmthToTint(warmth: number): RGBColor {
  const t = warmth / 100; // 0..1

  // Linearly interpolate between cool and warm.
  const cool = { r: 0x66, g: 0x88, b: 0xcc };
  const warm = { r: 0xcc, g: 0x88, b: 0x44 };

  return {
    r: Math.round(cool.r + (warm.r - cool.r) * t),
    g: Math.round(cool.g + (warm.g - cool.g) * t),
    b: Math.round(cool.b + (warm.b - cool.b) * t),
  };
}
