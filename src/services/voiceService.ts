import { LanguageCode, Token, RecommendationResult, ProcurementCentre } from '../shared/types';
import { getCropDisplayName } from '../shared/crops';

// Locale code mappings for Web Speech API
const LOCALE_MAP: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  te: ['te-IN', 'te', 'hi-IN', 'en-IN'],
  hi: ['hi-IN', 'hi', 'en-IN'],
  ta: ['ta-IN', 'ta', 'en-IN'],
  kn: ['kn-IN', 'kn', 'en-IN'],
  ml: ['ml-IN', 'ml', 'en-IN'],
};

export interface VoiceState {
  isSpeaking: boolean;
  currentLanguage: LanguageCode;
  supported: boolean;
  hasNativeVoice: boolean;
}

type VoiceListener = (state: VoiceState) => void;

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<VoiceListener> = new Set();
  private isSpeaking = false;
  private lastLanguage: LanguageCode = 'en';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Preload voices
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {};
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      currentLanguage: this.lastLanguage,
      supported: this.isSupported(),
      hasNativeVoice: this.hasVoiceForLanguage(this.lastLanguage),
    };
  }

  public hasVoiceForLanguage(lang: LanguageCode): boolean {
    if (!this.synth) return false;
    const voices = this.synth.getVoices();
    const desiredLocales = LOCALE_MAP[lang] || ['en-IN'];
    return voices.some((v) =>
      desiredLocales.some((dl) => v.lang.toLowerCase().startsWith(dl.toLowerCase().split('-')[0]))
    );
  }

  private findBestVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const desiredLocales = LOCALE_MAP[lang] || ['en-IN', 'en'];

    // 1. Exact locale match
    for (const loc of desiredLocales) {
      const match = voices.find((v) => v.lang.toLowerCase() === loc.toLowerCase());
      if (match) return match;
    }

    // 2. Prefix match (e.g. 'te' in 'te-IN')
    for (const loc of desiredLocales) {
      const prefix = loc.split('-')[0].toLowerCase();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
      if (match) return match;
    }

    // 3. Indian English fallback
    const indianEn = voices.find((v) => v.lang.toLowerCase().includes('en-in'));
    if (indianEn) return indianEn;

    // 4. Default voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  /**
   * Speaks the given text in the requested language.
   */
  public async speak(text: string, lang: LanguageCode = 'en'): Promise<void> {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    this.lastLanguage = lang;
    this.isSpeaking = true;
    this.notify();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voice = this.findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        const preferredLocales = LOCALE_MAP[lang] || ['en-IN'];
        utterance.lang = preferredLocales[0];
      }

      // Slightly slower rate for clarity among rural farmers
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.notify();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error or interrupted:', e);
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.notify();
        resolve();
      };

      this.synth?.speak(utterance);
    });
  }

  /**
   * Stop any current speech
   */
  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify();
    }
  }

  // --- Specialized Multilingual Announcement Generators ---

  /**
   * Generates a fully localized audio announcement when a token is booked.
   */
  public getTokenConfirmationAnnouncement(token: Token, lang: LanguageCode): string {
    const cropsSummary = token.crops
      .map((c) => `${c.quantityQuintals} క్వింటాళ్ల ${getCropDisplayName(c.cropId, lang)}`)
      .join(', ');

    const cropsSummaryEn = token.crops
      .map((c) => `${c.quantityQuintals} quintals of ${getCropDisplayName(c.cropId, 'en')}`)
      .join(', ');

    const cropsSummaryHi = token.crops
      .map((c) => `${c.quantityQuintals} क्विंटल ${getCropDisplayName(c.cropId, 'hi')}`)
      .join(', ');

    switch (lang) {
      case 'te':
        return `నమస్తే రైతు సోదరా. మీ టోకెన్ నంబర్ ${token.tokenNumber} విజయవంతంగా బుక్ చేయబడింది. కొనుగోలు కేంద్రం: ${token.procurementCentreName}. తేదీ: ${token.bookingDate}. సమయం: ${token.timeSlot}. పంట వివరాలు: ${cropsSummary}. మీ ప్రస్తుత లైన్ నంబర్ ${token.queuePosition}. అంచనా వేసిన వేచి ఉండే సమయం ${token.estimatedWaitMinutes} నిమిషాలు. దయచేసి నిర్ణీత సమయానికి రండి. ధన్యవాదాలు.`;
      case 'hi':
        return `नमस्ते किसान भाई। आपका टोकन नंबर ${token.tokenNumber} सफलतापूर्वक बुक हो गया है। खरीद केंद्र: ${token.procurementCentreName}। तारीख: ${token.bookingDate}। समय: ${token.timeSlot}। फसल विवरण: ${cropsSummaryHi}। आपका कतार नंबर ${token.queuePosition} है। अनुमानित प्रतीक्षा समय ${token.estimatedWaitMinutes} मिनट है। धन्यवाद।`;
      case 'ta':
        return `வணக்கம் விவசாயி அவர்களே. உங்கள் டோக்கன் எண் ${token.tokenNumber} வெற்றிகரமாக பதிவு செய்யப்பட்டது. கொள்முதல் மையம்: ${token.procurementCentreName}. தேதி: ${token.bookingDate}. நேரம்: ${token.timeSlot}. வரிசை எண் ${token.queuePosition}. காத்திருக்கும் நேரம் ${token.estimatedWaitMinutes} நிமிடங்கள். நன்றி.`;
      case 'kn':
        return `ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ. ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ${token.tokenNumber} ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ. ಖರೀದಿ ಕೇಂದ್ರ: ${token.procurementCentreName}. ದಿನಾಂಕ: ${token.bookingDate}. ಸಮಯ: ${token.timeSlot}. ನಿಮ್ಮ ಸರದಿ ಸಂಖ್ಯೆ ${token.queuePosition}. ಧನ್ಯವಾದಗಳು.`;
      case 'ml':
        return `നമസ്കാരം കർഷക സുഹൃത്തേ. നിങ്ങളുടെ ടോക്കൺ നമ്പർ ${token.tokenNumber} വിജയകരമായി ബുക്ക് ചെയ്തു. സംഭരണ കേന്ദ്രം: ${token.procurementCentreName}. തീയതി: ${token.bookingDate}. സമയം: ${token.timeSlot}. നന്ദി.`;
      case 'en':
      default:
        return `Namaste Rythu. Your token number ${token.tokenNumber} is successfully confirmed for ${token.procurementCentreName} on ${token.bookingDate}, time slot ${token.timeSlot}. Produce details: ${cropsSummaryEn}. Your initial queue position is number ${token.queuePosition}. Estimated wait time is ${token.estimatedWaitMinutes} minutes. Please arrive on time with dried produce.`;
    }
  }

  /**
   * Generates a localized audio status update for the active token in yard.
   */
  public getTokenStatusAnnouncement(token: Token, lang: LanguageCode): string {
    switch (lang) {
      case 'te':
        if (token.status === 'CALLED') {
          return `ముఖ్యమైన ప్రకటన! టోకెన్ నంబర్ ${token.tokenNumber}. మిమ్మల్ని వే బ్రిడ్జి వద్దకు పిలుస్తున్నారు! దయచేసి మీ ట్రాక్టర్ లేదా వాహనంతో తక్షణమే గేట్ 1 వద్దకు రండి!`;
        }
        return `మీ టోకెన్ నంబర్ ${token.tokenNumber}. ప్రస్తుత స్థితి: ${token.status}. మీరు లైన్ లో ${token.queuePosition}వ స్థానంలో ఉన్నారు. సుమారు వేచి ఉండే సమయం ${token.estimatedWaitMinutes} నిమిషాలు.`;
      case 'hi':
        if (token.status === 'CALLED') {
          return `महत्वपूर्ण सूचना! टोकन नंबर ${token.tokenNumber}। आपको वे-ब्रिज पर बुलाया जा रहा है! कृपया तुरंत अपने वाहन के साथ गेट नंबर 1 पर पहुंचें!`;
        }
        return `टोकन नंबर ${token.tokenNumber}। स्थिति: ${token.status}। कतार में आपका स्थान ${token.queuePosition} है। अनुमानित समय ${token.estimatedWaitMinutes} मिनट है।`;
      case 'en':
      default:
        if (token.status === 'CALLED') {
          return `Urgent Announcement! Token number ${token.tokenNumber}. You are called to the weighbridge! Please bring your transport vehicle immediately to Gate 1.`;
        }
        return `Token number ${token.tokenNumber} at ${token.procurementCentreName}. Status is ${token.status}. Your queue position is number ${token.queuePosition}, with estimated wait time of ${token.estimatedWaitMinutes} minutes.`;
    }
  }

  /**
   * Generates a localized audio announcement for Go / Wait live recommendation.
   */
  public getRecommendationAnnouncement(rec: RecommendationResult, lang: LanguageCode): string {
    switch (lang) {
      case 'te':
        if (rec.status === 'GO') {
          return `సిఫార్సు: వెళ్ళండి! ${rec.centreName} కొనుగోలు కేంద్రంలో ప్రస్తుతం రద్దీ చాలా తక్కువగా ఉంది. వేచి ఉండే సమయం సుమారు ${rec.estimatedWaitMinutes} నిమిషాలు మాత్రమే. మీరు ధైర్యంగా పంటను తీసుకెళ్లవచ్చు.`;
        } else if (rec.status === 'CENTRE_BUSY' || rec.status === 'WAIT') {
          return `సిఫార్సు: వేచి ఉండండి! ${rec.centreName} వద్ద ప్రస్తుతం ${rec.currentQueueLength} ట్రాక్టర్లు లైన్ లో ఉన్నాయి. వేచి ఉండే సమయం ${rec.estimatedWaitMinutes} నిమిషాలు. దయచేసి స్లాట్ బుక్ చేసుకుని తర్వాత రండి.`;
        }
        return `${rec.centreName} కొనుగోలు కేంద్రం ప్రస్తుతం మూసివేయబడింది. దయచేసి ఇతర కేంద్రాన్ని పరిశీలించండి.`;
      case 'hi':
        if (rec.status === 'GO') {
          return `सलाह: जाएं! ${rec.centreName} में स्थिति बहुत अच्छी है। प्रतीक्षा समय केवल ${rec.estimatedWaitMinutes} मिनट है। आप फसल ला सकते हैं।`;
        }
        return `सलाह: प्रतीक्षा करें! ${rec.centreName} में अभी भीड़ है। लगभग ${rec.estimatedWaitMinutes} मिनट का इंतजार है।`;
      case 'en':
      default:
        return `Recommendation for ${rec.centreName}: Status is ${rec.status}. ${rec.headline}. ${rec.explanation} Estimated wait time is ${rec.estimatedWaitMinutes} minutes with ${rec.currentQueueLength} farmers currently in yard queue.`;
    }
  }
}

export const voiceService = new VoiceService();
