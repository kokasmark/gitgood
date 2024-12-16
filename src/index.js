import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import './index.css';
import App from './App';

const RouteWithQuery = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username') || "";
  
  return <App querry={username} />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RouteWithQuery />} />
    </Routes>
  </BrowserRouter>
);
