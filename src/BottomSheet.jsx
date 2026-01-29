import { useEffect, useRef, useState } from "react";

export default function BottomSheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const [offset, setOffset] = useState(0);

  /* ---------- ESC KEY ---------- */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ---------- FOCUS TRAP ---------- */
  useEffect(() => {
    if (open) sheetRef.current?.focus();
  }, [open]);

  /* ---------- TOUCH / DRAG ---------- */
  const startDrag = (y) => (startY.current = y);
  const drag = (y) => {
    const delta = y - startY.current;
    if (delta > 0) setOffset(delta);
  };
  const endDrag = () => {
    if (offset > 120) onClose();
    setOffset(0);
  };

  if (!open) return null;

  return (
    <div className="bs-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="bs-sheet"
        style={{ transform: `translateY(${offset}px)` }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => startDrag(e.touches[0].clientY)}
        onTouchMove={(e) => drag(e.touches[0].clientY)}
        onTouchEnd={endDrag}
        onMouseDown={(e) => startDrag(e.clientY)}
        onMouseMove={(e) => e.buttons && drag(e.clientY)}
        onMouseUp={endDrag}
      >
        {/* Drag Handle */}
        <div className="bs-handle" />

        {/* Header */}
        <div className="bs-header">
          <span>{title}</span>
          <button className="bs-close" aria-label="Close" onClick={onClose}>
            <i class="bi bi-x-circle"></i>
          </button>
        </div>

        {/* Content */}
        <div className="bs-body no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
