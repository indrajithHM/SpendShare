"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) sheetRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const startDrag = (y: number) => { startY.current = y; };
  const drag = (y: number) => { const d = y - startY.current; if (d > 0) setOffset(d); };
  const endDrag = () => { if (offset > 120) onClose(); setOffset(0); };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl flex flex-col outline-none animate-slide-up"
        style={{ transform: `translateY(${offset}px)`, transition: offset === 0 ? "transform 0.3s ease" : "none" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => startDrag(e.touches[0].clientY)}
        onTouchMove={(e) => drag(e.touches[0].clientY)}
        onTouchEnd={endDrag}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
          <span className="font-semibold text-gray-800">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-8 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
