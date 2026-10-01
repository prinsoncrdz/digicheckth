import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Key, Hash, HelpCircle } from 'lucide-react';

export default function TelegramConfig({ settings, onUpdate }) {
  const [botToken, setBotToken] = useState(settings.telegramBotToken || '');
  const [chatId, setChatId] = useState(settings.telegramChatId || '');
  const [autoSend, setAutoSend] = useState(settings.enableTelegramAutoSend ?? true);
  const [status, setStatus] = useState({ loading: false, message: '', isError: false });

  const handleTestConnection = async () => {
    setStatus({ loading: true, message: '', isError: false });
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ loading: false, message: '✅ Success! Test message sent to your Telegram channel.', isError: false });
      } else {
        setStatus({ loading: false, message: `❌ Error: ${data.error}`, isError: true });
      }
    } catch (err) {
      setStatus({ loading: false, message: `❌ Connection error: ${err.message}`, isError: true });
    }
  };

  const handleSaveSettings = async () => {
    const updated = {
      ...settings,
      telegramBotToken: botToken,
      telegramChatId: chatId,
      enableTelegramAutoSend: autoSend
    };
    await onUpdate(updated);
    setStatus({ loading: false, message: 'Settings saved successfully!', isError: false });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 bg-cyan-50 rounded-xl border border-cyan-100">
          <Send className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Telegram Bot Integration</h3>
          <p className="text-xs text-gray-500">Automatically deliver finished inspection reports to Telegram groups or channels.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-600" /> Telegram Bot API Token
          </label>
          <input
            type="password"
            placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">Created via @BotFather on Telegram.</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-600" /> Telegram Chat / Channel ID
          </label>
          <input
            type="text"
            placeholder="e.g. -100123456789 or @your_channel_name"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">Your Telegram Group, Channel, or user Chat ID.</span>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="autoSend"
            checked={autoSend}
            onChange={(e) => setAutoSend(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
          />
          <label htmlFor="autoSend" className="text-sm font-medium text-gray-700">
            Auto-dispatch report to Telegram immediately when an audit is submitted
          </label>
        </div>

        {status.message && (
          <div className={`p-3 rounded-xl text-xs font-medium ${
            status.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {status.message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={status.loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {status.loading ? 'Testing...' : 'Test Bot Payload'}
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Save Telegram Config
          </button>
        </div>
      </div>
    </div>
  );
}
