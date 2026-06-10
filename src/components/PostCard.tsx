import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isDragging: boolean;
  isLiked: boolean;
  onClick: () => void;
  onToggleLike: () => void;
}

export function PostCard({
  post,
  x,
  y,
  size,
  opacity,
  isDragging,
  isLiked,
  onClick,
  onToggleLike,
}: PostCardProps) {
  return (
    <div
      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        transform: `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) ${isDragging ? 'scale(1.08) rotate(2deg)' : 'scale(1)'}`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        touchAction: 'none',
      }}
      onClick={onClick}
    >
      <div
        className="w-full h-full bg-card border border-border rounded-2xl p-4 flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          boxShadow: isDragging
            ? '0 8px 30px rgba(0,0,0,0.2)'
            : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {post.media && (
          <div className="mb-2 flex-shrink-0">
            {post.media.includes('video') || post.media.startsWith('data:video') ? (
              <video
                src={post.media}
                className="w-full h-20 object-cover rounded-lg"
                muted
              />
            ) : (
              <img
                src={post.media}
                alt="Post media"
                className="w-full h-20 object-cover rounded-lg"
              />
            )}
          </div>
        )}
        <div className="text-[11px] font-normal text-muted-foreground flex-1 overflow-hidden line-clamp-4">
          {post.content}
        </div>
        <div className="flex justify-center mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            className="p-1 hover:scale-115 active:scale-95 transition-transform"
          >
            <svg
              className={`w-5 h-5 transition-all duration-200 ${
                isLiked ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-400'
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
