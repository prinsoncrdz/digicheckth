import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Send, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import ReportPDFModal from '../components/ReportPDFModal';

export default function InspectionList() {
  const [submissions, setSubmissions] = useState([]);
  const [settings, setSettings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([subs, stgs]) => {
      setSubmissions(subs || []);
      setSettings(stgs || {});
    }).catch(() => {});
  }, []);

  const filtered = submissions.filter(s => 
    s.templateTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Completed Inspection History</h1>
          <p className="text-xs text-gray-500">Review past office audits, download PDF summaries, and dispatch reports to Telegram.</p>
        </div>
        <Link
          to="/inspections/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          + Launch New Audit
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-7 top-6" />
        <input
          type="text"
          placeholder="Filter by inspector name, office location, or template title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
        />
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-6">Checklist Title</th>
                <th className="py-3.5 px-4">Inspector</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Compliance Score</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Telegram</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                    No inspection submissions found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const isPass = sub.score >= 90;
                  const isWarn = sub.score >= 75 && sub.score < 90;

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {sub.templateTitle}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-gray-700">
                        {sub.inspectorName}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {sub.location || 'HQ Office'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          isPass ? 'bg-green-100 text-green-800' : isWarn ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {sub.telegramSent ? (
                          <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Sent</span>
                        ) : (
                          <span className="text-gray-400">Not Sent</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/inspections/${sub.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Export PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSub && (
        <ReportPDFModal
          submission={selectedSub}
          settings={settings}
          onClose={() => setSelectedSub(null)}
        />
      )}
    </div>
  );
}
