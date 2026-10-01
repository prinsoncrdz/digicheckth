import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

export default function SignaturePad({ onSave, initialSignature = '' }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!initialSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSave('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-blue-600" /> Inspector Signature
        </label>
        {hasSigned && (
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-200">
            <Check className="w-3.5 h-3.5" /> Signature Captured
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 touch-none">
        <canvas
          ref={canvasRef}
          width={450}
          height={140}
          className="w-full h-36 rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs font-medium">
            Sign here with mouse or touch
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-md transition-colors"
        >
          <Eraser className="w-3.5 h-3.5 mr-1" /> Clear Signature
        </button>
      </div>
    </div>
  );
}
