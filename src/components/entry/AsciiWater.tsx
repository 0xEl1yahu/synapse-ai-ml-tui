import { useEffect, useRef } from 'react';

// Water field adapted from https://21st.dev/@prayaniwork/components/ascii-liquid-login
// The two crossing swells set the surface angle. Pointer rings perturb that same field.
const tones = [' ', '.', '·', ':', '~', '=', '+', '*', '#', '%', '@'];
const ink = ['#08090c', '#223e36', '#345948', '#42745c', '#518a70', '#62a286',
  '#79bc99', '#94d2ac', '#afdfbd', '#caedd0', '#e7fae9'];
const cellWidth = 7;
const cellHeight = 10;
type Ring = { x: number; y: number; birth: number; strength: number; speed: number };

export function AsciiWater() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const atlas = document.createElement('canvas');
    const brush = atlas.getContext('2d');
    if (!brush) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, scale = 1;
    let rings: Ring[] = [];
    let frame = 0, lastFrame = 0;
    let hold: { id: number; start: number } | null = null;
    let lastPoint: { x: number; y: number } | null = null;

    function draw(now: number) {
      if (!ctx || !width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const t = motion.matches ? 0 : now / 2600;
      rings = rings.filter(r => now - r.birth < 2700);
      for (let y = cellHeight / 2; y < height; y += cellHeight) {
        const v = y / height;
        const depth = Math.sqrt(0.22 + 0.78 * v);
        const py = Math.sqrt(v) * 15;
        for (let x = cellWidth / 2; x < width; x += cellWidth) {
          const px = (x / width - 0.5) * 9 / depth;
          const swell = Math.sin(px * 1.35 + py * 1.85 - t + 0.7 * Math.sin(px * 0.9 - t * 0.3));
          const chop = Math.sin(px * 2.4 - py * 1.45 - t * 0.8 + 0.55 * Math.cos(py * 1.2));
          let light = 0.12 + Math.pow((1 + swell) / 2, 3) * (0.32 + (1 + chop) * 0.18);
          for (const ring of rings) {
            const age = (now - ring.birth) / 1000;
            const distance = Math.hypot(x - ring.x, (y - ring.y) / 0.55);
            const band = (distance - age * ring.speed) / 16;
            if (Math.abs(band) > 3) continue;
            const envelope = Math.exp(-band * band * 0.5) * (1 - age / 2.7);
            light += ring.strength * envelope * Math.cos(band * 2.2);
          }
          const level = Math.min(tones.length - 1, Math.max(0, Math.round(light * (tones.length - 1))));
          if (level) ctx.drawImage(atlas, level * cellWidth * scale, 0, cellWidth * scale,
            cellHeight * scale, x - cellWidth / 2, y - cellHeight / 2, cellWidth, cellHeight);
        }
      }
    }

    function tick(now: number) {
      if (now - lastFrame >= 40) {
        draw(now);
        lastFrame = now;
      }
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      rings = [];
      hold = lastPoint = null;
      if (document.hidden) return;
      draw(performance.now());
      if (!motion.matches) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !ctx || !brush) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      scale = Math.min(2, Math.ceil(window.devicePixelRatio || 1));
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      atlas.width = tones.length * cellWidth * scale;
      atlas.height = cellHeight * scale;
      brush.setTransform(scale, 0, 0, scale, 0, 0);
      brush.font = '10px ui-monospace, monospace';
      brush.textBaseline = 'middle';
      tones.forEach((glyph, i) => {
        brush.fillStyle = ink[i];
        brush.fillText(glyph, i * cellWidth, cellHeight / 2);
      });
      refresh();
    }

    function point(event: PointerEvent) {
      const rect = (event.currentTarget as HTMLCanvasElement).getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    function emit(p: { x: number; y: number }, strength: number) {
      if (rings.length >= 12) rings.shift();
      rings.push({ ...p, strength, birth: performance.now(), speed: Math.max(145, width * 0.48) });
    }
    function move(event: PointerEvent) {
      if (motion.matches || !event.isPrimary) return;
      const p = point(event);
      if (lastPoint && Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y) < 18) return;
      emit(p, 0.56);
      lastPoint = p;
    }
    function press(event: PointerEvent) {
      if (motion.matches || !event.isPrimary || event.button !== 0) return;
      lastPoint = point(event);
      emit(lastPoint, 1.5);
      hold = { id: event.pointerId, start: performance.now() };
      canvas?.setPointerCapture(event.pointerId);
    }
    function release(event: PointerEvent) {
      if (!hold || hold.id !== event.pointerId) return;
      const charge = Math.min(1, (performance.now() - hold.start) / 1200);
      if (!motion.matches && charge > 0.25) emit(point(event), 1.5 + charge);
      hold = lastPoint = null;
    }
    function resetPointer() { hold = lastPoint = null; }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerdown', press);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', resetPointer);
    canvas.addEventListener('lostpointercapture', resetPointer);
    document.addEventListener('visibilitychange', refresh);
    motion.addEventListener('change', refresh);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerdown', press);
      canvas.removeEventListener('pointerup', release);
      canvas.removeEventListener('pointercancel', resetPointer);
      canvas.removeEventListener('lostpointercapture', resetPointer);
      document.removeEventListener('visibilitychange', refresh);
      motion.removeEventListener('change', refresh);
    };
  }, []);

  return <canvas ref={ref} className="entry-water" aria-hidden="true" />;
}
