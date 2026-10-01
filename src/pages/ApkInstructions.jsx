import React from 'react';
import { Smartphone, Download, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ApkInstructions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <Smartphone className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-extrabold">Mobile Phone App & APK Compilation</h1>
        </div>
        <p className="text-blue-200 text-sm max-w-2xl">
          DigiCheck Platform is built as a Capacitor Mobile Application + PWA (Progressive Web App). You can run it on Android phones or compile a standalone `.apk` installer file.
        </p>
      </div>

      {/* Option 1: PWA Instant Mobile Installation */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" /> Option 1: Instant PWA Mobile Installation (No Studio Needed)
        </h2>

        <div className="space-y-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="font-semibold text-gray-900">Follow these steps on any Chrome or Safari mobile browser:</p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>Open this platform link on your Android or iPhone mobile browser.</li>
            <li>Tap the browser menu button (<b>3 dots</b> in Chrome or <b>Share button</b> in Safari).</li>
            <li>Select <b>"Add to Home Screen"</b> or <b>"Install App"</b>.</li>
            <li>The <b>DigiCheck TechHarmonix</b> app icon will be installed directly on your phone's home screen!</li>
          </ol>
        </div>
      </div>

      {/* Option 2: Capacitor Native Android APK Compilation */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" /> Option 2: Building Standalone `.apk` File via Capacitor
        </h2>

        <p className="text-xs text-gray-600">
          The codebase contains pre-configured Capacitor configuration (`capacitor.config.json` & `@capacitor/android`). To build the `.apk` file on your computer:
        </p>

        <div className="space-y-3">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-2 overflow-x-auto">
            <div className="text-slate-400"># Step 1: Build the production web bundle</div>
            <div className="text-cyan-400 font-bold">npm run build</div>

            <div className="text-slate-400 pt-2"># Step 2: Initialize & sync Android Capacitor project</div>
            <div className="text-cyan-400 font-bold">npx cap add android</div>
            <div className="text-cyan-400 font-bold">npx cap sync</div>

            <div className="text-slate-400 pt-2"># Step 3: Generate APK using Gradle CLI or Android Studio</div>
            <div className="text-cyan-400 font-bold">cd android && ./gradlew assembleDebug</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
            <b>Resulting APK Location:</b> After running `./gradlew assembleDebug`, your compiled APK file will be located at:
            <code className="block mt-1 font-mono text-blue-950 font-bold">digicheck-platform/android/app/build/outputs/apk/debug/app-debug.apk</code>
          </div>
        </div>
      </div>
    </div>
  );
}
