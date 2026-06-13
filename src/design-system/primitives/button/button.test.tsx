import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('renders variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders sizes', () => {
    const { rerender } = render(<Button size="x-small">XS</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="small">S</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="medium">M</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="large">L</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows loading spinner and disables', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards className', () => {
    render(<Button className="custom-class">Styled</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards additional HTML attributes', () => {
    render(<Button data-testid="test-btn" type="submit">Submit</Button>);
    const btn = screen.getByTestId('test-btn');
    expect(btn).toHaveAttribute('type', 'submit');
  });
});
