import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, User, Calendar } from 'lucide-react';

export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/issues')
      .then(res => res.json())
      .then(data => setIssues(data || []))
      .catch(() => {});
  }, []);

  const updateIssueStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setIssues(issues.map(i => i.id === id ? data.issue : i));
      }
    } catch (err) {
      alert('Failed to update issue status');
    }
  };

  const filtered = issues.filter(i => filter === 'All' || i.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Corrective Action Items</h1>
          <p className="text-xs text-gray-500">Track and resolve issues automatically triggered by failed audit items.</p>
        </div>

        <div className="flex items-center space-x-2">
          {['All', 'Open', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === st
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
            No corrective action issues matching filter "{filter}".
          </div>
        ) : (
          filtered.map((iss) => {
            const isOpen = iss.status === 'Open';
            const isInProgress = iss.status === 'In Progress';
            const isResolved = iss.status === 'Resolved';

            return (
              <div
                key={iss.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all ${
                  isResolved ? 'border-gray-200 opacity-75' : isOpen ? 'border-red-200 bg-red-50/20' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${
                      isOpen ? 'text-red-600' : isInProgress ? 'text-amber-600' : 'text-green-600'
                    }`} />
                    <h3 className="text-sm font-bold text-gray-900">{iss.itemLabel}</h3>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full shrink-0 ${
                    isOpen ? 'bg-red-100 text-red-800' : isInProgress ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {iss.status}
                  </span>
                </div>

                {iss.notes && (
                  <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200 italic">
                    "{iss.notes}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-1">
                  <div>
                    <span className="font-semibold text-gray-700 block">Location: {iss.location}</span>
                    <span className="text-gray-400">Created: {new Date(iss.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-700 block">Priority: {iss.priority || 'High'}</span>
                    <span className="text-amber-700 font-medium">Due: {iss.dueDate}</span>
                  </div>
                </div>

                {/* Status Toggle buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => updateIssueStatus(iss.id, 'In Progress')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isInProgress ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => updateIssueStatus(iss.id, 'Resolved')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      isResolved ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Mark Resolved ✅
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
