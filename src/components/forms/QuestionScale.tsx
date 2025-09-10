import React from 'react';

type Props = {
  name: string;
  legend: string;
  value: number; // 0-7 (0 = 未選択)
  onChange: (value: number) => void;
};

export default function QuestionScale({ name, legend, value, onChange }: Props) {
  const id = React.useId();
  const options = Array.from({ length: 7 }, (_, i) => i + 1);
  const groupName = `${name}-${id}`;
  
  return (
    <fieldset className="space-y-6">
      <legend className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
        {legend}
      </legend>
      
      <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
        <span className="text-left">全く違う</span>
        <span className="text-right">全くそのとおりである</span>
      </div>
      
      <div className="flex items-center justify-between gap-2 px-2" role="radiogroup" aria-label={legend}>
        {options.map((opt) => (
          <label 
            key={opt} 
            className={`flex flex-col items-center gap-2 cursor-pointer group transition-transform hover:scale-110 ${
              value === opt ? 'scale-110' : ''
            }`}
          >
            <div className="relative">
              <input
                className="sr-only"
                type="radio"
                name={groupName}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                aria-checked={value === opt}
              />
              <div className={`
                h-8 w-8 rounded-full border-2 transition-all duration-200 ease-in-out
                ${value === opt 
                  ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-200 dark:ring-blue-800' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'
                }
              `}>
                {value === opt && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </div>
            <span className={`
              text-sm font-medium transition-colors
              ${value === opt 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }
            `}>
              {opt}
            </span>
          </label>
        ))}
      </div>
      
      {value > 0 && (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            選択: {value}
          </span>
        </div>
      )}
    </fieldset>
  );
}

