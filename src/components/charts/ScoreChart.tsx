type Bar = { label: string; value: number; color?: string };

type Props = {
  title?: string;
  bars: Bar[];
  max?: number; // max absolute value, default 100
};

export default function ScoreChart({ title, bars, max = 100 }: Props) {
  const maxValue = Math.max(...bars.map(b => Math.abs(b.value)));
  const effectiveMax = maxValue > 0 ? Math.max(maxValue, max * 0.1) : max;

  return (
    <div>
      {title && <h3 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>}
      <div className="space-y-3">
        {bars.map((b, index) => {
          const pct = Math.min(100, Math.max(2, Math.round((Math.abs(b.value) / effectiveMax) * 100)));
          const isPositive = b.value >= 0;
          
          return (
            <div key={`${b.label}-${index}`} className="w-full">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300 font-medium flex-1 pr-2">
                  {b.label.replace(/^\d+\.\s*/, '')}
                </span>
                <span className={`font-bold tabular-nums ${
                  isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{b.value.toFixed(2)}
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${pct}%`, 
                    backgroundColor: b.color || (isPositive ? '#16a34a' : '#dc2626'),
                    boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1)`
                  }}
                  role="img"
                  aria-label={`${b.label}: ${b.value.toFixed(2)}`}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {bars.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">データがありません</p>
        </div>
      )}
    </div>
  );
}

