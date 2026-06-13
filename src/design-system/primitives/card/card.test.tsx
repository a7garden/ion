import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders basic card with content', () => {
    render(<Card><CardContent>Content</CardContent></Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders compound structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('forwards className to Card', () => {
    render(<Card className="custom-card"><CardContent>Test</CardContent></Card>);
    expect(screen.getByText('Test').parentElement).toHaveClass('custom-card');
  });

  it('renders CardTitle as heading element', () => {
    render(<Card><CardHeader><CardTitle>Heading</CardTitle></CardHeader></Card>);
    const heading = screen.getByText('Heading');
    expect(heading.tagName).toBe('H3');
  });
});
