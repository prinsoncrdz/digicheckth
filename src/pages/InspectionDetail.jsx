import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  User, 
  MapPin, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { generateInspectionPDF } from '../utils/exportPdf';

export default function InspectionDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [settings, setSettings] = useState({});
  const [telegramStatus, setTelegramStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    Promise.all([
      fetch(`/api/submissions/${id}`).then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([sub, stgs]) => {
      setSubmission(sub);
      setSettings(stgs);
    }).catch(() => {});
  }, [id]);

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleSendTelegram = async () => {
    setTelegramStatus({ loading: true, success: false, error: '' });
    try {
      const res = await fetch(`/api/telegram/send-report/${submission.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus({ loading: false, success: true, error: '' });
        setSubmission({ ...submission, telegramSent: true });
      } else {
        setTelegramStatus({ loading: false, success: false, error: data.error || 'Failed' });
      }
    } catch (err) {
      setTelegramStatus({ loading: false, success: false, error: err.message });
    }
  };

  const isPass = submission.score >= 90;
  const isWarn = submission.score >= 75 && submission.score < 90;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link to="/inspections" className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => generateInspectionPDF(submission, settings)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF Report
          </button>
          <button
            onClick={handleSendTelegram}
            disabled={telegramStatus.loading}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> Share to Telegram
          </button>
        </div>
      </div>

      {telegramStatus.error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-medium">
          {telegramStatus.error}
        </div>
      )}
      {telegramStatus.success && (
        <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl text-xs font-medium">
          ✅ Dispatched to Telegram channel successfully!
        </div>
      )}

      {/* Main Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{submission.templateTitle}</h1>
            <p className="text-xs text-gray-500 mt-1">Submission ID: #{submission.id}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-black ${
              isPass ? 'bg-green-100 text-green-800' : isWarn ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            }`}>
              SCORE: {submission.score.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <span className="text-gray-400 font-medium block">Inspector</span>
            <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> {submission.inspectorName}
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Location</span>
            <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> {submission.location || 'HQ Office'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Submitted Date</span>
            <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">Breakdown</span>
            <span className="font-bold text-gray-800 block mt-0.5">
              <span className="text-green-600">{submission.passedItems} Passed</span> / <span className="text-red-600">{submission.failedItems} Failed</span>
            </span>
          </div>
        </div>

        {/* Answer items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Inspection Items Detailed Audit</h3>

          {submission.answers && Object.entries(submission.answers).map(([key, ans]) => {
            const isP = ans.status === 'pass';
            const isF = ans.status === 'fail';

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isF ? 'bg-red-50/60 border-red-200' : 'bg-gray-50/80 border-gray-200'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{ans.label || key}</span>
                  {ans.notes && (
                    <span className="text-xs text-red-700 italic block mt-0.5">Note: {ans.notes}</span>
                  )}
                </div>

                <div className="shrink-0">
                  {isP ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PASS
                    </span>
                  ) : isF ? (
                    <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> FAIL
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">
                      <MinusCircle className="w-3.5 h-3.5 mr-1" /> N/A
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Signature Box */}
        {submission.signature && (
          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 block mb-2">Inspector Signature</span>
            <img src={submission.signature} alt="Inspector Signature" className="h-16 border rounded-lg p-1 bg-gray-50" />
          </div>
        )}
      </div>
    </div>
  );
}
