import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/50 dark:to-indigo-900/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* メインタイトル */}
            <div className="mb-8">
              <h1 className="mb-6 text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ToMo指数
                </span>
                <br />
                <span className="text-slate-800 dark:text-slate-200 text-4xl lg:text-6xl">
                  診断
                </span>
              </h1>
              <div className="relative">
                <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  仕事への動機づけを<span className="font-semibold text-blue-600 dark:text-blue-400">科学的に分析</span>し、<br />
                  <span className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    -100〜+100
                  </span>のスコアで可視化する診断ツール
                </p>
              </div>
            </div>

            {/* CTAボタン */}
            <div className="mb-16">
              <Link to="/diagnostic" aria-label="診断を始める">
                <Button 
                  size="lg"
                  className="px-12 py-4 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    診断を始める
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container pb-20">
        <div className="mx-auto max-w-6xl">
          {/* 特徴カード */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            {[
              {
                icon: "📊",
                title: "科学的分析",
                description: "心理学に基づく6つの質問で動機づけを多角的に評価",
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: "📈",
                title: "視覚的表示", 
                description: "結果を直感的に理解できるグラフとチャートで表示",
                gradient: "from-emerald-500/10 to-green-500/10"
              },
              {
                icon: "🔗",
                title: "結果共有",
                description: "診断結果を安全に共有し、チームでの活用も可能",
                gradient: "from-purple-500/10 to-pink-500/10"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    <div className="mb-6 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-inner">
                        <span className="text-3xl">{feature.icon}</span>
                      </div>
                    </div>
                    <h3 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-200">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                簡単3ステップ
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                数分で完了する簡単な診断プロセス
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "質問に回答",
                  description: "6つの質問に1〜7のスケールで直感的に回答"
                },
                {
                  step: "02", 
                  title: "結果確認",
                  description: "リアルタイムで計算された詳細な分析結果を確認"
                },
                {
                  step: "03",
                  title: "結果共有",
                  description: "結果をチームと共有し、組織の改善に活用"
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-200">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full">
                      <svg className="w-full h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 200 32">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 16h180m-10-6l6 6-6 6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

