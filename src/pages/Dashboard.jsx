import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  Send, 
  Download, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ReportPDFModal from '../components/ReportPDFModal';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [issues, setIssues] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/submissions').then(r => r.json()),
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/issues').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([subs, tpls, isss, stgs]) => {
      setSubmissions(subs || []);
      setTemplates(tpls || []);
      setIssues(isss || []);
      setSettings(stgs || {});
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const totalInspections = submissions.length;
  const avgScore = totalInspections > 0
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / totalInspections).toFixed(1)
    : 100;
  const openIssuesCount = issues.filter(i => i.status !== 'Resolved').length;

  // Chart data calculation
  const chartData = [...submissions].reverse().slice(-7).map((s, idx) => ({
    name: `Audit ${idx + 1}`,
    score: parseFloat(s.score.toFixed(1)),
    date: new Date(s.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-200 border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" /> {settings.companyName || 'TechHarmonix'} Office Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Digital Office Inspection Engine</h1>
            <p className="text-blue-100/80 text-sm max-w-xl">
              Conduct instant audits for restrooms, cleaning, safety, facilities, and IT. Automatically generate issues and dispatch PDF reports to Telegram.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/inspections/new"
              className="inline-flex items-center px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 mr-2 text-blue-700" /> Launch New Audit
            </Link>
            <Link
              to="/apk"
              className="inline-flex items-center px-4 py-3 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all"
            >
              <Smartphone className="w-4 h-4 mr-2" /> Mobile App & APK
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Average Compliance</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-900">{avgScore}%</div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Target Threshold ≥ 90%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Completed Audits</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-gray-900">{totalInspections}</div>
            <span className="text-xs font-medium text-gray-500 mt-1 block">
              Across all office locations
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Open Action Items</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">{openIssuesCount}</div>
            <span className="text-xs font-medium text-amber-700 mt-1 block">
              Requires janitorial/IT fix
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Telegram Bot Delivery</span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {settings.telegramBotToken && settings.telegramChatId ? 'ACTIVE ✅' : 'CONFIG NEEDED'}
            </div>
            <Link to="/settings" className="text-xs font-medium text-cyan-600 hover:underline mt-1 block">
              Configure Bot Token & Chat ID &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Compliance Trend Chart + Quick Audit Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Audit Compliance Trend</h3>
              <p className="text-xs text-gray-500">Recent overall inspection scores</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                    formatter={(val) => [`${val}%`, 'Compliance Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                No inspection data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch Checklists */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pre-built Office Templates</h3>
            <p className="text-xs text-gray-500 mb-4">Click to start immediate field audit</p>

            <div className="space-y-3">
              {templates.slice(0, 3).map((tpl) => (
                <Link
                  key={tpl.id}
                  to={`/inspections/new?templateId=${tpl.id}`}
                  className="block p-3.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">
                      {tpl.category}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-1.5 group-hover:text-blue-700">{tpl.title}</h4>
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/templates"
            className="mt-4 block text-center text-xs font-bold text-blue-600 hover:text-blue-800 py-2 bg-blue-50 rounded-xl border border-blue-100"
          >
            View All Checklists & Custom Builder &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Completed Audits</h3>
            <p className="text-xs text-gray-500">View detailed reports, download PDFs, or share to Telegram</p>
          </div>
          <Link to="/inspections" className="text-xs font-bold text-blue-600 hover:underline">
            View All History &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3.5 px-6">Checklist</th>
                <th className="py-3.5 px-4">Inspector & Location</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">
                    No inspection audits recorded yet. Launch your first audit!
                  </td>
                </tr>
              ) : (
                submissions.slice(0, 5).map((sub) => {
                  const isPass = sub.score >= 90;
                  const isWarn = sub.score >= 75 && sub.score < 90;

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {sub.templateTitle}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        <span className="font-semibold block text-gray-800">{sub.inspectorName}</span>
                        <span className="text-gray-400">{sub.location || 'HQ Office'}</span>
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
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 mr-1" /> View & PDF
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

      {/* PDF Modal */}
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
