import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DiagnosticProvider } from './state/DiagnosticContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DiagnosticProvider>
        <App />
      </DiagnosticProvider>
    </BrowserRouter>
  </React.StrictMode>
);

