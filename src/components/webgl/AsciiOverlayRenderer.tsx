import React, { useEffect, useRef } from 'react';

interface AsciiOverlayRendererProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
  cols?: number;
  rows?: number;
}

const ASCII_RAMP = ' .:-=+*#%@';

export const AsciiOverlayRenderer: React.FC<AsciiOverlayRendererProps> = ({
  containerRef,
  enabled,
  cols = 112,
  rows = 48,
}) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!sampleCanvasRef.current) {
      const offscreen = document.createElement('canvas');
      offscreen.width = cols;
      offscreen.height = rows;
      sampleCanvasRef.current = offscreen;
    }

    let animationFrameId: number;

    const renderAsciiFrame = () => {
      const container = containerRef.current;
      const overlay = overlayCanvasRef.current;
      const sampler = sampleCanvasRef.current;

      if (container && overlay && sampler) {
        const webglCanvas = container.querySelector('canvas:not([data-ascii-overlay="true"])') as HTMLCanvasElement | null;
        if (webglCanvas && webglCanvas.width > 0 && webglCanvas.height > 0) {
          const rect = container.getBoundingClientRect();
          if (overlay.width !== Math.floor(rect.width) || overlay.height !== Math.floor(rect.height)) {
            overlay.width = Math.max(1, Math.floor(rect.width));
            overlay.height = Math.max(1, Math.floor(rect.height));
          }

          const sCtx = sampler.getContext('2d', { willReadFrequently: true });
          const oCtx = overlay.getContext('2d');

          if (sCtx && oCtx) {
            sCtx.clearRect(0, 0, cols, rows);
            try {
              sCtx.drawImage(webglCanvas, 0, 0, cols, rows);
              const imgData = sCtx.getImageData(0, 0, cols, rows).data;

              oCtx.fillStyle = '#08090C';
              oCtx.fillRect(0, 0, overlay.width, overlay.height);

              const cellW = overlay.width / cols;
              const cellH = overlay.height / rows;
              const fontSize = Math.max(8, Math.floor(cellH * 0.95));

              oCtx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
              oCtx.textBaseline = 'top';

              for (let r = 0; r < rows; r++) {
                const y = r * cellH;
                for (let c = 0; c < cols; c++) {
                  const idx = (r * cols + c) * 4;
                  const red = imgData[idx];
                  const green = imgData[idx + 1];
                  const blue = imgData[idx + 2];

                  const luma = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
                  if (luma < 0.045) continue;

                  const rampIdx = Math.min(
                    ASCII_RAMP.length - 1,
                    Math.floor(Math.pow(luma, 0.78) * ASCII_RAMP.length)
                  );
                  const glyph = ASCII_RAMP[rampIdx];
                  if (glyph === ' ') continue;

                  // Boost saturation/brightness while preserving emerald/amber/cyan/crimson hue
                  const boost = 1.45;
                  const br = Math.min(255, Math.floor(red * boost + 18));
                  const bg = Math.min(255, Math.floor(green * boost + 24));
                  const bb = Math.min(255, Math.floor(blue * boost + 18));

                  oCtx.fillStyle = `rgb(${br}, ${bg}, ${bb})`;
                  oCtx.fillText(glyph, c * cellW, y);
                }
              }

              // Subtle scanline & HUD watermark on ASCII matrix
              oCtx.fillStyle = 'rgba(16, 185, 129, 0.16)';
              oCtx.font = '700 10px "JetBrains Mono", monospace';
              oCtx.fillText(
                `[ASCII_SHADER_MATRIX: ${cols}x${rows} CELLS // REALTIME_LUMA_QUANTIZER]`,
                10,
                overlay.height - 16
              );
            } catch {
              // Ignore transient context loss
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderAsciiFrame);
    };

    animationFrameId = requestAnimationFrame(renderAsciiFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [containerRef, enabled, cols, rows]);

  if (!enabled) return null;

  return (
    <canvas
      ref={overlayCanvasRef}
      data-ascii-overlay="true"
      className="pointer-events-none absolute inset-0 z-10 h-full w-full tui-scanlines"
    />
  );
};
