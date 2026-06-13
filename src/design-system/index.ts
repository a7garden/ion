/**
 * Ion Design System — Component Exports
 *
 * Centralized barrel file for all design system components.
 * Import from here instead of individual component files.
 *
 * @example
 * import { Button, Card, Badge, Tabs, TOKENS } from '@/design-system';
 */

// UI Primitive Components
export { Button, buttonVariants } from '@/components/ui/button';
export type { ButtonProps } from '@/components/ui/button';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export { Input } from '@/components/ui/input';

export { Label } from '@/components/ui/label';

export { Separator } from '@/components/ui/separator';

export { Slider } from '@/components/ui/slider';

export { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// New DESIGN.md components
export { Badge, badgeVariants } from '@/components/ui/badge';
export type { BadgeProps } from '@/components/ui/badge';

export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Toast (Sonner)
export { toast } from 'sonner';

// Design Tokens
export { TOKENS } from './tokens';
