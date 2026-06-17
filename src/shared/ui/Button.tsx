import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-copper text-silk hover:bg-copper-dark active:bg-copper-dark focus-visible:ring-2 focus-visible:ring-copper/50',
  secondary:
    'bg-silk text-text-primary border border-trace hover:border-copper active:bg-copper-light/30 focus-visible:ring-2 focus-visible:ring-copper/50',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-silk active:bg-trace/20 focus-visible:ring-2 focus-visible:ring-copper/50',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
  lg: 'px-5 py-2 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm font-body font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
