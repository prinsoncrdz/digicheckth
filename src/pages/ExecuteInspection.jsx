import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Send, 
  Sparkles, 
  MapPin, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Smartphone,
  Check
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { speakText, startVoiceRecognition } from '../utils/speechService';
import { addTimestampWatermark } from '../utils/watermarkEvidence';
import { generateInspectionPDF } from '../utils/exportPdf';
import confetti from 'canvas-confetti';

export default function ExecuteInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdParam = searchParams.get('templateId');

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [inspectorName, setInspectorName] = useState('');
  const [location, setLocation] = useState('HQ Office - Main Floor');
  const [answers, setAnswers] = useState({});
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState({});

  const [viewMode, setViewMode] = useState('wizard');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [activeMicItemId, setActiveMicItemId] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([tpls, stgs]) => {
      setTemplates(tpls || []);
      setSettings(stgs || {});

      let chosenTpl = tpls[0];
      if (templateIdParam) {
        const found = tpls.find(t => t.id === templateIdParam);
        if (found) chosenTpl = found;
      }
      if (chosenTpl) selectTemplate(chosenTpl);

      speakText(`Welcome to ${stgs.companyName || 'TechHarmonix'} DigiCheck Office Audit.`);
    }).catch(() => {});
  }, [templateIdParam]);

  const selectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    const initial = {};
    tpl.sections?.forEach(sec => {
      sec.items?.forEach(item => {
        initial[item.id] = {
          status: 'pass',
          notes: '',
          evidence: '',
          weight: item.weight || 5,
          label: item.label
        };
      });
    });
    setAnswers(initial);
    setCurrentQuestionIndex(0);
  };

  const allQuestions = selectedTemplate?.sections?.flatMap(sec => 
    sec.items.map(item => ({ ...item, sectionTitle: sec.title }))
  ) || [];

  const handleStatusChange = (itemId, newStatus) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: newStatus }
    }));
  };

  const handleNotesChange = (itemId, notes) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes }
    }));
  };

  const handlePhotoUpload = async (itemId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const watermarkedBase64 = await addTimestampWatermark(file, inspectorName || 'Inspector', location);
      setAnswers(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], evidence: watermarkedBase64 }
      }));
      speakText('Evidence photo timestamped and saved.');
    } catch (err) {
      alert('Error processing watermarked photo.');
    }
  };

  const toggleVoiceDictation = (itemId) => {
    if (isListening && activeMicItemId === itemId) {
      setIsListening(false);
      setActiveMicItemId(null);
      return;
    }

    setIsListening(true);
    setActiveMicItemId(itemId);
    speakText("Listening for dictation...");

    startVoiceRecognition(
      (transcript) => {
        handleNotesChange(itemId, (answers[itemId]?.notes || '') + ' ' + transcript);
        setIsListening(false);
        setActiveMicItemId(null);
      },
      (err) => {
        setIsListening(false);
        setActiveMicItemId(null);
      }
    );
  };

  const calculateScore = () => {
    let earned = 0;
    let totalPossible = 0;
    let passed = 0;
    let failed = 0;
    let na = 0;

    Object.values(answers).forEach(ans => {
      const weight = ans.weight || 5;
      if (ans.status === 'pass') {
        earned += weight;
        totalPossible += weight;
        passed++;
      } else if (ans.status === 'fail') {
        totalPossible += weight;
        failed++;
      } else if (ans.status === 'na') {
        na++;
      }
    });

    const score = totalPossible > 0 ? (earned / totalPossible) * 100 : 100;
    return { score, passed, failed, na, total: Object.keys(answers).length };
  };

  const stats = calculateScore();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inspectorName.trim()) {
      setErrorMsg('Please enter your name as the inspector.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    // Pre-generate PDF report base64 for instant Telegram attachment
    let pdfBase64 = '';
    try {
      const tempSub = {
        id: `temp_${Date.now()}`,
        templateTitle: selectedTemplate.title,
        inspectorName: inspectorName.trim(),
        location: location.trim(),
        score: stats.score,
        totalItems: stats.total,
        passedItems: stats.passed,
        failedItems: stats.failed,
        answers: answers,
        signature: signature,
        submittedAt: new Date().toISOString()
      };
      const doc = generateInspectionPDF(tempSub, settings, false);
      if (doc) {
        pdfBase64 = doc.output('datauristring');
      }
    } catch (pdfErr) {
      console.warn('PDF generation preview warning:', pdfErr);
    }

    const submissionPayload = {
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      inspectorName: inspectorName.trim(),
      location: location.trim(),
      score: stats.score,
      totalItems: stats.total,
      passedItems: stats.passed,
      failedItems: stats.failed,
      naItems: stats.na,
      answers: answers,
      signature: signature,
      pdfBase64: pdfBase64
    };

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });
      const data = await res.json();
      
      if (data.success) {
        speakText(`Audit completed with score of ${stats.score.toFixed(0)} percent. Report sent to Telegram.`);
        if (stats.score >= 90) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        navigate('/inspections');
      } else {
        setErrorMsg('Submission failed.');
      }
    } catch (err) {
      setErrorMsg(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedTemplate) return null;

  const currentQ = allQuestions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* View Switcher Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-gray-500 uppercase">View Mode:</label>
          <div className="bg-gray-100 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('wizard')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                viewMode === 'wizard' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile App (1 Question/Screen)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Web Full List
            </button>
          </div>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase">Score</span>
            <div className="text-lg font-extrabold text-blue-900">{stats.score.toFixed(1)}%</div>
          </div>
          <div className="text-right text-xs font-semibold text-blue-700">
            <span className="text-green-600 font-bold">✔ {stats.passed}</span> | <span className="text-red-600 font-bold">✖ {stats.failed}</span>
          </div>
        </div>
      </div>

      {/* Inspector Details Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Inspector Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Alex Johnson"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Office Zone / Location</label>
          <input
            type="text"
            placeholder="e.g. HQ Floor 3 East Wing"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* MOBILE APP MODE: 1 QUESTION PER SCREEN WIZARD */}
      {viewMode === 'wizard' && currentQ && (
        <div className="bg-white rounded-3xl border-2 border-blue-500/20 p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in relative">
          
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-gray-100 pb-3">
            <span className="uppercase text-blue-600 tracking-wider font-extrabold">{currentQ.sectionTitle}</span>
            <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {currentQ.label}
              </h2>
              <button
                type="button"
                onClick={() => speakText(currentQ.label)}
                title="Read Question Aloud"
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl shrink-0 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleStatusChange(currentQ.id, 'pass')}
              className={`py-4 rounded-2xl font-extrabold text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                answers[currentQ.id]?.status === 'pass'
                  ? 'bg-green-600 text-white shadow-lg scale-105 ring-4 ring-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" /> PASS
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange(currentQ.id, 'fail')}
              className={`py-4 rounded-2xl font-extrabold text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                answers[currentQ.id]?.status === 'fail'
                  ? 'bg-red-600 text-white shadow-lg scale-105 ring-4 ring-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50'
              }`}
            >
              <XCircle className="w-6 h-6" /> FAIL
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange(currentQ.id, 'na')}
              className={`py-4 rounded-2xl font-extrabold text-sm transition-all flex flex-col items-center justify-center gap-1.5 ${
                answers[currentQ.id]?.status === 'na'
                  ? 'bg-gray-700 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MinusCircle className="w-6 h-6" /> N/A
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600">Notes / Remarks</label>
              <button
                type="button"
                onClick={() => toggleVoiceDictation(currentQ.id)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isListening && activeMicItemId === currentQ.id
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {isListening && activeMicItemId === currentQ.id ? (
                  <><MicOff className="w-3.5 h-3.5 mr-1" /> Listening...</>
                ) : (
                  <><Mic className="w-3.5 h-3.5 mr-1" /> Voice Dictate Notes</>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="Speak or type notes..."
              value={answers[currentQ.id]?.notes || ''}
              onChange={(e) => handleNotesChange(currentQ.id, e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {answers[currentQ.id]?.status === 'fail' && (
            <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-red-900 uppercase flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-600" /> Evidence Photo with Timestamp Overlay
              </label>

              <label className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">
                <Camera className="w-4 h-4 mr-2" /> Take / Upload Timestamped Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(currentQ.id, e)}
                  className="hidden"
                />
              </label>

              {answers[currentQ.id]?.evidence && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-green-700 block mb-1">✅ Watermarked Evidence Preview:</span>
                  <img src={answers[currentQ.id].evidence} alt="Evidence" className="max-h-48 rounded-xl border border-gray-300 shadow-md" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous Question
            </button>

            {currentQuestionIndex < allQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(allQuestions.length - 1, prev + 1))}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Next Question <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> All Questions Answered
              </span>
            )}
          </div>
        </div>
      )}

      {/* FULL WEB LIST MODE */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {selectedTemplate.sections?.map((sec) => (
            <div key={sec.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b pb-2">{sec.title}</h3>
              <div className="space-y-4">
                {sec.items?.map((item) => {
                  const currentAns = answers[item.id] || { status: 'pass', notes: '' };
                  const isFail = currentAns.status === 'fail';

                  return (
                    <div key={item.id} className={`p-4 rounded-xl border ${isFail ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                        <div className="flex space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'pass')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${currentAns.status === 'pass' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border'}`}
                          >
                            PASS
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'fail')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${currentAns.status === 'fail' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border'}`}
                          >
                            FAIL
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.id, 'na')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg ${currentAns.status === 'na' ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border'}`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Notes or remarks..."
                          value={currentAns.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signature Pad */}
      <SignaturePad onSave={setSignature} />

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 text-xs font-bold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Final Submit Bar */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
        {submitting ? 'Submitting & Dispatching PDF to Telegram...' : 'Complete Audit & Auto-Send PDF Report to Telegram'}
      </button>
    </div>
  );
}
