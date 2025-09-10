import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

type ErrorBoundaryState = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    // In a real app, log to an error reporting service
    console.error('ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-8">
          <h1 className="text-2xl font-semibold mb-2">診断結果を表示できません</h1>
          <p className="text-gray-600 dark:text-gray-300">申し訳ありません。問題が発生しました。</p>
          {this.state.message && (
            <p className="mt-2 text-sm text-gray-500">詳細: {this.state.message}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={() => window.location.reload()} variant="secondary">再読み込み</Button>
            <Link to="/">
              <Button>トップへ戻る</Button>
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
