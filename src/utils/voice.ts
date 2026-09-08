import { LanguageCode } from '../shared/types';
import { voiceService } from '../services/voiceService';

/**
 * Modular voice synthesizer for farmer announcements and accessibility.
 * Seamlessly delegated to voiceService.
 */
export async function speakText(text: string, language: LanguageCode = 'en'): Promise<boolean> {
  try {
    await voiceService.speak(text, language);
    return true;
  } catch (err) {
    console.error('Failed to trigger text-to-speech:', err);
    return false;
  }
}

export function stopSpeaking() {
  voiceService.stop();
}

