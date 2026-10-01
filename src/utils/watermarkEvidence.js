/**
 * Watermarks an uploaded image file with date, time, inspector name, and location overlay.
 * Returns base64 image data URL with timestamp burned into the pixels.
 */
export function addTimestampWatermark(file, inspectorName = 'Inspector', location = 'Office') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark Banner Configuration
        const bannerHeight = Math.max(50, Math.floor(img.height * 0.12));
        const padding = Math.floor(bannerHeight * 0.2);

        // Semi-transparent dark banner at bottom
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // slate-900 with opacity
        ctx.fillRect(0, img.height - bannerHeight, img.width, bannerHeight);

        // Accent red alert bar on left of banner
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.fillRect(0, img.height - bannerHeight, 10, bannerHeight);

        // Watermark Text
        const fontSize = Math.max(14, Math.floor(bannerHeight * 0.25));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';

        const timestampStr = new Date().toLocaleString();
        const line1 = `🚨 DIGICHECK FAIL EVIDENCE | ${timestampStr}`;
        const line2 = `👤 Inspector: ${inspectorName} | 📍 Location: ${location}`;

        ctx.fillText(line1, padding + 10, img.height - bannerHeight + fontSize + 5);
        ctx.font = `normal ${Math.max(12, fontSize - 2)}px sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(line2, padding + 10, img.height - bannerHeight + (fontSize * 2) + 10);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
