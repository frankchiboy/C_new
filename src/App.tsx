import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { UIProvider } from './contexts/UIContext';
import Layout from './components/layout/Layout';
import WelcomePage from './pages/WelcomePage';
import ProjectPage from './pages/ProjectPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <Router>
      <FileSystemProvider>
        <ProjectProvider>
          <UIProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<WelcomePage />} />
                <Route path="project/:id" element={<ProjectPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </UIProvider>
        </ProjectProvider>
      </FileSystemProvider>
    </Router>
  );
}

export default App;