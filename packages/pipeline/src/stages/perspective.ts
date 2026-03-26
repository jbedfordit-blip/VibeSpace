import sharp from 'sharp';
import type { PerspectiveClassification } from '@vibespace/schema';
import { PERSPECTIVE_ADVISORY } from '@vibespace/schema';

export interface PerspectiveResult {
  classification: PerspectiveClassification;
  advisory: string;
  /** Returned only when a minor correction was applied. */
  corrected?: Buffer;
}

/**
 * Stage 2 -- Perspective Assessment
 *
 * Analyses the sprite image to heuristically determine the camera perspective.
 * Since full OpenCV.js WASM in Node is heavy, we rely on dimension ratios and
 * brightness distribution derived through Sharp.
 *
 * Heuristics:
 *  - Very wide & short  (aspect > 2.2)            -> top-down
 *  - Very tall & narrow  (aspect < 0.35)           -> steep-upward
 *  - Moderate wide       (1.6 < aspect <= 2.2)     -> strong-side
 *  - Slight tilt detected via brightness skew      -> minor-elevation
 *  - Everything else                                -> correct
 *
 * For `minor-elevation` a light affine skew is applied automatically.
 */
export async function assessPerspective(
  imageBuffer: Buffer,
): Promise<PerspectiveResult> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;
  const aspect = width / height;

  // Compute brightness distribution: split image into top and bottom halves.
  const topHalf = await sharp(imageBuffer)
    .extract({ left: 0, top: 0, width, height: Math.max(1, Math.floor(height / 2)) })
    .stats();
  const bottomHalf = await sharp(imageBuffer)
    .extract({
      left: 0,
      top: Math.floor(height / 2),
      width,
      height: Math.max(1, height - Math.floor(height / 2)),
    })
    .stats();

  const avgBrightnessTop = channelMean(topHalf);
  const avgBrightnessBottom = channelMean(bottomHalf);
  const brightnessDiff = avgBrightnessTop - avgBrightnessBottom;

  let classification: PerspectiveClassification;

  if (aspect > 2.2) {
    classification = 'top-down';
  } else if (aspect < 0.35) {
    classification = 'steep-upward';
  } else if (aspect > 1.6) {
    classification = 'strong-side';
  } else if (Math.abs(brightnessDiff) > 30) {
    // Significant brightness skew between halves suggests a slight tilt.
    classification = 'minor-elevation';
  } else {
    classification = 'correct';
  }

  const advisory = PERSPECTIVE_ADVISORY[classification];

  if (classification === 'minor-elevation') {
    const corrected = await applyMinorCorrection(imageBuffer, width, height, brightnessDiff);
    return { classification, advisory, corrected };
  }

  return { classification, advisory };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function channelMean(stats: sharp.Stats): number {
  // Average the means of all channels.
  return stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
}

/**
 * Apply a lightweight skew transform to correct for minor elevation issues.
 * We use Sharp's affine transform with a small shear factor whose direction
 * depends on whether the top or bottom is brighter.
 */
async function applyMinorCorrection(
  imageBuffer: Buffer,
  width: number,
  height: number,
  brightnessDiff: number,
): Promise<Buffer> {
  // Positive diff means top is brighter -> slight downward tilt, shear upward.
  const shearFactor = brightnessDiff > 0 ? 0.04 : -0.04;

  // Sharp's affine expects a 2x2 or a flat [a,b,c,d] matrix.
  // [[1, shear], [0, 1]] applies a horizontal shear.
  const corrected = await sharp(imageBuffer)
    .affine([[1, shearFactor], [0, 1]], {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return corrected;
}
