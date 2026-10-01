/**
 * Speech Service using Web Speech API (Text-to-Speech & Speech-to-Text)
 */

// Text-to-Speech: Voice Greeting & Reading Questions
export function speakText(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser.');
    return;
  }
  
  // Cancel previous speech if speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Try to use a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Speech-to-Text: Hands-free Voice Dictation
export function startVoiceRecognition(onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.start();
  return recognition;
}
