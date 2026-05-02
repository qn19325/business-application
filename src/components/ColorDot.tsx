interface ColorDotProps {
  color: string;
  className?: string;
}

export default function ColorDot({ color, className }: ColorDotProps) {
  return <div className={`h-3 w-3 rounded-full ${color} ${className ?? ''}`} />;
}
