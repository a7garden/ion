import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useState } from 'react';

interface SetUsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (username: string) => Promise<void>;
}

export function SetUsernameModal({ open, onOpenChange, onSubmit }: SetUsernameModalProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({ description: '이름을 입력해주세요', duration: 2000 });
      return;
    }
    if (username.trim().length < 2) {
      toast({ description: '이름은 2자 이상이어야 합니다', duration: 2000 });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(username.trim());
      toast({ description: `${username}님 환영합니다!`, duration: 2000 });
      onOpenChange(false);
    } catch (error) {
      toast({ description: '이름 설정에 실패했습니다', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 warm-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />

        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 text-center">
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">이름을 설정해주세요</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
            게시물 작성 시 사용될 이름을 입력하세요
          </p>
        </DialogHeader>

        <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="space-y-3">
            <Input
              placeholder="이름 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 rounded-xl touch-target"
                onClick={handleSubmit}
                disabled={loading}
              >
                확인
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
