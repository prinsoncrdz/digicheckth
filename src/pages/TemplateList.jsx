import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileCheck2, 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Sparkles,
  ShieldCheck,
  Server,
  Key,
  Filter
} from 'lucide-react';

export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setTemplates(data || []))
      .catch(() => {});
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete template "${title}"?`)) return;
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  const handleExportJSON = (tpl) => {
    const jsonStr = JSON.stringify(tpl, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DigiCheck_Template_${tpl.id}.json`;
    a.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!importedData.title || !importedData.sections) {
          alert('Invalid template JSON structure.');
          return;
        }
        importedData.id = `tpl_${Date.now()}`;
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedData)
        });
        const data = await res.json();
        if (data.success) {
          setTemplates([data.template, ...templates]);
          alert('Template imported successfully!');
        }
      } catch (err) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  const categories = ['All', ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filtered = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Checklist Template Catalog</h1>
          <p className="text-xs text-gray-500">Customize, build, or import digital inspection checklists for your office.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <Link
            to="/templates/builder"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Build Custom Template
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search checklists by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tpl) => {
          const totalItems = tpl.sections?.reduce((acc, sec) => acc + (sec.items?.length || 0), 0) || 0;

          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                    {tpl.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {totalItems} Questions
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {tpl.description}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
                  {tpl.sections?.map((sec) => (
                    <div key={sec.id} className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> {sec.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  to={`/inspections/new?templateId=${tpl.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Start Audit
                </Link>

                <button
                  onClick={() => handleExportJSON(tpl)}
                  title="Export JSON"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                <Link
                  to={`/templates/builder?id=${tpl.id}`}
                  title="Edit Template"
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(tpl.id, tpl.title)}
                  title="Delete Template"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
