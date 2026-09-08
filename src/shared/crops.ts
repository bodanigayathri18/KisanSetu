import { LanguageCode, CropCategory } from './types';

export interface CropMasterItem {
  id: string;
  name: string;
  code: string;
  emoji: string;
  category: CropCategory;
  categoryLabel: string;
  mspPerQuintal: number;
  standardMoistureLimitPercent: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  localNames: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export const CROPS_MASTER: CropMasterItem[] = [
  {
    id: 'crop_paddy',
    name: 'Paddy (Grade A)',
    code: 'PDY-A',
    emoji: '🌾',
    category: 'CEREALS',
    categoryLabel: 'Cereals',
    mspPerQuintal: 2320,
    standardMoistureLimitPercent: 17,
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    badgeText: 'text-emerald-900',
    localNames: {
      en: 'Paddy (Grade A)',
      te: 'వరి (సన్న రకం)',
      hi: 'धान (ग्रेड ए)',
      ta: 'நெல் (கிரேடு ஏ)',
      kn: 'ಭತ್ತ (ಗ್ರೇಡ್ ಎ)',
      ml: 'നെല്ല് (ഗ്രേഡ് എ)',
    },
    description: {
      en: 'Guaranteed Telangana civil supplies MSP. Max moisture 17%.',
      te: 'తెలంగాణ పౌర సరఫరాల MSP మద్దతు ధర. గరిష్ట తేమ 17%.',
      hi: 'तेलंगाना नागरिक आपूर्ति एमएसपी। अधिकतम नमी 17%।',
      ta: 'தெலுங்கானா சிவில் சப்ளைஸ் MSP. ஈரப்பதம் 17% வரை.',
      kn: 'ತೆಲಂಗಾಣ ನಾಗರಿಕ ಸರಬರಾಜು MSP. ಗರಿಷ್ಠ ತೇವಾಂಶ 17%.',
      ml: 'തെലങ്കാന സിവിൽ സപ്ലൈസ് MSP. ഈർപ്പം 17% വരെ.',
    },
  },
  {
    id: 'crop_cotton',
    name: 'Cotton (Long Staple)',
    code: 'CTN-LS',
    emoji: '🌱',
    category: 'COMMERCIAL',
    categoryLabel: 'Commercial',
    mspPerQuintal: 7521,
    standardMoistureLimitPercent: 12,
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-300',
    badgeText: 'text-teal-900',
    localNames: {
      en: 'Cotton (Long Staple)',
      te: 'ప్రత్తి / పత్తి (పొడుగు పింజ)',
      hi: 'कपास (लंबा रेशा)',
      ta: 'பருத்தி',
      kn: 'ಹತ್ತಿ (ಉದ್ದ ಎಳೆ)',
      ml: 'പരുത്തി',
    },
    description: {
      en: 'Cotton Corporation of India (CCI) procurement standard.',
      te: 'CCI ఆధ్వర్యంలో పత్తి కొనుగోలు ప్రమాణం. గరిష్ట తేమ 12%.',
      hi: 'भारतीय कपास निगम (CCI) खरीद मानक।',
      ta: 'சிசிஐ கொள்முதல் தரநிலை.',
      kn: 'ಭಾರತೀಯ ಹತ್ತಿ ನಿಗಮ (CCI) ಖರೀದಿ ಮಾನದಂಡ.',
      ml: 'കോട്ടൺ കോർപ്പറേഷൻ ഓഫ് ഇന്ത്യ മാനദണ്ഡം.',
    },
  },
  {
    id: 'crop_maize',
    name: 'Maize (Corn)',
    code: 'MZ-01',
    emoji: '🌽',
    category: 'CEREALS',
    categoryLabel: 'Cereals',
    mspPerQuintal: 2225,
    standardMoistureLimitPercent: 14,
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-900',
    localNames: {
      en: 'Maize (Corn)',
      te: 'మొక్కజొన్న',
      hi: 'मक्का (कॉर्न)',
      ta: 'மக்காச்சோளம்',
      kn: 'ಮೆಕ್ಕೆಜೋಳ',
      ml: 'മക്കച്ചോളം',
    },
    description: {
      en: 'High demand feed & industrial grade yellow maize.',
      te: 'అధిక డిమాండ్ ఉన్న పౌల్ట్రీ ఫీడ్ & పారిశ్రామిక రకం మొక్కజొన్న.',
      hi: 'उच्च मांग वाला चारा और औद्योगिक पीला मक्का।',
      ta: 'தீவன மற்றும் தொழில்துறை மஞ்சள் மக்காச்சோளம்.',
      kn: 'ಹೆಚ್ಚಿನ ಬೇಡಿಕೆಯ ಹಳದಿ ಮೆಕ್ಕೆಜೋಳ.',
      ml: 'ഉയർന്ന ഡിമാന്റുള്ള മഞ്ഞച്ചോളം.',
    },
  },
  {
    id: 'crop_redgram',
    name: 'Red Gram (Tur Dal)',
    code: 'RG-TUR',
    emoji: '🫘',
    category: 'PULSES',
    categoryLabel: 'Pulses',
    mspPerQuintal: 7550,
    standardMoistureLimitPercent: 12,
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-300',
    badgeText: 'text-orange-900',
    localNames: {
      en: 'Red Gram (Tur Dal)',
      te: 'కందులు (తూర్ దాల్)',
      hi: 'अरहर / तूर दाल',
      ta: 'துவரம்பருப்பு',
      kn: 'ತೊಗರಿ ಬೇಳೆ',
      ml: 'തുവരപ്പരിപ്പ്',
    },
    description: {
      en: 'Premium pulse procurement under NAFED / MARKFED.',
      te: 'నాఫెడ్ / మార్క్‌ఫెడ్ ఆధ్వర్యంలో కందుల కొనుగోలు.',
      hi: 'नाफेड / मार्कफेड के तहत प्रमुख दाल खरीद।',
      ta: 'நாஃபெட் கீழ் பருப்பு கொள்முதல்.',
      kn: 'ನಾಫೆಡ್ ಅಡಿಯಲ್ಲಿ ತೊಗರಿ ಖರೀದಿ.',
      ml: 'നാഫെഡ് വഴി പയർവർഗ്ഗ സംഭരണം.',
    },
  },
  {
    id: 'crop_greengram',
    name: 'Green Gram (Moong)',
    code: 'GG-MNG',
    emoji: '🫛',
    category: 'PULSES',
    categoryLabel: 'Pulses',
    mspPerQuintal: 8682,
    standardMoistureLimitPercent: 12,
    badgeBg: 'bg-lime-50',
    badgeBorder: 'border-lime-300',
    badgeText: 'text-lime-900',
    localNames: {
      en: 'Green Gram (Moong)',
      te: 'పెసలు (మూంగ్)',
      hi: 'मूंग दाल',
      ta: 'பச்சைப்பயறு',
      kn: 'ಹೆಸರು ಕಾಳು',
      ml: 'ചെറുപയർ',
    },
    description: {
      en: 'Highest MSP value pulse crop in Telangana.',
      te: 'తెలంగాణలో అత్యధిక మద్దతు ధర కలిగిన అపరాలు.',
      hi: 'तेलंगाना में उच्चतम एमएसपी वाली दलहन फसल।',
      ta: 'அதிகபட்ச MSP மதிப்புடைய பயறு.',
      kn: 'ತೆಲಂಗಾಣದಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಎಂಎಸ್ಪಿ ಬೆಲೆಯ ಕಾಳು.',
      ml: 'ഏറ്റവും ഉയർന്ന താങ്ങുവിലയുള്ള പയർവിള.',
    },
  },
  {
    id: 'crop_soyabean',
    name: 'Soyabean (Yellow)',
    code: 'SYB-YL',
    emoji: '🌻',
    category: 'OILSEEDS',
    categoryLabel: 'Oilseeds',
    mspPerQuintal: 4892,
    standardMoistureLimitPercent: 10,
    badgeBg: 'bg-yellow-50',
    badgeBorder: 'border-yellow-300',
    badgeText: 'text-yellow-900',
    localNames: {
      en: 'Soyabean (Yellow)',
      te: 'సోయాబీన్ (నూనెగింజ)',
      hi: 'सोयाबीन (पीला)',
      ta: 'சோயாபீன்',
      kn: 'ಸೋಯಾಬೀನ್',
      ml: 'സോയാബീൻ',
    },
    description: {
      en: 'Crucial oilseed crop for North Telangana districts.',
      te: 'ఉత్తర తెలంగాణ జిల్లాల్లో ప్రధాన నూనెగింజ పంట.',
      hi: 'उत्तरी तेलंगाना जिलों के लिए प्रमुख तिलहन फसल।',
      ta: 'முக்கியமான எண்ணெய் வித்து பயிர்.',
      kn: 'ಪ್ರಮುಖ ಎಣ್ಣೆಕಾಳು ಬೆಳೆ.',
      ml: 'പ്രധാന എണ്ണക്കുരു വിള.',
    },
  },
  {
    id: 'crop_chilli',
    name: 'Dry Red Chilli (Teja)',
    code: 'CHL-TJ',
    emoji: '🌶️',
    category: 'COMMERCIAL',
    categoryLabel: 'Commercial',
    mspPerQuintal: 12500,
    standardMoistureLimitPercent: 10,
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-300',
    badgeText: 'text-rose-900',
    localNames: {
      en: 'Dry Red Chilli (Teja)',
      te: 'ఎండు మిర్చి (తేజా రకం)',
      hi: 'सूखी लाल मिर्च (तेजा)',
      ta: 'சிவப்பு காய்ந்த மிளகாய்',
      kn: 'ಒಣ ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ',
      ml: 'വറ്റൽമുളക് (തേജ)',
    },
    description: {
      en: 'Famous Khammam / Warangal export grade red chillies.',
      te: 'ప్రసిద్ధ ఖమ్మం, వరంగల్ ఎగుమతి నాణ్యత గల తేజా మిర్చి.',
      hi: 'प्रसिद्ध खम्मम / वारंगल निर्यात गुणवत्ता वाली मिर्च।',
      ta: 'ஏற்றுமதி தர சிவப்பு மிளகாய்.',
      kn: 'ರಫ್ತು ಗುಣಮಟ್ಟದ ಖಮ್ಮಂ ಒಣ ಮೆಣಸಿನಕಾಯಿ.',
      ml: 'കയറ്റുമതി നിലവാരമുള്ള വറ്റൽമുളക്.',
    },
  },
  {
    id: 'crop_groundnut',
    name: 'Groundnut (Pod)',
    code: 'GNT-01',
    emoji: '🥜',
    category: 'OILSEEDS',
    categoryLabel: 'Oilseeds',
    mspPerQuintal: 6783,
    standardMoistureLimitPercent: 9,
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-900',
    localNames: {
      en: 'Groundnut (Peanut)',
      te: 'వేరుశనగ (పల్లీలు)',
      hi: 'मूंगफली',
      ta: 'வேர்க்கடலை',
      kn: 'ಕಡಲೆಕಾಯಿ',
      ml: 'നിലക്കടല',
    },
    description: {
      en: 'Certified oilseed procurement with shell moisture inspection.',
      te: 'కాయ తేమ పరీక్షతో కూడిన సర్టిఫైడ్ వేరుశనగ కొనుగోలు.',
      hi: 'प्रमाणित तिलहन खरीद नमी परीक्षण के साथ।',
      ta: 'சான்றளிக்கப்பட்ட எண்ணெய் வித்து கொள்முதல்.',
      kn: 'ತೇವಾಂಶ ತಪಾಸಣೆಯೊಂದಿಗೆ ಕಡಲೆಕಾಯಿ ಖರೀದಿ.',
      ml: 'പരിശോധിച്ച നിലക്കടല സംഭരണം.',
    },
  },
];

export function getCropEmoji(cropId: string): string {
  const c = CROPS_MASTER.find((item) => item.id === cropId || cropId.includes(item.id.replace('crop_', '')));
  return c ? c.emoji : '🌾';
}

export function getCropDisplayName(cropId: string, lang: LanguageCode = 'en'): string {
  const c = CROPS_MASTER.find((item) => item.id === cropId || cropId.includes(item.id.replace('crop_', '')));
  if (c) {
    return c.localNames[lang] || c.name;
  }
  return cropId;
}
