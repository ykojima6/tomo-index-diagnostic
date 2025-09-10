import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ 
  variant = 'primary', 
  size = 'md',
  className = '', 
  children,
  disabled,
  ...props 
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 active:scale-95';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  } as const;
  
  const styles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500 shadow-md hover:shadow-lg',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 shadow-sm hover:shadow-md',
    ghost: 
      'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-400',
    success:
      'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500 shadow-md hover:shadow-lg',
    danger:
      'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500 shadow-md hover:shadow-lg',
  } as const;
  
  return (
    <button 
      className={`${base} ${sizeStyles[size]} ${styles[variant]} ${className} ${
        disabled ? 'cursor-not-allowed opacity-50 hover:scale-100' : ''
      }`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

