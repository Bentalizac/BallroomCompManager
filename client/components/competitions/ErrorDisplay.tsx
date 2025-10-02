'use client';

interface ErrorDisplayProps {
  title?: string;
  error: Error | null;
  className?: string;
}

export function ErrorDisplay({ title, error, className = "" }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className={`mt-4 p-3 bg-red-50 border border-red-200 rounded-md ${className}`}>
      <p className="text-sm text-red-600">
        {title && <span className="font-medium">{title}: </span>}
        {error.message}
      </p>
    </div>
  );
}