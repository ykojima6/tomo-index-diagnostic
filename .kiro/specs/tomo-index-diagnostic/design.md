# 設計書

## 概要

ToMo指数診断サイトは、シングルページアプリケーション（SPA）として設計され、ユーザーが6つの質問に回答し、リアルタイムでスコア計算と結果表示を行うWebアプリケーションです。フロントエンドのみで完結するクライアントサイド実装により、高速な応答性と簡単なデプロイメントを実現します。

## アーキテクチャ

### システム構成
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ユーザー      │◄──►│  Webブラウザ     │◄──►│  静的ホスティング │
│   (モバイル/PC) │    │  (SPA)          │    │  (Vercel/Netlify)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 技術スタック
- **フロントエンド**: React 18 + TypeScript
- **スタイリング**: Tailwind CSS + Headless UI
- **チャート**: Chart.js または Recharts
- **状態管理**: React Context + useReducer
- **ルーティング**: React Router
- **ビルドツール**: Vite
- **デプロイメント**: Vercel または Netlify

### アプリケーション構造
```
src/
├── components/           # 再利用可能なUIコンポーネント
│   ├── ui/              # 基本UIコンポーネント
│   ├── charts/          # グラフコンポーネント
│   └── forms/           # フォーム関連コンポーネント
├── pages/               # ページコンポーネント
│   ├── Landing.tsx      # ランディングページ
│   ├── Diagnostic.tsx   # 診断ページ
│   └── Results.tsx      # 結果ページ
├── hooks/               # カスタムフック
├── utils/               # ユーティリティ関数
├── types/               # TypeScript型定義
└── constants/           # 定数定義
```

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. App.tsx
- アプリケーションのルートコンポーネント
- ルーティング設定
- グローバル状態の提供

#### 2. Landing.tsx
- 診断の説明表示
- 利用方法と注意点の表示
- 「診断を始める」ボタン

#### 3. Diagnostic.tsx
- 6つの質問の順次表示
- 1-7スケールの入力フォーム
- 進行状況インジケーター
- バリデーション機能

#### 4. Results.tsx
- 総合スコア表示
- ポジティブ/ネガティブ要因のグラフ
- 各質問の寄与度グラフ
- スコア帯別コメント表示
- 再診断・共有ボタン

#### 5. ScoreChart.tsx
- 棒グラフコンポーネント
- レスポンシブ対応
- アクセシビリティ対応

### インターフェース設計

```typescript
// 診断回答の型定義
interface DiagnosticAnswer {
  questionId: number;
  value: number; // 1-7
}

// 診断結果の型定義
interface DiagnosticResult {
  totalScore: number;
  positiveScore: number;
  negativeScore: number;
  questionContributions: QuestionContribution[];
  commentary: string;
  scoreLevel: ScoreLevel;
}

// 質問寄与度の型定義
interface QuestionContribution {
  questionId: number;
  questionText: string;
  rawValue: number;
  weightedValue: number;
  weight: number;
}

// スコアレベルの型定義
type ScoreLevel = 'very-good' | 'good' | 'neutral' | 'low' | 'needs-improvement';
```

## データモデル

### 質問データ
```typescript
const QUESTIONS = [
  {
    id: 1,
    text: "今の仕事を続けているのは仕事そのものが楽しいから",
    weight: 10,
    type: 'positive'
  },
  {
    id: 2,
    text: "今の仕事を続けているのは重要な目的があると思うから",
    weight: 5,
    type: 'positive'
  },
  {
    id: 3,
    text: "今の仕事を続けているのは目標達成に有益だから",
    weight: 1.66,
    type: 'positive'
  },
  {
    id: 4,
    text: "今の仕事を続けているのは辞めたら人を落胆させるから",
    weight: -1.66,
    type: 'negative'
  },
  {
    id: 5,
    text: "今の仕事を続けているのは金銭上の目標を失うから",
    weight: -5,
    type: 'negative'
  },
  {
    id: 6,
    text: "今の仕事を続ける妥当な理由はない",
    weight: -10,
    type: 'negative'
  }
];
```

### スコア計算ロジック
```typescript
const calculateScore = (answers: DiagnosticAnswer[]): DiagnosticResult => {
  const contributions = answers.map(answer => {
    const question = QUESTIONS.find(q => q.id === answer.questionId);
    const weightedValue = answer.value * question.weight;
    return {
      questionId: answer.questionId,
      questionText: question.text,
      rawValue: answer.value,
      weightedValue,
      weight: question.weight
    };
  });

  const totalScore = contributions.reduce((sum, contrib) => sum + contrib.weightedValue, 0);
  const positiveScore = contributions
    .filter(c => c.weight > 0)
    .reduce((sum, contrib) => sum + contrib.weightedValue, 0);
  const negativeScore = Math.abs(contributions
    .filter(c => c.weight < 0)
    .reduce((sum, contrib) => sum + contrib.weightedValue, 0));

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    positiveScore,
    negativeScore,
    questionContributions: contributions,
    commentary: getCommentary(totalScore),
    scoreLevel: getScoreLevel(totalScore)
  };
};
```

## エラーハンドリング

### エラー種別と対応

