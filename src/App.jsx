import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateBuilder from './pages/TemplateBuilder';
import ExecuteInspection from './pages/ExecuteInspection';
import InspectionList from './pages/InspectionList';
import InspectionDetail from './pages/InspectionDetail';
import IssuesList from './pages/IssuesList';
import Settings from './pages/Settings';
import ApkInstructions from './pages/ApkInstructions';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/templates/builder" element={<TemplateBuilder />} />
            <Route path="/inspections/new" element={<ExecuteInspection />} />
            <Route path="/inspections" element={<InspectionList />} />
            <Route path="/inspections/:id" element={<InspectionDetail />} />
            <Route path="/issues" element={<IssuesList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/apk" element={<ApkInstructions />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
          <p>© 2026 TechHarmonix DigiCheck Platform. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
