/**
 * CodeX Web Speech API Voice-to-Code Prompt Assistant
 *
 * Provides browser-native voice dictation using SpeechRecognition / webkitSpeechRecognition
 * to convert spoken audio prompts directly into AI text input.
 */

class VoicePromptAssistant {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  /**
   * Start voice recognition with callbacks for interim and final transcript
   */
  async startListening(onResult, onError, onEnd) {
    if (!this.isSupported || !this.recognition) {
      if (onError) onError('Web Speech API is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Request microphone permission explicitly first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop initial permission stream immediately
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        if (onError) {
          onError(
            'Microphone permission denied. Please allow microphone access in your browser site settings.'
          );
        }
        return false;
      }
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript, event.results[0].isFinal);
    };

    this.recognition.onerror = (err) => {
      this.isListening = false;
      let friendlyError = 'Voice recognition error.';
      const code = err.error || '';

      if (code === 'not-allowed') {
        friendlyError =
          'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (code === 'no-speech') {
        friendlyError = 'No speech detected. Please speak into your microphone.';
      } else if (code === 'audio-capture') {
        friendlyError = 'No microphone device found. Please connect a microphone.';
      } else if (typeof code === 'string' && code.length > 0) {
        friendlyError = `Voice error: ${code}`;
      }

      if (onError) onError(friendlyError);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
      return false;
    }
  }

  /**
   * Stop voice recognition
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        /* ignore */
      }
    }
    this.isListening = false;
  }
}

export const voiceAssistant = new VoicePromptAssistant();
