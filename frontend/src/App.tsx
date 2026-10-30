import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import ProjectDetailPage from './pages/ProjectDetail';
import TestGeneratorPage from './pages/TestGenerator';
import PlaywrightReportPage from './pages/PlaywrightReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Upload & Requirement Specs Page */}
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        {/* Dynamic Test Generator & Automation Workspace */}
        <Route path="/projects/:projectId/generate" element={<TestGeneratorPage />} />
        <Route path="/projects/:id/generate" element={<TestGeneratorPage />} />

        {/* Visual Playwright HTML Report */}
        <Route path="/reports" element={<PlaywrightReportPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}