import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';
import { useAuth } from '@/hooks/AuthProvider';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await login();
      onOpenChange(false);
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : '로그인에 실패했습니다', { duration: 2000 });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 shadow-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 text-center">
          <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Welcome</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
            Google 계정으로 로그인하여 피드를 작성하세요
          </p>
        </DialogHeader>
        <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="space-y-2">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl touch-target"
                onClick={handleGoogleLogin}>
                <LogIn className="w-4 h-4 mr-2" />Google 로그인
              </Button>
            </motion.div>
            <Button variant="ghost" className="w-full rounded-xl touch-target" onClick={() => onOpenChange(false)}>취소</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
