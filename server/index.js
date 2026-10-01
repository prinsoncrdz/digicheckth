import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendTelegramMessage, sendTelegramDocument, formatInspectionTelegramMessage } from './services/telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, 'db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Memory fallback store for Vercel serverless environment
const inMemoryStore = {
  settings: null,
  templates: null,
  submissions: [],
  issues: []
};

// Utility functions to read/write JSON DB files with Vercel serverless fallback
function readData(file, defaultData = []) {
  const filePath = path.join(DB_DIR, file);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`Reading from fallback store for ${file}`);
  }
  const key = file.replace('.json', '');
  return inMemoryStore[key] || defaultData;
}

function writeData(file, data) {
  const filePath = path.join(DB_DIR, file);
  const key = file.replace('.json', '');
  inMemoryStore[key] = data;

  try {
    if (fs.existsSync(filePath) || fs.existsSync(DB_DIR)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    return true;
  } catch (err) {
    // In Vercel serverless, disk is read-only, inMemoryStore handles transient requests
    return true;
  }
}

// --- SETTINGS API ---
app.get('/api/settings', (req, res) => {
  const settings = readData('settings.json', {
    companyName: process.env.COMPANY_NAME || 'TechHarmonix',
    logoUrl: process.env.LOGO_URL || 'https://www.techharmonix.com/_next/image?url=%2Fimages%2Flogo%2FLogo.png&w=256&q=75',
    primaryColor: '#1e3a8a',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    enableTelegramAutoSend: true
  });
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  const updatedSettings = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData('settings.json', updatedSettings);
  res.json({ success: true, settings: updatedSettings });
});

// --- TELEGRAM TEST API ---
app.post('/api/telegram/test', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const settings = readData('settings.json', {});
    const token = botToken || settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      return res.status(400).json({ success: false, error: 'Please enter both Telegram Bot Token and Chat ID.' });
    }

    const testMsg = `<b>🤖 TechHarmonix DigiCheck Telegram Bot Connected on Vercel!</b>\n\n` +
      `Your Vercel cloud deployment is active and connected to Telegram. Inspection PDF reports will be sent here automatically.`;

    await sendTelegramMessage(token, chat, testMsg);
    res.json({ success: true, message: 'Test message sent successfully to Telegram!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TELEGRAM MANUAL PDF DISPATCH API ---
app.post('/api/telegram/send-pdf-report/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { pdfBase64 } = req.body;
    const submissions = readData('submissions.json', []);
    const sub = submissions.find(s => s.id === submissionId);
    
    if (!sub) {
      return res.status(404).json({ success: false, error: 'Inspection submission not found' });
    }

    const settings = readData('settings.json', {});
    const token = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      return res.status(400).json({ success: false, error: 'Telegram Bot Token or Chat ID not configured.' });
    }

    const caption = formatInspectionTelegramMessage(sub, settings.companyName || 'TechHarmonix');
    
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      const pdfBuffer = Buffer.from(cleanBase64, 'base64');
      const filename = `DigiCheck_${sub.id}_Report.pdf`;

      await sendTelegramDocument(token, chat, pdfBuffer, filename, caption);
    } else {
      await sendTelegramMessage(token, chat, caption);
    }

    sub.telegramSent = true;
    writeData('submissions.json', submissions);

    res.json({ success: true, message: 'PDF Report dispatched to Telegram successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TEMPLATES API ---
app.get('/api/templates', (req, res) => {
  const templates = readData('templates.json', []);
  res.json(templates);
});

app.get('/api/templates/:id', (req, res) => {
  const templates = readData('templates.json', []);
  const tpl = templates.find(t => t.id === req.params.id);
  if (!tpl) return res.status(404).json({ error: 'Template not found' });
  res.json(tpl);
});

app.post('/api/templates', (req, res) => {
  const templates = readData('templates.json', []);
  const newTpl = {
    ...req.body,
    id: req.body.id || `tpl_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existingIdx = templates.findIndex(t => t.id === newTpl.id);
  if (existingIdx >= 0) {
    templates[existingIdx] = newTpl;
  } else {
    templates.unshift(newTpl);
  }

  writeData('templates.json', templates);
  res.json({ success: true, template: newTpl });
});

app.delete('/api/templates/:id', (req, res) => {
  let templates = readData('templates.json', []);
  templates = templates.filter(t => t.id !== req.params.id);
  writeData('templates.json', templates);
  res.json({ success: true });
});

// --- SUBMISSIONS API ---
app.get('/api/submissions', (req, res) => {
  const submissions = readData('submissions.json', []);
  res.json(submissions);
});

app.get('/api/submissions/:id', (req, res) => {
  const submissions = readData('submissions.json', []);
  const sub = submissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });
  res.json(sub);
});

app.post('/api/submissions', async (req, res) => {
  const submissions = readData('submissions.json', []);
  const newSub = {
    ...req.body,
    id: `sub_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    telegramSent: false
  };

  submissions.unshift(newSub);
  writeData('submissions.json', submissions);

  // Auto-generate issues for failed items
  if (newSub.answers) {
    const issues = readData('issues.json', []);
    let newIssuesCreated = false;

    Object.entries(newSub.answers).forEach(([itemId, ans]) => {
      if (ans.status === 'fail') {
        issues.unshift({
          id: `iss_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          submissionId: newSub.id,
          itemLabel: ans.label || itemId,
          location: newSub.location || 'HQ Office',
          priority: ans.severity || 'High',
          assignee: 'Janitorial & Facilities',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          status: 'Open',
          notes: ans.notes || 'Failed during digital inspection walk',
          evidence: ans.evidence || '',
          createdAt: new Date().toISOString()
        });
        newIssuesCreated = true;
      }
    });

    if (newIssuesCreated) {
      writeData('issues.json', issues);
    }
  }

  res.json({ success: true, submission: newSub });
});

// --- ISSUES API ---
app.get('/api/issues', (req, res) => {
  const issues = readData('issues.json', []);
  res.json(issues);
});

app.put('/api/issues/:id', (req, res) => {
  const issues = readData('issues.json', []);
  const idx = issues.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Issue not found' });

  issues[idx] = { ...issues[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeData('issues.json', issues);
  res.json({ success: true, issue: issues[idx] });
});

// Export app for Vercel Serverless Function & local listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`DigiCheck Express Server running on port ${PORT}`);
  });
}

export default app;