1. **バリデーションエラー**
   - 未回答質問の検出
   - リアルタイムフィードバック
   - 進行ブロック機能

2. **計算エラー**
   - スコア計算失敗時の処理
   - フォールバック表示
   - エラーログ記録

3. **共有URLエラー**
   - 署名検証失敗
   - 改ざん検出
   - 適切なエラーメッセージ

### エラー処理実装
```typescript
const ErrorBoundary: React.FC = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('診断エラー:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }

  return <>{children}</>;
};
```

## テスト戦略

### テスト種別

1. **単体テスト**
   - スコア計算ロジック
   - バリデーション関数
   - ユーティリティ関数
   - カバレッジ目標: 90%以上

2. **コンポーネントテスト**
   - React Testing Library使用
   - ユーザーインタラクションテスト
   - アクセシビリティテスト

3. **統合テスト**
   - ページ間遷移
   - データフロー
   - エラーハンドリング

4. **E2Eテスト**
   - Playwright使用
   - 主要ユーザーフロー
   - クロスブラウザテスト

### テストケース例
```typescript
describe('スコア計算', () => {
  test('最高スコアの計算', () => {
    const answers = [7, 7, 7, 1, 1, 1].map((value, index) => ({
      questionId: index + 1,
      value
    }));
    const result = calculateScore(answers);
    expect(result.totalScore).toBeCloseTo(99.96);
  });

  test('最低スコアの計算', () => {
    const answers = [1, 1, 1, 7, 7, 7].map((value, index) => ({
      questionId: index + 1,
      value
    }));
    const result = calculateScore(answers);
    expect(result.totalScore).toBeCloseTo(-99.96);
  });
});
```

## アクセシビリティ対応

### 実装要件

1. **キーボードナビゲーション**
   - Tab順序の適切な設定
   - フォーカス管理
   - ショートカットキー対応

2. **スクリーンリーダー対応**
   - 適切なARIA属性
   - セマンティックHTML
   - 代替テキスト

3. **視覚的配慮**
   - 十分なコントラスト比
   - フォーカスインジケーター
   - 拡大表示対応

### 実装例
```typescript
const QuestionScale: React.FC<QuestionScaleProps> = ({ question, value, onChange }) => {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-medium">{question.text}</legend>
      <div 
        className="flex justify-between items-center"
        role="radiogroup"
        aria-labelledby={`question-${question.id}`}
      >
        <span className="text-sm text-gray-600">全く違う</span>
        {[1, 2, 3, 4, 5, 6, 7].map(num => (
          <label key={num} className="flex flex-col items-center">
            <input
              type="radio"
              name={`question-${question.id}`}
              value={num}
              checked={value === num}
              onChange={() => onChange(num)}
              className="sr-only"
              aria-describedby={`scale-${num}`}
            />
            <span 
              className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                value === num ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}
              id={`scale-${num}`}
            />
            <span className="text-xs mt-1">{num}</span>
          </label>
        ))}
        <span className="text-sm text-gray-600">全くそのとおりである</span>
      </div>
    </fieldset>
  );
};
```

## セキュリティ対策

### 結果共有のセキュリティ

1. **署名トークン実装**
   - HMAC-SHA256による署名
   - タイムスタンプ付きトークン
   - 改ざん検証機能

2. **URL構造**
   ```
   /results?data=<base64_encoded_result>&signature=<hmac_signature>&timestamp=<unix_timestamp>
   ```

3. **実装例**
   ```typescript
   const generateShareUrl = (result: DiagnosticResult): string => {
     const data = btoa(JSON.stringify(result));
     const timestamp = Date.now();
     const payload = `${data}.${timestamp}`;
     const signature = generateHMAC(payload, SECRET_KEY);
     
     return `/results?data=${data}&signature=${signature}&timestamp=${timestamp}`;
   };

   const verifyShareUrl = (data: string, signature: string, timestamp: string): boolean => {
     const payload = `${data}.${timestamp}`;
     const expectedSignature = generateHMAC(payload, SECRET_KEY);
     
     // 署名検証とタイムスタンプ検証（24時間有効）
     return signature === expectedSignature && 
            (Date.now() - parseInt(timestamp)) < 24 * 60 * 60 * 1000;
   };
   ```

## パフォーマンス最適化

### 最適化戦略

1. **コード分割**
   - ページ単位での遅延読み込み
   - チャートライブラリの動的インポート

2. **バンドル最適化**
   - Tree shaking
   - 不要な依存関係の除去
   - 圧縮とminification

3. **レンダリング最適化**
   - React.memo使用
   - useMemoとuseCallbackの適切な使用
   - 仮想化（必要に応じて）

4. **キャッシュ戦略**
   - ブラウザキャッシュ活用
   - Service Worker（PWA化時）

## デプロイメント戦略

### 静的サイトホスティング
- **推奨**: Vercel（自動デプロイ、プレビュー機能）
- **代替**: Netlify、GitHub Pages

### CI/CDパイプライン
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### 環境設定
```typescript
// config/environment.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  secretKey: process.env.VITE_SECRET_KEY || 'default-dev-key',
  analyticsId: process.env.VITE_ANALYTICS_ID,
};
```