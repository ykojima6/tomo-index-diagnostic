import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../constants/questions';
import { useDiagnostic } from '../state/DiagnosticContext';
import QuestionScale from '../components/forms/QuestionScale';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';

export default function Diagnostic() {
  const nav = useNavigate();
  const { state, setAnswer, allAnswered, answeredCount, compute, reset } = useDiagnostic();
  const [idx, setIdx] = useState(0);
  const q = QUESTIONS[idx];
  const answerValue = useMemo(
    () => state.answers.find((a) => a.questionId === q.id)?.value ?? 0,
    [state.answers, q.id]
  );

  const onNext = () => {
    if (idx < QUESTIONS.length - 1) setIdx((i) => i + 1);
  };
  const onPrev = () => {
    if (idx > 0) setIdx((i) => i - 1);
  };
  const onFinish = () => {
    if (!allAnswered) return;
    compute();
    nav('/results');
  };

  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);
  const isLast = idx === QUESTIONS.length - 1;

  // Manual reset only - don't auto-reset since 4 is a valid answer

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-7 for answers
      if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        setAnswer(q.id, parseInt(e.key));
      }
      // Arrow keys for navigation
      else if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        onPrev();
      }
      else if (e.key === 'ArrowRight' && idx < QUESTIONS.length - 1 && answerValue > 0) {
        e.preventDefault();
        onNext();
      }
      // Enter to finish if all answered
      else if (e.key === 'Enter' && isLast && allAnswered) {
        e.preventDefault();
        onFinish();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [idx, answerValue, allAnswered, isLast, q.id, setAnswer, onNext, onPrev, onFinish]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/50 dark:to-indigo-900/50">
      {/* 背景装飾 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/8 to-pink-400/8 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative py-8">
        <div className="mx-auto max-w-3xl">
          {/* ヘッダー */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              ToMo指数診断
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
              6つの質問に1〜7のスケールで回答してください
            </p>
            {answeredCount > 0 && (
              <Button 
                onClick={reset}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                🔄 新しい診断を開始
              </Button>
            )}
          </header>

          {/* プログレスバー */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg">
              <Progress 
                value={progressPct} 
                label={`回答状況: ${answeredCount}/${QUESTIONS.length}`}
                showPercentage={true}
                color={allAnswered ? 'green' : 'blue'}
                size="lg"
              />
            </div>
          </div>

          {/* 質問カード */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
              {/* 質問ヘッダー */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-4 font-bold text-lg">
                    {q.id}
                  </div>
                  <div className="text-sm opacity-90 mb-2">
                    質問 {idx + 1} / {QUESTIONS.length}
                  </div>
                </div>
              </div>

              {/* 質問内容 */}
              <div className="p-8">
                <QuestionScale
                  name={`q-${q.id}`}
                  legend={q.text}
                  value={answerValue}
                  onChange={(v) => setAnswer(q.id, v)}
                />
                
                {/* キーボードショートカット */}
                <div className="mt-6 p-4 bg-slate-100/70 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium mb-2">
                    <span className="text-lg">⌨️</span>
                    キーボードショートカット
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border text-xs">1-7</kbd>
                      <span>回答選択</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border text-xs">← →</kbd>
                      <span>質問の移動</span>
                    </div>
                    {isLast && allAnswered && (
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border text-xs">Enter</kbd>
                        <span>診断完了</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ナビゲーション */}
          <div className="space-y-6">
            {/* 質問ドット */}
            <div className="flex justify-center">
              <div className="flex gap-3 p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                {QUESTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      i === idx
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-125 shadow-lg'
                        : state.answers[i]?.value > 0
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-110'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 hover:scale-110'
                    }`}
                    aria-label={`質問 ${i + 1} に移動`}
                  />
                ))}
              </div>
            </div>

            {/* 操作ボタン */}
            <div className="flex items-center justify-between gap-4">
              <Button 
                variant="secondary" 
                onClick={onPrev} 
                disabled={idx === 0} 
                aria-label="前へ"
                className="flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                前へ
              </Button>

              {!isLast && (
                <Button 
                  onClick={onNext} 
                  disabled={answerValue === 0} 
                  aria-label="次へ"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  次へ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              )}
              
              {isLast && (
                <Button 
                  variant="success"
                  onClick={onFinish} 
                  disabled={!allAnswered} 
                  aria-label="診断結果を見る"
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                >
                  診断結果を見る
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Button>
              )}
            </div>
            
            {/* エラーメッセージ */}
            {!allAnswered && isLast && (
              <div className="mt-6 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-center">
                <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">
                    未回答の質問があります。すべて回答してください。
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

