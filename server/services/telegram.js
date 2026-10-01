import https from 'https';

/**
 * Send a text message via Telegram Bot API
 */
export async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId) {
    throw new Error('Telegram Bot Token or Chat ID is missing');
  }

  const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;

  const payload = JSON.stringify({
    chat_id: chatId.trim(),
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.ok) resolve(parsed.result);
          else reject(new Error(parsed.description || 'Telegram API Error'));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Send a PDF Document file via Telegram Bot API
 */
export async function sendTelegramDocument(botToken, chatId, pdfBuffer, filename, caption = "") {
  if (!botToken || !chatId) {
    throw new Error('Telegram Bot Token or Chat ID is missing');
  }

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const url = `https://api.telegram.org/bot${botToken.trim()}/sendDocument`;

  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n${chatId.trim()}\r\n`;

  if (caption) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`;
  }

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n`;
  body += `Content-Type: application/pdf\r\n\r\n`;

  const footer = `\r\n--${boundary}--\r\n`;

  const headerBuffer = Buffer.from(body, 'utf-8');
  const footerBuffer = Buffer.from(footer, 'utf-8');
  const totalLength = headerBuffer.length + pdfBuffer.length + footerBuffer.length;

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.ok) resolve(parsed.result);
          else reject(new Error(parsed.description || 'Telegram sendDocument failed'));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(headerBuffer);
    req.write(pdfBuffer);
    req.write(footerBuffer);
    req.end();
  });
}

/**
 * Formats a clean HTML message for Telegram report dispatch
 */
export function formatInspectionTelegramMessage(submission, companyName = "TechHarmonix") {
  const scoreEmoji = submission.score >= 90 ? "✅🟢" : submission.score >= 75 ? "⚠️🟡" : "🚨🔴";
  
  let failedSection = "";
  if (submission.failedItems > 0 && submission.answers) {
    const failedList = Object.entries(submission.answers)
      .filter(([_, ans]) => ans.status === 'fail')
      .map(([id, ans]) => `  • <b>${ans.label || id}</b>${ans.notes ? `: <i>${ans.notes}</i>` : ''}`)
      .join('\n');
      
    failedSection = `\n\n<b>⚠️ Failed Checklist Items (${submission.failedItems}):</b>\n${failedList}`;
  }

  return `<b>🏢 ${companyName} DigiCheck Report</b>\n` +
    `----------------------------------------\n` +
    `📋 <b>Checklist:</b> ${submission.templateTitle}\n` +
    `📍 <b>Location:</b> ${submission.location || 'HQ Office'}\n` +
    `👤 <b>Inspector:</b> ${submission.inspectorName}\n` +
    `🕒 <b>Date:</b> ${new Date(submission.submittedAt).toLocaleString()}\n\n` +
    `📊 <b>Compliance Score:</b> ${scoreEmoji} <b>${submission.score.toFixed(1)}%</b>\n` +
    `✔️ Passed: ${submission.passedItems} / ${submission.totalItems}\n` +
    `❌ Failed: ${submission.failedItems}` +
    `${failedSection}\n\n` +
    `<i>Attached is the official PDF Inspection Report document.</i>`;
}
