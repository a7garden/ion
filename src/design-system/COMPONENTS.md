# Components

## Button

5 variants, 4 sizes, loading state.

```tsx
import { Button } from '../design-system';

// Variants
<Button variant="primary">    // Filled, brand color
<Button variant="secondary">  // Subtle background
<Button variant="ghost">      // Transparent
<Button variant="outline">    // Bordered
<Button variant="destructive"> // Error/delete actions

// Sizes
<Button size="x-small">
<Button size="small">
<Button size="medium">  // default
<Button size="large">

// States
<Button loading>           // Shows spinner, disables
<Button disabled>          // 40% opacity, no interaction
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'destructive'` | `'primary'` | Visual style |
| size | `'x-small' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| loading | `boolean` | `false` | Shows spinner |
| disabled | `boolean` | `false` | Disables interaction |

---

## Input

4 sizes, error state, box-shadow borders.

```tsx
import { Input } from '../design-system';

<Input inputSize="medium" placeholder="Enter text..." />
<Input inputSize="medium" error placeholder="With error" />
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| inputSize | `'x-small' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| error | `boolean` | `false` | Shows error styling |
| All other HTML input attributes | | | Inherited |

---

## Card

Compound component with Header, Title, Description, Content, Footer.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../design-system';
import { Button } from '../design-system';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

---

## Dialog

Radix-based compound component.

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../design-system';

<Dialog>
  <DialogTrigger asChild>
    <Button variant="primary">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p>Dialog content here</p>
    </div>
    <DialogClose asChild>
      <Button variant="ghost">Close</Button>
    </DialogClose>
  </DialogContent>
</Dialog>
```

## Accessibility

All components:
- Focus-visible ring using `var(--border-focus)`
- ARIA attributes where applicable (`aria-invalid` on Input)
- Keyboard navigation via Radix primitives (Dialog: Escape to close, focus trap)
- Disabled states at 40% opacity
- Touch targets minimum 44×44px
