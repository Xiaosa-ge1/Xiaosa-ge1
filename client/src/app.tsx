import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage/HomePage';
import PlansPage from './pages/PlansPage/PlansPage';
import DiaryPage from './pages/DiaryPage/DiaryPage';
import CheckinPage from './pages/CheckinPage/CheckinPage';
import AiChatPage from './pages/AiChatPage/AiChatPage';
import PhotoWallPage from './pages/PhotoWallPage/PhotoWallPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import NotFound from './pages/NotFound/NotFound';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="checkin" element={<CheckinPage />} />
        <Route path="ai-chat" element={<AiChatPage />} />
        <Route path="photo-wall" element={<PhotoWallPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
