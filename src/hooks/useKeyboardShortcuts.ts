import { useEffect } from 'react';

export type KeyboardShortcut = {
  key: string;
  callback: () => void;
  condition?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const condition = shortcut.condition !== undefined ? shortcut.condition : true;
        
        if (event.key === shortcut.key && condition) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;