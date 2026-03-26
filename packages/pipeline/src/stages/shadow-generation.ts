import sharp from 'sharp';
import type { ShadowPrimitive } from '@vibespace/schema';

/**
 * Stage 4 -- Shadow Generation
 *
 * Generates a shadow PNG for a product sprite.  The shadow shape is determined
 * by the `ShadowPrimitive` (cylinder -> oval, box -> rectangle, etc.) and is
 * rendered as a dark semi-transparent blurred image at the dimensions derived
 * from the sprite.
 */
export async function generateShadow(
  _spriteBuffer: Buffer,
  primitive: ShadowPrimitive,
  width: number,
  height: number,
): Promise<Buffer> {
  // Shadow canvas is the same width as the sprite, but shorter (sits below it).
  const shadowHeight = Math.max(1, Math.round(height * 0.25));
  const shadowWidth = Math.max(1, width);

  const svg = buildShadowSvg(primitive, shadowWidth, shadowHeight);

  // Render SVG -> PNG then apply Gaussian blur for soft edges.
  const blurRadius = Math.max(1, Math.round(Math.min(shadowWidth, shadowHeight) * 0.15));

  const shadow = await sharp(Buffer.from(svg))
    .resize(shadowWidth, shadowHeight)
    .blur(blurRadius)
    .png()
    .toBuffer();

  return shadow;
}

// ---------------------------------------------------------------------------
// SVG shape builders
// ---------------------------------------------------------------------------

function buildShadowSvg(
  primitive: ShadowPrimitive,
  w: number,
  h: number,
): string {
  const fill = 'rgba(0,0,0,0.45)';

  switch (primitive) {
    case 'cylinder':
    case 'capsule':
      return ovalSvg(w, h, fill);
    case 'hemisphere':
      return halfEllipseSvg(w, h, fill);
    case 'box':
      return rectSvg(w, h, fill, 0.85, 0.7);
    case 'scaled-box':
      return rectSvg(w, h, fill, 0.95, 0.8);
    case 'sphere':
      return circleSvg(w, h, fill);
    default:
      return ovalSvg(w, h, fill);
  }
}

/** Full-width ellipse centred at the bottom of the canvas. */
function ovalSvg(w: number, h: number, fill: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.42;
  const ry = h * 0.38;
  return svgWrap(
    w,
    h,
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" />`,
  );
}

/** Half-ellipse -- wider at the base, tapering up. */
function halfEllipseSvg(w: number, h: number, fill: string): string {
  const cx = w / 2;
  const rx = w * 0.44;
  const ry = h * 0.42;
  // Draw only the bottom half via a clipping path.
  return svgWrap(
    w,
    h,
    `<defs>
       <clipPath id="bottom-half">
         <rect x="0" y="${h * 0.3}" width="${w}" height="${h}" />
       </clipPath>
     </defs>
     <ellipse cx="${cx}" cy="${h * 0.4}" rx="${rx}" ry="${ry}" fill="${fill}" clip-path="url(#bottom-half)" />`,
  );
}

/** Rounded rectangle shadow. */
function rectSvg(
  w: number,
  h: number,
  fill: string,
  widthRatio: number,
  heightRatio: number,
): string {
  const rw = w * widthRatio;
  const rh = h * heightRatio;
  const rx = Math.round(Math.min(rw, rh) * 0.12);
  const x = (w - rw) / 2;
  const y = (h - rh) / 2;
  return svgWrap(
    w,
    h,
    `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="${rx}" ry="${rx}" fill="${fill}" />`,
  );
}

/** Circle shadow (for spheres). */
function circleSvg(w: number, h: number, fill: string): string {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.4;
  return svgWrap(w, h, `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`);
}

/** Wrap inner SVG content in a transparent-background SVG document. */
function svgWrap(w: number, h: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${inner}
</svg>`;
}
