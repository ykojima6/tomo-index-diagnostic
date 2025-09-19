import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getAllResponses, clearAllData, exportData } from '../utils/database';
import { getStatisticsFromServer, type ApiStatistics } from '../utils/api';

export default function Admin() {
  const [responses, setResponses] = useState(getAllResponses());
  const [stats, setStats] = useState<ApiStatistics>({
    count: 0,
    average: 0,
    median: 0,
    min: 0,
    max: 0,
    totalCount: 0,
  });
  const [statsStatus, setStatsStatus] = useState<'loading' | 'server' | 'error'>('loading');
  const [statsError, setStatsError] = useState<string | null>(null);
  const [serverTotalCount, setServerTotalCount] = useState<number>(0);

  const refreshData = async () => {
    setResponses(getAllResponses());
    setStatsStatus('loading');
    setStatsError(null);
    try {
      const serverStats = await getStatisticsFromServer(30);
      setStats(serverStats);
      setServerTotalCount(serverStats.totalCount || 0);
      setStatsStatus('server');
    } catch (error) {
      console.error('Failed to load statistics from server:', error);
      setStats({
        count: 0,
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        totalCount: 0,
      });
      setServerTotalCount(0);
      setStatsStatus('error');
      setStatsError('サーバーから統計データを取得できませんでした。時間をおいて再度お試しください。');
    }
  };

  // Load server statistics on mount
  useEffect(() => {
    refreshData();
  }, []);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tomo-responses-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('本当に全てのデータを削除しますか？この操作は取り消せません。')) {
      clearAllData();
      refreshData();
    }
  };

  return (
    <main className="container py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            管理者パネル
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            回答データの管理と統計の確認
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>統計データ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  総回答数: {statsStatus === 'server' ? serverTotalCount : '-'}件
                  {statsStatus === 'server' && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">● サーバーデータ</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  ローカルデータ: {responses.length}件
                </div>
                {statsStatus === 'loading' && (
                  <div className="text-sm text-gray-500">統計データを読み込み中です...</div>
                )}
                {statsStatus === 'error' && statsError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {statsError}
                  </div>
                )}
                {statsStatus === 'server' && (
                  <>
                    <div>有効回答数: {stats.count}件（0点除く）</div>
                    <div>直近30件の平均: {stats.average}点</div>
                    <div>直近30件の中央値: {stats.median}点</div>
                    <div>最低点: {stats.min}点</div>
                    <div>最高点: {stats.max}点</div>
                    <div className="text-xs text-gray-500 mt-2">
                      ※統計値は0点（デフォルト回答）を除外して計算
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>データ管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={refreshData} className="w-full">
                  データを更新
                </Button>
                <Button onClick={handleExport} variant="secondary" className="w-full">
                  データをエクスポート
                </Button>
                <Button onClick={handleClearData} variant="danger" className="w-full">
                  全データを削除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>最近の回答履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">日時</th>
                    <th className="text-left p-2">総合スコア</th>
                    <th className="text-left p-2">ポジティブ</th>
                    <th className="text-left p-2">ネガティブ</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.slice(0, 50).map((response) => (
                    <tr key={response.id} className="border-b">
                      <td className="p-2 font-mono text-xs">
                        {response.id.substring(0, 8)}...
                      </td>
                      <td className="p-2">
                        {new Date(response.timestamp).toLocaleString('ja-JP')}
                      </td>
                      <td className="p-2 font-bold">
                        {response.totalScore.toFixed(2)}
                      </td>
                      <td className="p-2 text-green-600">
                        +{response.positiveScore.toFixed(2)}
                      </td>
                      <td className="p-2 text-red-600">
                        -{response.negativeScore.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {responses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  まだ回答データがありません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}