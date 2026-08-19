import React from 'react';
import { PALETTE, hexToRgb } from '../utils/watermark.js';

export function SliderRow({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-gray-700">{value}{unit}</span>
      </div>
      <div className="relative h-4 flex items-center">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
          style={{ height: 4 }} />
      </div>
    </div>
  );
}

export function WatermarkPositionModal({ files, onConfirm, onCancel }) {
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  const [dragging, setDragging] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [opacity, setOpacity] = React.useState(20);
  const [angle, setAngle] = React.useState(0);
  const [fontSize, setFontSize] = React.useState(36);
  const [color, setColor] = React.useState('#ffffff');
  const [hexInput, setHexInput] = React.useState('#ffffff');
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  const calcPos = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const pickColor = (c) => { setColor(c); setHexInput(c); };
  const handleHex = (v) => { setHexInput(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v); };

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 lg:left-[240px] flex overflow-hidden"
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}>
      {/* Left — 70% image canvas */}
      <div className="relative overflow-hidden flex items-center justify-center" style={{ width: '70%', background: '#111' }}>
        <div
          ref={containerRef}
          className="relative select-none cursor-crosshair"
          style={{ width: '100%', height: '100%', background: '#111' }}
          onMouseMove={(e) => { if (dragging) setPos(calcPos(e)); }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchMove={(e) => { e.preventDefault(); if (dragging) setPos(calcPos(e)); }}
          onTouchEnd={() => setDragging(false)}
          onClick={(e) => setPos(calcPos(e))}
        >
          {previewUrl && (
            <img src={previewUrl} alt="preview"
              className="w-full h-full object-contain block pointer-events-none"
              draggable={false} />
          )}
          <div
            className="absolute font-bold pointer-events-auto select-none"
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              fontSize: `${fontSize}px`,
              color, opacity: opacity / 100,
              textShadow: '1px 1px 8px rgba(0,0,0,0.95)',
              cursor: dragging ? 'grabbing' : 'grab',
              whiteSpace: 'nowrap', userSelect: 'none',
              letterSpacing: '0.02em',
            }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
            onTouchStart={(e) => { e.stopPropagation(); setDragging(true); }}
          >
            © pnpartstudio
          </div>
          <div className="absolute bottom-2 left-0 right-0 text-center text-white/40 text-[10px] pointer-events-none select-none">
            click or drag to position
          </div>
        </div>
      </div>

      {/* Right — 30% controls panel */}
      <div className="flex flex-col overflow-hidden" style={{ width: '30%', background: '#fafafa', borderLeft: '1px solid #e5e7eb' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="font-black text-base text-gray-900">Watermark</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Drag on image to reposition</div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col px-4 gap-3 overflow-hidden pb-3">

          {/* Sliders card */}
          <div className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-3 shadow-sm border border-gray-100">
            <SliderRow label="Opacity" value={opacity} min={10} max={100} step={1} unit="%" onChange={setOpacity} />
            <div style={{ height: 1, background: '#f0f0f0' }} />
            <SliderRow label="Angle" value={angle} min={-180} max={180} step={1} unit="°" onChange={setAngle} />
            <div style={{ height: 1, background: '#f0f0f0' }} />
            <SliderRow label="Font Size" value={fontSize} min={10} max={120} step={1} unit="px" onChange={setFontSize} />
          </div>

          {/* Color palette card */}
          <div className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-2.5 shadow-sm border border-gray-100">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Color</span>
            <div className="grid grid-cols-8 gap-1.5">
              {PALETTE.map(c => (
                <button key={c} type="button" onClick={() => pickColor(c)}
                  className="aspect-square rounded-lg transition-transform hover:scale-110 active:scale-95"
                  style={{
                    background: c,
                    outline: color === c ? '2.5px solid #000' : '1.5px solid #e5e7eb',
                    outlineOffset: color === c ? '2px' : '0',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Picker — separate card */}
          <div className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-2 shadow-sm border border-gray-100">
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Custom Color Picker</span>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
              <label className="cursor-pointer flex-shrink-0 relative" title="Click to open color picker">
                <div className="w-8 h-8 rounded-lg border-2 border-white shadow"
                  style={{ background: color, boxShadow: '0 0 0 1.5px #e5e7eb' }} />
                <input type="color" value={color} onChange={(e) => pickColor(e.target.value)} className="sr-only" />
              </label>
              <input type="text" value={hexInput} onChange={(e) => handleHex(e.target.value)}
                placeholder="#ffffff" maxLength={7}
                className="flex-1 bg-transparent text-xs font-mono text-gray-700 outline-none border-none w-0 min-w-0"
              />
              <label className="cursor-pointer flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-black transition bg-white border border-gray-200 rounded-lg px-2 py-1" title="Open native color picker">
                Pick
                <input type="color" value={color} onChange={(e) => pickColor(e.target.value)} className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 pb-4 flex flex-col gap-2">
          <button
            className="w-full py-2.5 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition active:scale-95"
            onClick={() => onConfirm({ pos, opacity, angle, fontSize, color })}>
            Apply & Upload
          </button>
          <button
            className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition active:scale-95"
            onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
