import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from './dialog';
import { Button } from '../button/button';

describe('Dialog', () => {
  it('opens and shows content on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('has accessible title and description', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open A11Y</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Accessible Title</DialogTitle>
          <DialogDescription>Accessible Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: /open a11y/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});
