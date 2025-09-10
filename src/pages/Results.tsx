import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDiagnostic } from '../state/DiagnosticContext';
import { calculateScore } from '../utils/scoring';
import Button from '../components/ui/Button';
import ScoreChart from '../components/charts/ScoreChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { QUESTIONS } from '../constants/questions';
import { generateShareUrl, validateShareParams } from '../utils/share';
import { getRecentStatistics } from '../utils/database';
import { getStatisticsFromServer } from '../utils/api';

export default function Results() {
  const { state, loadAnswers, reset } = useDiagnostic();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const [fromShare, setFromShare] = useState(false);

  useEffect(() => {
    const data = params.get('data');
    const ts = params.get('ts');
    const sig = params.get('sig');
    if (data && ts && sig) {
      validateShareParams(data, ts, sig).then((res) => {
        if (res.valid && res.answers) {
          loadAnswers(res.answers);
          setFromShare(true);
        } else {
          setError(res.error || '共有URLの検証に失敗しました。');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasUnanswered = false; // 4も有効な回答として扱う
  const result = useMemo(() => calculateScore(state.answers), [state.answers]);
  const [statistics, setStatistics] = useState({ count: 0, average: 0, median: 0, min: 0, max: 0, totalCount: 0 });

  // Load statistics from server on component mount
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const serverStats = await getStatisticsFromServer(30);
        setStatistics(serverStats);
      } catch (error) {
        // Fallback to local storage
        const localStats = getRecentStatistics(30);
        setStatistics(localStats);
      }
    };
    
    loadStatistics();
  }, []);

  const positive = QUESTIONS.filter((q) => q.weight > 0).map((q) => ({
    label: `${q.id}. ${q.text}`,
    value: (state.answers.find((a) => a.questionId === q.id)?.value || 0) * q.weight,
    color: '#16a34a',
  }));
  const negative = QUESTIONS.filter((q) => q.weight < 0).map((q) => ({
    label: `${q.id}. ${q.text}`,
    value: Math.abs((state.answers.find((a) => a.questionId === q.id)?.value || 0) * q.weight),
    color: '#dc2626',
  }));

  const onShare = async () => {
    try {
      const url = await generateShareUrl(window.location.origin + '/results', state.answers);
      setShareLink(url);
    } catch (e) {
      setError('共有リンクの生成に失敗しました。');
    }
  };


  return (
    <main className="container py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">診断結果</h1>
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            </div>
          )}
        </header>

        {hasUnanswered && !fromShare ? (
          <section className="mb-8">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <h2 className="font-semibold mb-2">未回答の質問があります</h2>
              <p className="text-sm mb-4">診断に戻って全ての質問に回答してください。</p>
              <Link to="/diagnostic">
                <Button variant="secondary">診断に戻る</Button>
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-8">
              {/* メインスコア表示 */}
              <div className="text-center mb-8">
                <div className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  あなたのToMo指数は...
                </div>
                <div className="text-6xl font-bold text-orange-500 mb-2">
                  {result.totalScore.toFixed(2)}<span className="text-3xl">点</span>です
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  点数は-100点から+100点の範囲となります。
                </div>
                <p className="text-gray-700 dark:text-gray-300">{result.commentary}</p>
              </div>

              {/* 統計データ（上部に配置） */}
              {statistics.count > 0 && (
                <div className="mb-8">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/50 dark:to-indigo-900/50 p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-center mb-6">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">📊 診断統計データ</span>
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-4">
                        <div className="text-center">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-1">
                              {result.totalScore.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              あなたのスコア
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                              {statistics.average}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              平均スコア
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
                              {statistics.median}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              中央値
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-1">
                              {statistics.count}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              総回答者数
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 相対的な位置表示 */}
                      <div className="mt-6 text-center space-y-3">
                        <div className="inline-flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            あなたは平均より
                            {result.totalScore > statistics.average ? (
                              <span className="ml-1 inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                                <span className="mr-1">📈</span>
                                {(result.totalScore - statistics.average).toFixed(1)}点高い
                              </span>
                            ) : result.totalScore === statistics.average ? (
                              <span className="ml-1 inline-flex items-center text-slate-600 dark:text-slate-400 font-semibold">
                                <span className="mr-1">⚖️</span>
                                同じ
                              </span>
                            ) : (
                              <span className="ml-1 inline-flex items-center text-amber-600 dark:text-amber-400 font-semibold">
                                <span className="mr-1">📉</span>
                                {(statistics.average - result.totalScore).toFixed(1)}点低い
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ※ただし、デフォルトの選択肢で回答している点数が0点の人を除く
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </>
        )}

        {!hasUnanswered && (
          <section className="mb-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">📈</span>
                  ポジティブ要因の寄与
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreChart bars={positive} max={100} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-red-600 dark:text-red-400">📉</span>
                  ネガティブ要因の寄与
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreChart bars={negative} max={100} />
              </CardContent>
            </Card>
          </section>
        )}

        {!hasUnanswered && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-xl">あなたの回答</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {QUESTIONS.map((q) => {
                  const answer = state.answers.find(a => a.questionId === q.id);
                  const userValue = answer?.value || 4;
                  
                  return (
                    <div key={q.id} className="space-y-4">
                      {/* 質問文 */}
                      <div className="flex items-start gap-3">
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-lg mt-1">
                          {q.id}.
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {q.text.split('は').map((part, i) => 
                              i === 1 ? (
                                <span key={i} className="text-orange-500 font-medium">
                                  は{part}
                                </span>
                              ) : (
                                part + (i === 0 ? 'は' : '')
                              )
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {/* スケール表示 */}
                      <div className="ml-8">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                          <span>全く違う</span>
                          <span>全くそのとおりである</span>
                        </div>
                        
                        {/* ラジオボタン表示 */}
                        <div className="flex items-center justify-between gap-2">
                          {Array.from({ length: 7 }, (_, i) => i + 1).map((value) => (
                            <div key={value} className="flex flex-col items-center gap-2">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                userValue === value
                                  ? 'bg-blue-500 border-blue-500 shadow-lg ring-4 ring-blue-200 dark:ring-blue-800'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400'
                              }`}>
                                {userValue === value && (
                                  <div className="w-3 h-3 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className={`text-sm font-medium transition-colors ${
                                userValue === value
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 p-4 bg-slate-100/70 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <span>📝</span>
                    回答スケール: 1 (全く違う) 〜 7 (全くそのとおりである)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {!fromShare && !hasUnanswered && (
            <Button onClick={onShare} className="flex items-center gap-2">
              <span>🔗</span>
              結果を共有
            </Button>
          )}
          <Link to="/diagnostic">
            <Button variant="secondary" onClick={() => reset()} className="flex items-center gap-2">
              <span>🔄</span>
              再診断
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <span>🏠</span>
              ホームに戻る
            </Button>
          </Link>
        </div>

        {/* Twitter シェアボタン */}
        {!hasUnanswered && (
          <div className="text-center mt-8">
            <div className="mb-4 text-gray-700 dark:text-gray-300 font-medium">
              結果をシェアする
            </div>
            <button
              onClick={() => {
                const text = `あなたのToMo指数は${result.totalScore.toFixed(2)}点です。点数は-100点から+100点の範囲となります。%0A%0A#ToMo指数診断`;
                const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
              aria-label="Twitterでシェア"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
          </div>
        )}

        {shareLink && !hasUnanswered && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔗</span>
                共有用URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="break-words text-blue-700 dark:text-blue-400 font-mono text-sm mb-3">
                  <a href={shareLink} className="hover:underline">{shareLink}</a>
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigator.clipboard.writeText(shareLink)}
                    className="text-xs"
                  >
                    URLをコピー
                  </Button>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  ⚠️ 注意: クライアントサイド実装のため完全な改ざん防止ではありません。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
