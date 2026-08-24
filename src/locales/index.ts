import { en } from './en';
import { hi } from './hi';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ja } from './ja';
import { bn } from './bn';
import { mr } from './mr';
import { ar } from './ar';

export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja' | 'bn' | 'mr' | 'ar';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  es,
  fr,
  de,
  ja,
  bn,
  mr,
  ar,
};
