import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders sizes', () => {
    const { rerender } = render(<Input inputSize="x-small" placeholder="XS" />);
    expect(screen.getByPlaceholderText('XS')).toBeInTheDocument();

    rerender(<Input inputSize="small" placeholder="S" />);
    expect(screen.getByPlaceholderText('S')).toBeInTheDocument();

    rerender(<Input inputSize="medium" placeholder="M" />);
    expect(screen.getByPlaceholderText('M')).toBeInTheDocument();

    rerender(<Input inputSize="large" placeholder="L" />);
    expect(screen.getByPlaceholderText('L')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is true', () => {
    render(<Input error placeholder="Error" />);
    expect(screen.getByPlaceholderText('Error')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when error is not passed', () => {
    render(<Input placeholder="Normal" />);
    expect(screen.getByPlaceholderText('Normal')).not.toHaveAttribute('aria-invalid');
  });

  it('forwards className', () => {
    render(<Input className="custom" placeholder="Class" />);
    expect(screen.getByPlaceholderText('Class')).toHaveClass('custom');
  });

  it('respects disabled state', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Input ref={ref} placeholder="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
