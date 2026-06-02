"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const OUTPUT = 256;

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

export function AvatarCropModal({ file, onCancel, onConfirm }: Props) {
  const [src, setSrc] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [metrics, setMetrics] = useState<{ nw: number; nh: number; cover: number } | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setMetrics(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function syncMetrics() {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport || !img.naturalWidth) return;
    const viewSize = viewport.clientWidth;
    const cover = Math.max(viewSize / img.naturalWidth, viewSize / img.naturalHeight);
    setMetrics({ nw: img.naturalWidth, nh: img.naturalHeight, cover });
  }

  const onPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    setDragging(true);
    dragStart.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + event.clientX - dragStart.current.x,
      y: dragStart.current.oy + event.clientY - dragStart.current.y
    });
  };

  const onPointerUp = () => setDragging(false);

  const cropToBlob = useCallback(async () => {
    const img = imgRef.current;
    const viewport = viewportRef.current;
    if (!img || !viewport || !metrics) return null;

    const viewSize = viewport.clientWidth;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const baseScale = metrics.cover;
    const drawScale = baseScale * scale;
    const drawW = metrics.nw * drawScale;
    const drawH = metrics.nh * drawScale;
    const drawX = (viewSize - drawW) / 2 + offset.x;
    const drawY = (viewSize - drawH) / 2 + offset.y;
    const ratio = OUTPUT / viewSize;

    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, drawX * ratio, drawY * ratio, drawW * ratio, drawH * ratio);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  }, [metrics, offset, scale]);

  async function handleSave() {
    if (!metrics) return;
    setSaving(true);
    const blob = await cropToBlob();
    setSaving(false);
    if (blob) onConfirm(blob);
  }

  return (
    <div className="avatar-crop-backdrop" role="presentation" onClick={onCancel}>
      <div className="avatar-crop-modal" role="dialog" aria-labelledby="avatar-crop-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="avatar-crop-title">Обрезка фото</h2>
        <p className="avatar-crop-modal__hint">Перетащите фото и отрегулируйте масштаб</p>

        <div
          ref={viewportRef}
          className="avatar-crop-viewport"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src ? (
            <img
              ref={imgRef}
              alt=""
              className="avatar-crop-viewport__img"
              draggable={false}
              src={src}
              style={
                metrics
                  ? {
                      width: metrics.nw * metrics.cover,
                      height: metrics.nh * metrics.cover,
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`
                    }
                  : undefined
              }
              onLoad={syncMetrics}
            />
          ) : null}
          <span className="avatar-crop-viewport__ring" aria-hidden />
        </div>

        <label className="avatar-crop-scale">
          Масштаб
          <input
            max={3}
            min={1}
            step={0.01}
            type="range"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>

        <div className="avatar-crop-actions">
          <button className="course-button" type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="course-button is-primary" disabled={saving} type="button" onClick={handleSave}>
            {saving ? "Сохраняем..." : "Сохранить фото"}
          </button>
        </div>
      </div>
    </div>
  );
}
