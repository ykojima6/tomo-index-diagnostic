import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
const Landing = React.lazy(() => import('./pages/Landing'));
const Diagnostic = React.lazy(() => import('./pages/Diagnostic'));
const Results = React.lazy(() => import('./pages/Results'));
const Admin = React.lazy(() => import('./pages/Admin'));
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="container py-8">読み込み中...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
