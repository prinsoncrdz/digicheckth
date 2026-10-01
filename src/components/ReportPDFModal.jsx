import React, { useState } from 'react';
import { X, Download, Send, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { generateInspectionPDF } from '../utils/exportPdf';

export default function ReportPDFModal({ submission, settings, onClose }) {
  const [telegramStatus, setTelegramStatus] = useState({ loading: false, success: false, error: '' });

  if (!submission) return null;

  const handleDownloadPDF = () => {
    generateInspectionPDF(submission, settings);
  };

  const handleSendTelegram = async () => {
    setTelegramStatus({ loading: true, success: false, error: '' });
    try {
      const res = await fetch(`/api/telegram/send-report/${submission.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus({ loading: false, success: true, error: '' });
      } else {
        setTelegramStatus({ loading: false, success: false, error: data.error || 'Failed to dispatch report' });
      }
    } catch (err) {
      setTelegramStatus({ loading: false, success: false, error: err.message });
    }
  };

  const isPass = submission.score >= 90;
  const isWarn = submission.score >= 75 && submission.score < 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Logo */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
          <img
            src={settings?.logoUrl || "https://www.techharmonix.com/_next/image?url=%2Fimages%2Flogo%2FLogo.png&w=256&q=75"}
            alt="Company Logo"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Inspection Summary & Export</h3>
            <p className="text-xs text-gray-500">{submission.templateTitle}</p>
          </div>
        </div>

        {/* Audit Score Card */}
        <div className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
          isPass ? 'bg-green-50 border-green-200' : isWarn ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
        }`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Compliance Score</span>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5" style={{
              color: isPass ? '#15803d' : isWarn ? '#b45309' : '#b91c1c'
            }}>
              {submission.score.toFixed(1)}%
            </div>
            <span className="text-xs font-medium text-gray-600">
              {submission.passedItems} Passed / {submission.failedItems} Failed out of {submission.totalItems} Items
            </span>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              isPass ? 'bg-green-600 text-white' : isWarn ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {isPass ? 'COMPLIANT ✅' : isWarn ? 'NEEDS ATTENTION ⚠️' : 'NON-COMPLIANT 🚨'}
            </span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <div>
            <span className="text-gray-500 text-xs font-medium block">Inspector</span>
            <span className="font-semibold text-gray-800">{submission.inspectorName}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium block">Office Location</span>
            <span className="font-semibold text-gray-800">{submission.location || 'HQ Office'}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium block">Date Executed</span>
            <span className="font-medium text-gray-800">{new Date(submission.submittedAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium block">Telegram Status</span>
            <span className="font-medium text-gray-800 flex items-center gap-1">
              {submission.telegramSent || telegramStatus.success ? (
                <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Dispatched</span>
              ) : (
                <span className="text-gray-500">Not Sent Yet</span>
              )}
            </span>
          </div>
        </div>

        {/* Failed items snippet if any */}
        {submission.failedItems > 0 && submission.answers && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Failed Checklist Items ({submission.failedItems})
            </h4>
            <div className="space-y-2 bg-red-50/60 p-3 rounded-xl border border-red-200 max-h-40 overflow-y-auto">
              {Object.entries(submission.answers)
                .filter(([_, a]) => a.status === 'fail')
                .map(([id, a]) => (
                  <div key={id} className="text-xs text-red-900 border-b border-red-100 last:border-0 pb-1.5">
                    <span className="font-bold">• {a.label || id}</span>
                    {a.notes && <span className="block text-red-700 font-normal ml-3 italic">Note: {a.notes}</span>}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Download Executive PDF Report
          </button>

          <button
            onClick={handleSendTelegram}
            disabled={telegramStatus.loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {telegramStatus.loading ? 'Dispatching to Telegram...' : 'Share to Telegram Channel'}
          </button>
        </div>

        {telegramStatus.error && (
          <div className="mt-3 p-2.5 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg text-center">
            {telegramStatus.error}
          </div>
        )}
        {telegramStatus.success && (
          <div className="mt-3 p-2.5 bg-green-100 border border-green-300 text-green-700 text-xs rounded-lg text-center font-medium">
            ✅ Audit Report successfully sent to Telegram Bot channel!
          </div>
        )}
      </div>
    </div>
  );
}
