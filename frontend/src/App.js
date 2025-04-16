import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserProfiles from './pages/UserProfiles';
import UserDetail from './pages/UserDetail';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserProfiles />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App; 