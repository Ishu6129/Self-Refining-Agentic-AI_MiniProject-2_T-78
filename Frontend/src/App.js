import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage/LandingPage';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import WorkflowBuilder from './pages/WorkflowBuilder/WorkflowBuilder';
import Dashboard from './pages/Dashboard/Dashboard';
import MemoryViewer from './pages/MemoryViewer/MemoryViewer';
import ExecutionHistory from './pages/ExecutionHistory/ExecutionHistory';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspace" element={<WorkflowBuilder />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/memory" element={<MemoryViewer />} />
          <Route path="/history" element={<ExecutionHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
