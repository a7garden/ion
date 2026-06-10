import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/hooks/AppProvider';
import { Sidebar } from '@/components/Sidebar';

interface StarNode {
  x: number;
  y: number;
  author: string;
  isLiked: boolean;
}

export function WorldPage() {
  const { state } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<StarNode[]>([]);
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const initStars = () => {
      const currentUser = state.currentUser || 'guest';

      const authorSet = new Set<string>();
      state.posts.forEach((post) => {
        authorSet.add(post.authorId);
      });

      const likedAuthors = new Set<string>();
      const userLikes = state.userLikes[currentUser] || [];
      state.posts.forEach((post) => {
        if (userLikes.includes(post.id)) {
          likedAuthors.add(post.authorId);
        }
      });

      const margin = 80;
      const stars: StarNode[] = [];

      authorSet.forEach((author) => {
        const x = margin + Math.random() * (canvas.width - margin * 2);
        const y = margin + Math.random() * (canvas.height - margin * 2);
        stars.push({
          x,
          y,
          author,
          isLiked: likedAuthors.has(author) && author !== currentUser,
        });
      });

      starsRef.current = stars;
    };

    initStars();

    const drawMoon = (x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, '#e8e8e8');
      gradient.addColorStop(1, '#d0d0d0');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawStar = (x: number, y: number, size: number) => {
      ctx.beginPath();

      const spikes = 4;
      const outerRadius = size;
      const innerRadius = size * 0.4;

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentUser = state.currentUser || 'guest';

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const likedStars = starsRef.current.filter((s) => s.isLiked);

      likedStars.forEach((star) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      drawMoon(centerX, centerY, 50);

      starsRef.current.forEach((star) => {
        const isHovered = hoveredStar === star.author;
        const size = isHovered ? 6 : 4;

        ctx.fillStyle = isHovered ? '#60a5fa' : 'rgba(255, 255, 255, 0.7)';
        ctx.shadowColor = isHovered ? '#60a5fa' : '#ffffff';
        ctx.shadowBlur = isHovered ? 12 : 6;

        drawStar(star.x, star.y, size);

        ctx.shadowBlur = 0;

        if (isHovered) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(star.author, star.x, star.y - 12);
        }
      });

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `current user: ${currentUser} | liked: ${likedStars.length} | total users: ${starsRef.current.length}`,
        centerX,
        canvas.height - 20
      );

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [state, state.posts, state.userLikes, state.currentUser, hoveredStar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hovered = starsRef.current.find((star) => {
        const dx = x - star.x;
        const dy = y - star.y;
        return Math.sqrt(dx * dx + dy * dy) < 15;
      });

      setHoveredStar(hovered?.author || null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[400] pt-[60px]">
      <Sidebar />
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
    </div>
  );
}
