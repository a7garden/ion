import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmptyFeedStateProps {
  onCreatePost: () => void;
}

export function EmptyFeedState({ onCreatePost }: EmptyFeedStateProps) {
  const gradient = 'linear-gradient(135deg, #664ead 0%, #a855f7 50%, #ec4899 100%)';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, hsl(50, 20%, 97%) 0%, hsl(50, 15%, 95%) 50%, hsl(45, 12%, 93%) 100%)',
      }}
    >
      <motion.div
        className="text-center px-8 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: gradient, opacity: 0.15 }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{ background: gradient, opacity: 0.2 }}
          />
          <div
            className="absolute inset-4 rounded-full"
            style={{ background: gradient, opacity: 0.3 }}
          />
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: gradient }}
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: 'hsl(25, 18%, 15%)', fontFamily: 'var(--font-display)' }}
        >
          아직 게시물이 없어요
        </h3>

        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'hsl(25, 14%, 50%)' }}>
          첫 번째 이야기를 시작해보세요.
        </p>

        <Button
          onClick={onCreatePost}
          className="text-white shadow-lg hover:opacity-90 transition-opacity"
          style={{ background: gradient, border: 'none' }}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          게시물 만들기
        </Button>
      </motion.div>
    </div>
  );
}
