import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onCropComplete: (blob: Blob) => void;
}

export function ImageCropModal({ open, onOpenChange, imageFile, onCropComplete }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const isSliderDragging = useRef(false);

  useEffect(() => {
    if (!open || !imageFile) return;
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [open, imageFile]);

  const CANVAS_SIZE = 300;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Dark background
    ctx.fillStyle = 'hsl(var(--muted))';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const scale = Math.min(CANVAS_SIZE / imageEl.width, CANVAS_SIZE / imageEl.height) * zoom;
    const imgW = imageEl.width * scale;
    const imgH = imageEl.height * scale;
    const imgX = (CANVAS_SIZE - imgW) / 2 + offset.x;
    const imgY = (CANVAS_SIZE - imgH) / 2 + offset.y;

    ctx.drawImage(imageEl, imgX, imgY, imgW, imgH);
  }, [imageEl, zoom, offset]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleSliderPointerDown = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    isSliderDragging.current = true;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setZoom(0.5 + ratio * 2);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleSliderPointerMove = (e: React.PointerEvent) => {
    if (!isSliderDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setZoom(0.5 + ratio * 2);
  };

  const handleSliderPointerUp = () => {
    isSliderDragging.current = false;
  };

  const handleCrop = () => {
    if (!imageEl) return;
    const OUTPUT_SIZE = 800;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = OUTPUT_SIZE;
    cropCanvas.height = OUTPUT_SIZE;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    const scale = Math.min(CANVAS_SIZE / imageEl.width, CANVAS_SIZE / imageEl.height) * zoom;
    const imgW = imageEl.width * scale;
    const imgH = imageEl.height * scale;
    const imgX = (CANVAS_SIZE - imgW) / 2 + offset.x;
    const imgY = (CANVAS_SIZE - imgH) / 2 + offset.y;

    // Visible square in original image coordinates
    const sSize = CANVAS_SIZE / scale;
    let sx = -imgX / scale;
    let sy = -imgY / scale;

    // Clamp so source rect stays within image bounds, and shift dest draw accordingly
    let dx = 0;
    let dy = 0;
    if (sx < 0) { dx = (-sx) * (OUTPUT_SIZE / sSize); sx = 0; }
    if (sy < 0) { dy = (-sy) * (OUTPUT_SIZE / sSize); sy = 0; }
    const maxSource = Math.min(sSize, imageEl.width - sx, imageEl.height - sy);
    if (maxSource <= 0) return;
    const drawSourceSize = Math.min(maxSource, sSize);
    const drawDestSize = drawSourceSize * (OUTPUT_SIZE / sSize);

    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(
      imageEl,
      sx, sy, drawSourceSize, drawSourceSize,
      dx, dy, drawDestSize, drawDestSize
    );

    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
        onOpenChange(false);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[500] bg-black/80 cursor-pointer" onClick={() => onOpenChange(false)} />
      <DialogContent className="sm:max-w-[360px] w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 shadow-glow z-[501]">
        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 text-center">
          <DialogTitle className="text-lg font-semibold text-foreground">이미지 크롭</DialogTitle>
          <p className="text-xs text-muted-foreground/70 mt-1">정방형으로 크롭합니다</p>
        </DialogHeader>
        <div className="relative px-5 sm:px-6 flex flex-col items-center gap-3">
          <div className="relative rounded-xl overflow-hidden border border-border/30" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="shrink-0">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div
              ref={sliderRef}
              className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer"
              onPointerDown={handleSliderPointerDown}
              onPointerMove={handleSliderPointerMove}
              onPointerUp={handleSliderPointerUp}
            >
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(zoom - 0.5) / 2 * 100}%` }} />
            </div>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="shrink-0">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative px-5 sm:px-6 py-4 flex gap-2">
          <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" />취소
          </Button>
          <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl" onClick={handleCrop}>
            <Check className="w-4 h-4 mr-1" />크롭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
