type Props = {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
};

export default function Progress({ 
  value, 
  label, 
  showPercentage = false,
  color = 'blue',
  size = 'md'
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  
  const colorStyles = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500',
    red: 'bg-red-600 dark:bg-red-500',
    yellow: 'bg-yellow-600 dark:bg-yellow-500',
  } as const;
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  } as const;
  
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && (
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-gray-500 dark:text-gray-400 tabular-nums">
              {v}%
            </span>
          )}
        </div>
      )}
      <div 
        className={`w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden ${sizeStyles[size]}`}
        role="progressbar" 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-valuenow={v}
        aria-label={label || `進捗: ${v}%`}
      >
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${v}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20"></div>
        </div>
      </div>
    </div>
  );
}

