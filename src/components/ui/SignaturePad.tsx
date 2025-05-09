import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SignaturePadProps {
  onChange: (signatureData: string | null) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onChange,
  className,
  label,
  placeholder,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { t } = useTranslation();

  // Use translation defaults if props not provided
  const labelText = label ?? t("signature");
  const placeholderText = placeholder ?? t("signature_placeholder");
  const clearText = t("clear");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Responsive canvas sizing
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = 150;
      }

      // White background
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Drawing style
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#1A365D";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let clientX: number, clientY: number;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      e.preventDefault();
      const touch = e.touches[0];
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(clientX, clientY);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let clientX: number, clientY: number;
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      e.preventDefault();
      const touch = e.touches[0];
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }

    context.lineTo(clientX, clientY);
    context.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (hasSignature) {
      const signatureData = canvasRef.current?.toDataURL("image/png");
      onChange(signatureData || null);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {labelText && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {labelText}
        </label>
      )}

      <div className="relative border border-border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="touch-none w-full h-[150px] cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />

        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
            {placeholderText}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearSignature}
          className="text-xs text-rwdm-blue hover:text-rwdm-red dark:text-blue-400 dark:hover:text-red-400 transition-colors"
        >
          {clearText}
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
