/**
 * Ion Design System — Central Barrel
 *
 * @example
 * import { Button, Card, Badge, TOKENS } from '@/design-system';
 */

// UI Components
export { Button, buttonVariants } from '@/components/ui/button';
export type { ButtonProps } from '@/components/ui/button';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Separator } from '@/components/ui/separator';
export { Slider } from '@/components/ui/slider';
export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export { Badge, badgeVariants } from '@/components/ui/badge';
export type { BadgeProps } from '@/components/ui/badge';

// Toast (Sonner)
export { toast } from 'sonner';

// Design Tokens
export { TOKENS } from './tokens';
