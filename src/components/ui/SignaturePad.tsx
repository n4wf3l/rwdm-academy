
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onChange: (signatureData: string | null) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onChange,
  className,
  label = "Signature",
  placeholder = "Signez ici"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas to be responsive
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = 150;
      }
      
      // Reset canvas with white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing style
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#1A365D'; // RWDM Blue
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let clientX: number, clientY: number;

    if ('touches' in e) {
      // Touch event
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      // Mouse event
      const rect = canvas.getBoundingClientRect();
      clientX = e.clientX - rect.left;
      clientY = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(clientX, clientY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let clientX: number, clientY: number;

    if ('touches' in e) {
      // Touch event
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      // Mouse event
      const rect = canvas.getBoundingClientRect();
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
      const signatureData = canvasRef.current?.toDataURL('image/png');
      onChange(signatureData || null);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
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
            {placeholder}
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearSignature}
          className="text-xs text-rwdm-blue hover:text-rwdm-red dark:text-blue-400 dark:hover:text-red-400 transition-colors"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
