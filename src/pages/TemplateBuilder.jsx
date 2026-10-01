import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Layers, HelpCircle, CheckSquare } from 'lucide-react';

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');

  const [template, setTemplate] = useState({
    title: '',
    category: 'Cleaning & Hygiene',
    description: '',
    sections: [
      {
        id: `sec_${Date.now()}`,
        title: 'Main Inspection Section',
        description: '',
        items: [
          {
            id: `item_${Date.now()}`,
            label: 'Sample Checklist Item',
            type: 'pass_fail',
            weight: 10,
            required: true
          }
        ]
      }
    ]
  });

  useEffect(() => {
    if (templateId) {
      fetch(`/api/templates/${templateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) setTemplate(data);
        })
        .catch(() => {});
    }
  }, [templateId]);

  const addSection = () => {
    setTemplate({
      ...template,
      sections: [
        ...template.sections,
        {
          id: `sec_${Date.now()}`,
          title: `New Section ${template.sections.length + 1}`,
          description: '',
          items: [
            {
              id: `item_${Date.now()}`,
              label: 'New Inspection Item',
              type: 'pass_fail',
              weight: 5,
              required: true
            }
          ]
        }
      ]
    });
  };

  const removeSection = (secIdx) => {
    if (template.sections.length <= 1) {
      alert('Template must have at least one section.');
      return;
    }
    const updated = template.sections.filter((_, idx) => idx !== secIdx);
    setTemplate({ ...template, sections: updated });
  };

  const addItem = (secIdx) => {
    const updatedSecs = [...template.sections];
    updatedSecs[secIdx].items.push({
      id: `item_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      label: 'New Check Question',
      type: 'pass_fail',
      weight: 5,
      required: true
    });
    setTemplate({ ...template, sections: updatedSecs });
  };

  const removeItem = (secIdx, itemIdx) => {
    const updatedSecs = [...template.sections];
    if (updatedSecs[secIdx].items.length <= 1) {
      alert('Section must contain at least one item.');
      return;
    }
    updatedSecs[secIdx].items = updatedSecs[secIdx].items.filter((_, idx) => idx !== itemIdx);
    setTemplate({ ...template, sections: updatedSecs });
  };

  const handleSave = async () => {
    if (!template.title.trim()) {
      alert('Please enter a template title.');
      return;
    }

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      const data = await res.json();
      if (data.success) {
        alert('Template saved successfully!');
        navigate('/templates');
      }
    } catch (err) {
      alert('Error saving template');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/templates')}
          className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Templates
        </button>

        <button
          onClick={handleSave}
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Save className="w-4 h-4 mr-2" /> Save Checklist Template
        </button>
      </div>

      {/* Meta Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" /> Template Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Executive Restroom & Pantry Daily Walk"
              value={template.title}
              onChange={(e) => setTemplate({ ...template, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
            <select
              value={template.category}
              onChange={(e) => setTemplate({ ...template, category: e.target.value })}
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="Cleaning & Hygiene">Cleaning & Hygiene</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
              <option value="Facilities & IT">Facilities & IT</option>
              <option value="Operations">Operations</option>
              <option value="Quality Assurance">Quality Assurance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
          <textarea
            rows="2"
            placeholder="Brief operational instructions for field inspectors..."
            value={template.description}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Sections & Questions */}
      <div className="space-y-6">
        {template.sections.map((sec, sIdx) => (
          <div key={sec.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <input
                type="text"
                value={sec.title}
                onChange={(e) => {
                  const updated = [...template.sections];
                  updated[sIdx].title = e.target.value;
                  setTemplate({ ...template, sections: updated });
                }}
                className="text-base font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-600 focus:outline-none px-1"
              />
              <button
                type="button"
                onClick={() => removeSection(sIdx)}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Remove Section
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {sec.items.map((item, iIdx) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...template.sections];
                        updated[sIdx].items[iIdx].label = e.target.value;
                        setTemplate({ ...template, sections: updated });
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const updated = [...template.sections];
                        updated[sIdx].items[iIdx].type = e.target.value;
                        setTemplate({ ...template, sections: updated });
                      }}
                      className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="pass_fail">Pass / Fail / NA</option>
                      <option value="text">Text Input</option>
                      <option value="number">Numeric Range</option>
                    </select>

                    <input
                      type="number"
                      title="Weight points"
                      value={item.weight}
                      onChange={(e) => {
                        const updated = [...template.sections];
                        updated[sIdx].items[iIdx].weight = parseInt(e.target.value) || 1;
                        setTemplate({ ...template, sections: updated });
                      }}
                      className="w-16 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-center focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(sIdx, iIdx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addItem(sIdx)}
              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question Item
            </button>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={addSection}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl border border-gray-300 transition-colors"
        >
          + Add New Checklist Section
        </button>
      </div>
    </div>
  );
}
