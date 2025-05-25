import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('index.tsx загружается');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('root элемент получен');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App отрендерен');