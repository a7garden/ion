import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <div className={`fixed bottom-[calc(1.5rem+var(--safe-area-bottom))] right-6 z-[450] ${className || ''}`}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 hover:scale-110 active:scale-95 border-2 border-accent/20"
          onClick={onClick}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/30 blur-md -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.15, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}