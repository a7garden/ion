import { motion } from 'framer-motion';
import { PLANET_LIST } from '@/constants/planets';
import type { PlanetKey } from '@/constants/planets';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PlanetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanet: PlanetKey;
  onSelect: (planet: PlanetKey) => void;
}

export function PlanetSelector({ open, onOpenChange, currentPlanet, onSelect }: PlanetSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] w-[calc(100vw-2rem)] rounded-2xl sm:rounded-3xl p-0 gap-0 overflow-hidden border-border/50 warm-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <DialogHeader className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 text-center">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">나의 행성 선택</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
            오직 나만 볼 수 있는 우주 아이덴티티입니다
          </p>
        </DialogHeader>
        <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="grid grid-cols-5 gap-3">
            {PLANET_LIST.map((planet) => (
              <motion.button
                key={planet.key}
                onClick={() => {
                  onSelect(planet.key);
                  onOpenChange(false);
                }}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                  currentPlanet === planet.key
                    ? 'bg-accent/15 ring-2 ring-accent/50'
                    : 'hover:bg-muted/50'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: planet.gradient,
                    boxShadow: currentPlanet === planet.key
                      ? `0 0 12px ${planet.glowColor}, 0 0 24px ${planet.glowColor}40`
                      : `0 1px 4px ${planet.glowColor}20`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground leading-tight">{planet.nameKo}</span>
                {currentPlanet === planet.key && (
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent"
                    layoutId="planet-check"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
