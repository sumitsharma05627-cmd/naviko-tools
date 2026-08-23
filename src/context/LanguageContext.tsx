import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja' | 'bn' | 'mr' | 'ar';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.finance': 'Finance & Wealth',
    'nav.calculators': 'Calculators',
    'nav.student': 'Student Tools',
    'nav.career': 'Career Tools',
    'nav.image': 'Image Tools',
    'nav.allTools': 'All Tools',
    'nav.blog': 'Blog',
    'nav.budget': 'Budget Planner',
    'nav.debtClock': 'National Debt Clock',
    'nav.scientific': 'Scientific Calc',
    'nav.numberCalc': 'Number Calc',
    'nav.percentage': 'Percentage Calc',
    'nav.age': 'Age Calculator',
    'nav.searchPlaceholder': 'Search 20+ smart tools (SIP, Salary, Resume, EMI)...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'Categories',
    'nav.quickTools': 'Quick Tools',
    'nav.trending': 'Trending',
    'nav.exploreAll': 'View all tools',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.toggle': 'Toggle theme',
    'lang.select': 'Select Language',
    'lang.language': 'Language',
    
    // Hero
    'hero.badge': 'Next-Gen Productivity Suite • Free & Private',
    'hero.title': 'Smart Tools for',
    'hero.highlight': 'Career, Wealth & Study.',
    'hero.subtitle': 'High-speed client-side calculators, SIP compounding, in-hand salary tax breakdowns, ATS resumes, and image processing tools. Zero ads clutter, 100% private.',
    'hero.exploreBtn': 'Explore Tools',
    'hero.searchPlaceholder': 'Search tools... (SIP, Salary, EMI, CGPA, Resume, Age)',
    'hero.quickSipTitle': 'Live Compound SIP Estimator',
    'hero.monthlyInvest': 'Monthly Investment',
    'hero.timeHorizon': 'Time Horizon',
    'hero.estValue': 'Estimated Maturity Value',
    'hero.invested': 'Total Invested',
    'hero.wealthGain': 'Est. Wealth Gain',
    'hero.openFullCalc': 'Open Full SIP & Step-Up Calculator',

    // Privacy Section
    'privacy.badge': 'Privacy First Guarantee',
    'privacy.title': 'Zero Tracking. Zero Server Storage. Pure Speed.',
    'privacy.subtitle': 'All mathematical operations, resumes, and images run strictly in your web browser. Your private data never touches any external cloud server.',
    'privacy.feat1Title': '100% Client-Side Engine',
    'privacy.feat1Desc': 'Calculations and file processing happen locally in real-time with zero latency.',
    'privacy.feat2Title': 'Zero Data Collection',
    'privacy.feat2Desc': 'No tracking cookies, no accounts required, no telemetry, and no storage of personal inputs.',
    'privacy.feat3Title': 'Instant & Offline-Ready',
    'privacy.feat3Desc': 'Ultra-lightweight architecture with immediate response times on mobile and desktop.',

    // Categories
    'cat.sectionBadge': 'All Categories',
    'cat.sectionTitle': 'Browse by Category',
    'cat.toolsCount': 'tools',
    'cat.exploreCategory': 'Explore Category',

    // Featured Tools
    'tools.featuredBadge': 'Featured Collection',
    'tools.featuredTitle': 'Most Popular Utilities',
    'tools.useTool': 'Use Tool',
    'tools.exploreAllCount': 'Explore all tools',

    // Common
    'common.calculate': 'Calculate',
    'common.reset': 'Reset',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.download': 'Download',
    'common.share': 'Share',
    'common.howToUse': 'How to Use',
    'common.faq': 'Frequently Asked Questions',
    'common.relatedTools': 'Related Tools',
    'common.whyNaviko': 'Why Use NAVIKO?',

    // Footer
    'footer.tagline': 'Fast, private, and high-precision digital utilities built for professionals, students, and investors worldwide.',
    'footer.privacyBadge': '100% Client-Side Private • Zero Logs',
    'footer.quickLinks': 'Quick Links',
    'footer.categories': 'Categories',
    'footer.popular': 'Popular Tools',
    'footer.disclaimer': 'Disclaimer: NAVIKO financial and academic calculators are provided for informational, illustrative, and planning purposes only. They do not constitute certified tax, legal, or financial advisory.',
    'footer.copyright': '© 2026 NAVIKO Smart Productivity Suite. All rights reserved.',
  },

  hi: {
    'nav.home': 'होम',
    'nav.finance': 'वित्त एवं धन',
    'nav.calculators': 'कैलकुलेटर',
    'nav.student': 'छात्र उपकरण',
    'nav.career': 'करियर टूल्स',
    'nav.image': 'इमेज टूल्स',
    'nav.allTools': 'सभी टूल्स',
    'nav.blog': 'ब्लॉग व गाइड',
    'nav.budget': 'बजट प्लानर',
    'nav.debtClock': 'राष्ट्रीय ऋण घड़ी',
    'nav.scientific': 'वैज्ञानिक कैलकुलेटर',
    'nav.numberCalc': 'नंबर कैलकुलेटर',
    'nav.percentage': 'प्रतिशत कैलकुलेटर',
    'nav.age': 'आयु कैलकुलेटर',
    'nav.searchPlaceholder': '20+ स्मार्ट टूल्स खोजें (एसआईपी, सैलरी, रिज्यूमे, ईएमआई)...',
    'nav.searchShortcut': 'खोजें',
    'nav.categories': 'श्रेणियाँ',
    'nav.quickTools': 'त्वरित उपकरण',
    'nav.trending': 'प्रचलित',
    'nav.exploreAll': 'सभी टूल्स देखें',
    'theme.light': 'लाइट',
    'theme.dark': 'डार्क',
    'theme.system': 'सिस्टम',
    'theme.toggle': 'थीम बदलें',
    'lang.select': 'भाषा चुनें',
    'lang.language': 'भाषा',
    
    // Hero
    'hero.badge': 'नेक्स्ट-जेन उत्पादकता सुइट • 100% मुफ्त व सुरक्षित',
    'hero.title': 'स्मार्ट टूल्स आपके',
    'hero.highlight': 'करियर, धन एवं शिक्षा के लिए।',
    'hero.subtitle': 'अल्ट्रा-फास्ट कैलकुलेटर, एसआईपी कम्पाउंडिंग, इन-हैंड सैलरी टैक्स ब्रेकडाउन, एटीएस रिज्यूमे और इमेज टूल्स। बिना किसी विज्ञापन, 100% निजी।',
    'hero.exploreBtn': 'टूल्स देखें',
    'hero.searchPlaceholder': 'टूल्स खोजें... (SIP, Salary, EMI, CGPA, Resume, Age)',
    'hero.quickSipTitle': 'लाइव एसआईपी कंपाउंड कैलकुलेटर',
    'hero.monthlyInvest': 'मासिक निवेश (₹)',
    'hero.timeHorizon': 'अवधि (वर्ष)',
    'hero.estValue': 'अनुमानित कुल मैच्योरिटी राशि',
    'hero.invested': 'कुल निवेश',
    'hero.wealthGain': 'अनुमानित रिटर्न लाभ',
    'hero.openFullCalc': 'पूर्ण एसआईपी कैलकुलेटर खोलें',

    // Privacy Section
    'privacy.badge': 'गोपनीयता की पक्की गारंटी',
    'privacy.title': 'शून्य ट्रैकिंग। शून्य सर्वर स्टोरेज। पूरी गति।',
    'privacy.subtitle': 'सभी गणितीय गणनाएं, रिज्यूमे और चित्र सीधे आपके वेब ब्राउज़र में संसाधित होते हैं। आपका डेटा कभी किसी बाहरी सर्वर पर नहीं भेजा जाता।',
    'privacy.feat1Title': '100% क्लाइंट-साइड इंजन',
    'privacy.feat1Desc': 'सभी गणनाएं बिना किसी रुकावट के सीधे आपके डिवाइस पर तुरंत होती हैं।',
    'privacy.feat2Title': 'शून्य डेटा संग्रह',
    'privacy.feat2Desc': 'कोई ट्रैकिंग नहीं, किसी खाते की आवश्यकता नहीं, और इनपुट कभी स्टोर नहीं होते।',
    'privacy.feat3Title': 'तुरंत और बिना इंटरनेट भी सक्षम',
    'privacy.feat3Desc': 'अल्ट्रा-फास्ट आर्किटेक्चर जो मोबाइल और लैपटॉप पर तुरंत लोड होता है।',

    // Categories
    'cat.sectionBadge': 'सभी श्रेणियाँ',
    'cat.sectionTitle': 'श्रेणी अनुसार खोजें',
    'cat.toolsCount': 'टूल्स',
    'cat.exploreCategory': 'श्रेणी देखें',

    // Featured Tools
    'tools.featuredBadge': 'विशेष संग्रह',
    'tools.featuredTitle': 'सर्वाधिक लोकप्रिय टूल्स',
    'tools.useTool': 'उपयोग करें',
    'tools.exploreAllCount': 'सभी टूल्स एक्सप्लोर करें',

    // Common
    'common.calculate': 'गणना करें',
    'common.reset': 'रीसेट',
    'common.copy': 'कॉपी करें',
    'common.copied': 'कॉपी हो गया!',
    'common.download': 'डाउनलोड करें',
    'common.share': 'शेयर करें',
    'common.howToUse': 'उपयोग कैसे करें',
    'common.faq': 'अक्सर पूछे जाने वाले प्रश्न',
    'common.relatedTools': 'संबंधित उपकरण',
    'common.whyNaviko': 'NAVIKO क्यों चुनें?',

    // Footer
    'footer.tagline': 'छात्रों, पेशेवरों और निवेशकों के लिए तेज, निजी और सटीक डिजिटल टूल्स।',
    'footer.privacyBadge': '100% क्लाइंट-साइड सुरक्षित • शून्य लॉग्स',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.categories': 'श्रेणियाँ',
    'footer.popular': 'लोकप्रिय टूल्स',
    'footer.disclaimer': 'अस्वीकरण: NAVIKO वित्तीय और शैक्षणिक कैलकुलेटर केवल सूचना और योजना के उद्देश्य से प्रदान किए जाते हैं। यह कोई प्रमाणित कानूनी या वित्तीय सलाह नहीं है।',
    'footer.copyright': '© 2026 नाविकों (NAVIKO) स्मार्ट सुइट। सर्वाधिकार सुरक्षित।',
  },

  es: {
    'nav.home': 'Inicio',
    'nav.finance': 'Finanzas y Riqueza',
    'nav.calculators': 'Calculadoras',
    'nav.student': 'Herramientas de Estudiantes',
    'nav.career': 'Carrera Profesional',
    'nav.image': 'Herramientas de Imagen',
    'nav.allTools': 'Todas las Herramientas',
    'nav.blog': 'Blog y Guías',
    'nav.budget': 'Planificador de Presupuesto',
    'nav.debtClock': 'Reloj de Deuda',
    'nav.scientific': 'Calculadora Científica',
    'nav.numberCalc': 'Calculadora Numérica',
    'nav.percentage': 'Calculadora de Porcentaje',
    'nav.age': 'Calculadora de Edad',
    'nav.searchPlaceholder': 'Buscar más de 20 herramientas...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'Categorías',
    'nav.quickTools': 'Herramientas Rápidas',
    'nav.trending': 'Tendencias',
    'nav.exploreAll': 'Ver todas las herramientas',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    'theme.toggle': 'Cambiar tema',
    'lang.select': 'Seleccionar Idioma',
    'lang.language': 'Idioma',
    
    // Hero
    'hero.badge': 'Suite de Productividad • Gratis y Privada',
    'hero.title': 'Herramientas Inteligentes para',
    'hero.highlight': 'Carrera, Riqueza y Estudio.',
    'hero.subtitle': 'Calculadoras rápidas en tu navegador, interés compuesto SIP, salario neto, currículums ATS y edición de imágenes. 100% privado.',
    'hero.exploreBtn': 'Explorar Herramientas',
    'hero.searchPlaceholder': 'Buscar herramientas... (SIP, Salario, EMI, CV, Edad)',
    'hero.quickSipTitle': 'Estimador de Inversión Compuesta SIP',
    'hero.monthlyInvest': 'Inversión Mensual',
    'hero.timeHorizon': 'Plazo (Años)',
    'hero.estValue': 'Valor de Vencimiento Estimado',
    'hero.invested': 'Total Invertido',
    'hero.wealthGain': 'Ganancia Estimada',
    'hero.openFullCalc': 'Abrir Calculadora Completa',

    // Privacy Section
    'privacy.badge': 'Garantía de Privacidad',
    'privacy.title': 'Cero Rastreo. Cero Servidores. Pura Velocidad.',
    'privacy.subtitle': 'Todas las operaciones se ejecutan localmente en tu navegador. Tus datos personales nunca salen de tu dispositivo.',
    'privacy.feat1Title': '100% en el Navegador',
    'privacy.feat1Desc': 'Procesamiento en tiempo real sin esperas ni servidores lentos.',
    'privacy.feat2Title': 'Sin Recolección de Datos',
    'privacy.feat2Desc': 'Sin cuentas obligatorias, sin cookies de seguimiento, sin registros.',
    'privacy.feat3Title': 'Rápido e Instantáneo',
    'privacy.feat3Desc': 'Diseño ultra liviano optimizado para móviles y ordenadores.',

    // Categories
    'cat.sectionBadge': 'Categorías',
    'cat.sectionTitle': 'Explorar por Categoría',
    'cat.toolsCount': 'herramientas',
    'cat.exploreCategory': 'Ver Categoría',

    // Featured Tools
    'tools.featuredBadge': 'Destacados',
    'tools.featuredTitle': 'Utilidades Más Populares',
    'tools.useTool': 'Usar Herramienta',
    'tools.exploreAllCount': 'Ver todas las herramientas',

    // Common
    'common.calculate': 'Calcular',
    'common.reset': 'Restablecer',
    'common.copy': 'Copiar',
    'common.copied': '¡Copiado!',
    'common.download': 'Descargar',
    'common.share': 'Compartir',
    'common.howToUse': 'Cómo Usar',
    'common.faq': 'Preguntas Frecuentes',
    'common.relatedTools': 'Herramientas Relacionadas',
    'common.whyNaviko': '¿Por qué elegir NAVIKO?',

    // Footer
    'footer.tagline': 'Herramientas digitales precisas, privadas y rápidas para estudiantes y profesionales.',
    'footer.privacyBadge': '100% Privado en Cliente • Cero Registros',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.categories': 'Categorías',
    'footer.popular': 'Herramientas Populares',
    'footer.disclaimer': 'Aviso: Las calculadoras de NAVIKO se proporcionan solo con fines informativos y educativos.',
    'footer.copyright': '© 2026 NAVIKO Suite. Todos los derechos reservados.',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.finance': 'Finance & Investissement',
    'nav.calculators': 'Calculatrices',
    'nav.student': 'Outils Étudiants',
    'nav.career': 'Outils Carrière',
    'nav.image': 'Outils Image',
    'nav.allTools': 'Tous les Outils',
    'nav.blog': 'Articles & Guides',
    'nav.budget': 'Planificateur de Budget',
    'nav.debtClock': 'Horloge de la Dette',
    'nav.scientific': 'Calculatrice Scientifique',
    'nav.numberCalc': 'Calculatrice Simple',
    'nav.percentage': 'Calculateur de Pourcentage',
    'nav.age': 'Calculateur d\'Âge',
    'nav.searchPlaceholder': 'Rechercher plus de 20 outils...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'Catégories',
    'nav.quickTools': 'Outils Rapides',
    'nav.trending': 'Tendance',
    'nav.exploreAll': 'Voir tous les outils',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'theme.system': 'Système',
    'theme.toggle': 'Changer de thème',
    'lang.select': 'Choisir la Langue',
    'lang.language': 'Langue',
    
    // Hero
    'hero.badge': 'Suite de Productivité • 100% Gratuite & Privée',
    'hero.title': 'Des Outils Intelligents pour',
    'hero.highlight': 'Carrière, Finance & Études.',
    'hero.subtitle': 'Calculatrices ultra-rapides, intérêts composés, salaire net, CV ATS et outils d\'images. Confidentialité totale.',
    'hero.exploreBtn': 'Explorer les Outils',
    'hero.searchPlaceholder': 'Rechercher... (SIP, Salaire, Prêt, CV, Âge)',
    'hero.quickSipTitle': 'Simulateur d\'Investissement Intérêts Composés',
    'hero.monthlyInvest': 'Investissement Mensuel',
    'hero.timeHorizon': 'Durée (Années)',
    'hero.estValue': 'Valeur Finale Estimée',
    'hero.invested': 'Total Investi',
    'hero.wealthGain': 'Gain Estimé',
    'hero.openFullCalc': 'Ouvrir le simulateur complet',

    // Privacy Section
    'privacy.badge': 'Garantie Confidentialité',
    'privacy.title': 'Zéro Suivi. Zéro Stockage Serveur. Vitesse Pure.',
    'privacy.subtitle': 'Tous les calculs s\'exécutent exclusivement dans votre navigateur. Vos données personnelles restent chez vous.',
    'privacy.feat1Title': '100% Côté Client',
    'privacy.feat1Desc': 'Calculs instantanés et sécurisés sans temps d\'attente.',
    'privacy.feat2Title': 'Zéro Collecte de Données',
    'privacy.feat2Desc': 'Aucun compte requis, aucun cookie espion, aucun stockage de fichiers.',
    'privacy.feat3Title': 'Rapide et Léger',
    'privacy.feat3Desc': 'Interface ultra fluide conçue pour tous vos appareils.',

    // Categories
    'cat.sectionBadge': 'Toutes les Catégories',
    'cat.sectionTitle': 'Parcourir par Catégorie',
    'cat.toolsCount': 'outils',
    'cat.exploreCategory': 'Explorer la Catégorie',

    // Featured Tools
    'tools.featuredBadge': 'Sélection Populaire',
    'tools.featuredTitle': 'Outils les Plus Utilisés',
    'tools.useTool': 'Utiliser',
    'tools.exploreAllCount': 'Voir tous les outils',

    // Common
    'common.calculate': 'Calculer',
    'common.reset': 'Réinitialiser',
    'common.copy': 'Copier',
    'common.copied': 'Copié !',
    'common.download': 'Télécharger',
    'common.share': 'Partager',
    'common.howToUse': 'Mode d\'Emploi',
    'common.faq': 'Questions Fréquentes',
    'common.relatedTools': 'Outils Recommandés',
    'common.whyNaviko': 'Pourquoi Choisir NAVIKO ?',

    // Footer
    'footer.tagline': 'Outils numériques rapides, précis et privés pour professionnels et étudiants.',
    'footer.privacyBadge': '100% Privé Côté Client • Zéro Journal',
    'footer.quickLinks': 'Accès Rapide',
    'footer.categories': 'Catégories',
    'footer.popular': 'Outils Populaires',
    'footer.disclaimer': 'Avertissement : Les outils NAVIKO sont fournis à titre informatif et éducatif uniquement.',
    'footer.copyright': '© 2026 NAVIKO Suite. Tous droits réservés.',
  },

  de: {
    'nav.home': 'Startseite',
    'nav.finance': 'Finanzen & Vermögen',
    'nav.calculators': 'Rechner',
    'nav.student': 'Studenten-Tools',
    'nav.career': 'Karriere-Tools',
    'nav.image': 'Bild-Tools',
    'nav.allTools': 'Alle Werkzeuge',
    'nav.blog': 'Blog & Ratgeber',
    'nav.budget': 'Budgetplaner',
    'nav.debtClock': 'Schuldenuhr',
    'nav.scientific': 'Wissenschaftlicher Rechner',
    'nav.numberCalc': 'Zahlenrechner',
    'nav.percentage': 'Prozentrechner',
    'nav.age': 'Altersrechner',
    'nav.searchPlaceholder': 'Über 20 smarte Tools durchsuchen...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'Kategorien',
    'nav.quickTools': 'Schnellzugriff',
    'nav.trending': 'Beliebt',
    'nav.exploreAll': 'Alle Tools ansehen',
    'theme.light': 'Hell',
    'theme.dark': 'Dunkel',
    'theme.system': 'System',
    'theme.toggle': 'Design wechseln',
    'lang.select': 'Sprache auswählen',
    'lang.language': 'Sprache',
    
    // Hero
    'hero.badge': 'Next-Gen Produktivität • Kostenlos & Privat',
    'hero.title': 'Smarte Werkzeuge für',
    'hero.highlight': 'Karriere, Vermögen & Studium.',
    'hero.subtitle': 'Blitzschnelle Rechner im Browser, Zinseszins, Nettogehalt, Lebenslauf-Erstellung und Bildbearbeitung. 100% privat.',
    'hero.exploreBtn': 'Tools Entdecken',
    'hero.searchPlaceholder': 'Tools suchen... (Sparplan, Gehalt, Kredit, Alter)',
    'hero.quickSipTitle': 'Zinseszins Sparplan Rechner',
    'hero.monthlyInvest': 'Monatliche Sparrate',
    'hero.timeHorizon': 'Laufzeit (Jahre)',
    'hero.estValue': 'Geschätztes Endkapital',
    'hero.invested': 'Eingezahltes Kapital',
    'hero.wealthGain': 'Zinsgewinn',
    'hero.openFullCalc': 'Vollständigen Rechner öffnen',

    // Privacy Section
    'privacy.badge': 'Datenschutz-Garantie',
    'privacy.title': 'Kein Tracking. Keine Server-Speicherung. Maximale Geschwindigkeit.',
    'privacy.subtitle': 'Alle Berechnungen finden direkt in Ihrem Webbrowser statt. Ihre persönlichen Daten verlassen niemals Ihr Gerät.',
    'privacy.feat1Title': '100% Client-Side',
    'privacy.feat1Desc': 'Verarbeitung in Echtzeit ohne Wartezeiten oder Serverübertragung.',
    'privacy.feat2Title': 'Keine Datenerfassung',
    'privacy.feat2Desc': 'Keine Nutzerkonten, keine Tracking-Cookies, keine Datenspeicherung.',
    'privacy.feat3Title': 'Schnell & Offline-fähig',
    'privacy.feat3Desc': 'Schlanke Architektur mit sofortigen Ladezeiten.',

    // Categories
    'cat.sectionBadge': 'Kategorien',
    'cat.sectionTitle': 'Nach Kategorie durchsuchen',
    'cat.toolsCount': 'Tools',
    'cat.exploreCategory': 'Kategorie öffnen',

    // Featured Tools
    'tools.featuredBadge': 'Beliebte Auswahl',
    'tools.featuredTitle': 'Meistgenutzte Werkzeuge',
    'tools.useTool': 'Tool starten',
    'tools.exploreAllCount': 'Alle Tools ansehen',

    // Common
    'common.calculate': 'Berechnen',
    'common.reset': 'Zurücksetzen',
    'common.copy': 'Kopieren',
    'common.copied': 'Kopiert!',
    'common.download': 'Herunterladen',
    'common.share': 'Teilen',
    'common.howToUse': 'Anleitung',
    'common.faq': 'Häufig gestellte Fragen',
    'common.relatedTools': 'Ähnliche Werkzeuge',
    'common.whyNaviko': 'Warum NAVIKO?',

    // Footer
    'footer.tagline': 'Schnelle, präzise und private digitale Werkzeuge für Beruf, Studium und Finanzen.',
    'footer.privacyBadge': '100% Privat im Browser • Keine Protokolle',
    'footer.quickLinks': 'Schnellzugriff',
    'footer.categories': 'Kategorien',
    'footer.popular': 'Beliebte Tools',
    'footer.disclaimer': 'Hinweis: NAVIKO Rechner dienen ausschließlich zu Informations- und Planungszwecken.',
    'footer.copyright': '© 2026 NAVIKO Suite. Alle Rechte vorbehalten.',
  },

  ja: {
    'nav.home': 'ホーム',
    'nav.finance': '金融・資産',
    'nav.calculators': '計算機',
    'nav.student': '学生向けツール',
    'nav.career': 'キャリアツール',
    'nav.image': '画像ツール',
    'nav.allTools': '全ツール一覧',
    'nav.blog': 'ブログ・ガイド',
    'nav.budget': '家計・予算プランナー',
    'nav.debtClock': '国債・債務時計',
    'nav.scientific': '関数電卓',
    'nav.numberCalc': '標準電卓',
    'nav.percentage': '割合・パーセント計算機',
    'nav.age': '年齢・日数計算機',
    'nav.searchPlaceholder': '20以上のツールを検索...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'カテゴリー',
    'nav.quickTools': 'クイックツール',
    'nav.trending': '人気',
    'nav.exploreAll': '全ツールを表示',
    'theme.light': 'ライト',
    'theme.dark': 'ダーク',
    'theme.system': 'システム',
    'theme.toggle': 'テーマ切替',
    'lang.select': '言語を選択',
    'lang.language': '言語',
    
    // Hero
    'hero.badge': '次世代生産性スイート • 完全無料・プライバシー保護',
    'hero.title': '日々の計算と作業を劇的に変える',
    'hero.highlight': 'キャリア・資産・学習ツール。',
    'hero.subtitle': 'ブラウザ内で瞬時に完了する高精度計算、積立投資、手取り給与シミュレーション、履歴書作成、画像圧縮。データ収集ゼロ。',
    'hero.exploreBtn': 'ツールを見る',
    'hero.searchPlaceholder': 'ツールを検索... (積立, 給与, ローン, 年齢, 履歴書)',
    'hero.quickSipTitle': '積立・複利運用リアルタイム試算',
    'hero.monthlyInvest': '毎月の積立額',
    'hero.timeHorizon': '運用期間（年）',
    'hero.estValue': '将来の受取概算額',
    'hero.invested': '元本合計',
    'hero.wealthGain': '運用益（リターン）',
    'hero.openFullCalc': '詳細な積立計算機を開く',

    // Privacy Section
    'privacy.badge': 'プライバシー完全保証',
    'privacy.title': 'トラッキングなし。サーバー保存なし。超高速。',
    'privacy.subtitle': 'すべての計算や画像処理はお使いのブラウザ内部でのみ実行されます。外部サーバーにお客様の情報が送信されることは一切ありません。',
    'privacy.feat1Title': '100% クライアント処理',
    'privacy.feat1Desc': 'ローカル処理により通信ラグなく瞬時に結果を表示します。',
    'privacy.feat2Title': '個人情報収集ゼロ',
    'privacy.feat2Desc': '会員登録不要、追跡クッキーなし、入力データの保存なし。',
    'privacy.feat3Title': '軽量＆高速起動',
    'privacy.feat3Desc': 'スマホでもパソコンでもストレスなく快適に動作します。',

    // Categories
    'cat.sectionBadge': '全カテゴリー',
    'cat.sectionTitle': 'カテゴリーから探す',
    'cat.toolsCount': 'ツール',
    'cat.exploreCategory': 'カテゴリーを見る',

    // Featured Tools
    'tools.featuredBadge': 'おすすめコレクション',
    'tools.featuredTitle': '最もよく使われているツール',
    'tools.useTool': '利用する',
    'tools.exploreAllCount': '全ツールを見る',

    // Common
    'common.calculate': '計算する',
    'common.reset': 'リセット',
    'common.copy': 'コピー',
    'common.copied': 'コピー完了！',
    'common.download': 'ダウンロード',
    'common.share': '共有',
    'common.howToUse': '使い方ガイド',
    'common.faq': 'よくあるご質問',
    'common.relatedTools': '関連ツール',
    'common.whyNaviko': 'NAVIKOが選ばれる理由',

    // Footer
    'footer.tagline': '学生、社会人、投資家のための高速・高精度・プライバシー重視のデジタルツール。',
    'footer.privacyBadge': '100% クライアント処理 • ログ保存なし',
    'footer.quickLinks': 'クイックリンク',
    'footer.categories': 'カテゴリー',
    'footer.popular': '人気ツール',
    'footer.disclaimer': '免責事項：NAVIKOの計算ツールは参考・教育用として提供されています。',
    'footer.copyright': '© 2026 NAVIKO Productivity Suite. 無断転載を禁じます。',
  },

  bn: {
    'nav.home': 'হোম',
    'nav.finance': 'অর্থ ও সম্পদ',
    'nav.calculators': 'ক্যালকুলেটর',
    'nav.student': 'শিক্ষার্থী টুলস',
    'nav.career': 'ক্যারিয়ার টুলস',
    'nav.image': 'ইমেজ টুলস',
    'nav.allTools': 'সব টুলস',
    'nav.blog': 'ব্লগ ও গাইড',
    'nav.budget': 'বাজেট প্ল্যানার',
    'nav.debtClock': 'জাতীয় ঋণ ঘড়ি',
    'nav.scientific': 'সাইন্টিফিক ক্যালকুলেটর',
    'nav.numberCalc': 'নম্বর ক্যালকুলেটর',
    'nav.percentage': 'শতকরা ক্যালকুলেটর',
    'nav.age': 'বয়স ক্যালকুলেটর',
    'nav.searchPlaceholder': '২০+ স্মার্ট ডিজিটাল টুলস খুঁজুন...',
    'nav.searchShortcut': 'খুঁজুন',
    'nav.categories': 'বিভাগসমূহ',
    'nav.quickTools': 'দ্রুত টুলস',
    'nav.trending': 'জনপ্রিয়',
    'nav.exploreAll': 'সব টুলস দেখুন',
    'theme.light': 'লাইট',
    'theme.dark': 'ডার্ক',
    'theme.system': 'সিস্টেম',
    'theme.toggle': 'থিম পরিবর্তন',
    'lang.select': 'ভাষা নির্বাচন করুন',
    'lang.language': 'ভাষা',
    
    // Hero
    'hero.badge': 'স্মার্ট প্রোডাক্টিভিটি স্যুট • সম্পূর্ণ বিনামূল্যে ও নিরাপদ',
    'hero.title': 'স্মার্ট ডিজিটাল টুলস আপনার',
    'hero.highlight': 'ক্যারিয়ার, সম্পদ ও শিক্ষার জন্য।',
    'hero.subtitle': 'দ্রুতগতির ব্রাউজার ক্যালকুলেটর, এসআইপি চক্রবৃদ্ধি, ইন-হ্যান্ড বেতন, সিভি তৈরি ও ইমেজ প্রসেসিং। ১০০% নিরাপদ ও প্রাইভেট।',
    'hero.exploreBtn': 'টুলস এক্সপ্লোর করুন',
    'hero.searchPlaceholder': 'টুলস খুঁজুন... (SIP, Salary, EMI, CGPA, Resume, Age)',
    'hero.quickSipTitle': 'লাইভ এসআইপি চক্রবৃদ্ধি ক্যালকুলেটর',
    'hero.monthlyInvest': 'মাসিক বিনিয়োগ (টাকা/রুপি)',
    'hero.timeHorizon': 'মেয়াদ (বছর)',
    'hero.estValue': 'আনুমানিক মোট ম্যাচুয়োরিটি মান',
    'hero.invested': 'মোট বিনিয়োগকৃত অর্থ',
    'hero.wealthGain': 'আনুমানিক মুনাফা লাভ',
    'hero.openFullCalc': 'সম্পূর্ণ এসআইপি ক্যালকুলেটর খুলুন',

    // Privacy Section
    'privacy.badge': 'গোপনীয়তা গ্যারান্টি',
    'privacy.title': 'শূন্য ট্র্যাকিং। শূন্য সার্ভার স্টোরেজ। সর্বোচ্চ গতি।',
    'privacy.subtitle': 'সকল গাণিতিক হিসাব এবং ফাইল প্রসেসিং সরাসরি আপনার ব্রাউজারে ঘটে। আপনার তথ্য কখনোই বাইরের সার্ভারে যায় না।',
    'privacy.feat1Title': '১০০% ক্লায়েন্ট-সাইড প্রসেসিং',
    'privacy.feat1Desc': 'কোনো বিলম্ব ছাড়াই নিমেষেই ফলাফল প্রস্তুত হয়।',
    'privacy.feat2Title': 'কোনো তথ্য সংগ্রহ নয়',
    'privacy.feat2Desc': 'কোনো অ্যাকাউন্টের প্রয়োজন নেই, কোনো ট্র্যাকিং কুকি নেই।',
    'privacy.feat3Title': 'দ্রুত ও সহজে ব্যবহারযোগ্য',
    'privacy.feat3Desc': 'মোবাইল ও কম্পিউটারের জন্য নিখুঁত ও দ্রুত আর্কিটেকচার।',

    // Categories
    'cat.sectionBadge': 'সব বিভাগ',
    'cat.sectionTitle': 'ক্যাটাগরি অনুযায়ী খুঁজুন',
    'cat.toolsCount': 'টুলস',
    'cat.exploreCategory': 'বিভাগ দেখুন',

    // Featured Tools
    'tools.featuredBadge': 'জনপ্রিয় টুলস',
    'tools.featuredTitle': 'সবচেয়ে বেশি ব্যবহৃত টুলস',
    'tools.useTool': 'ব্যবহার করুন',
    'tools.exploreAllCount': 'সকল টুলস এক্সপ্লোর করুন',

    // Common
    'common.calculate': 'হিসাব করুন',
    'common.reset': 'রিসেট',
    'common.copy': 'কপি করুন',
    'common.copied': 'কপি সম্পন্ন!',
    'common.download': 'ডাউনলোড',
    'common.share': 'শেয়ার করুন',
    'common.howToUse': 'ব্যবহারবিধি',
    'common.faq': 'সাধারণ জিজ্ঞাসা',
    'common.relatedTools': 'সম্পর্কিত টুলস',
    'common.whyNaviko': 'কেন NAVIKO বেছে নেবেন?',

    // Footer
    'footer.tagline': 'শিক্ষার্থী, পেশাদার ও বিনিয়োগকারীদের জন্য নির্ভরযোগ্য ও দ্রুত ডিজিটাল সমাধান।',
    'footer.privacyBadge': '১০০% ক্লায়েন্ট-সাইড নিরাপদ • শূন্য লগ',
    'footer.quickLinks': 'গুরুত্বপূর্ণ লিংক',
    'footer.categories': 'বিভাগসমূহ',
    'footer.popular': 'জনপ্রিয় টুলস',
    'footer.disclaimer': 'সতর্কবার্তা: NAVIKO ক্যালকুলেটর শুধুমাত্র তথ্য ও শিক্ষার উদ্দেশ্যে প্রদান করা হয়েছে।',
    'footer.copyright': '© ২০২৬ NAVIKO স্মার্ট স্যুট। সর্বস্বত্ব সংরক্ষিত।',
  },

  mr: {
    'nav.home': 'मुख्यपृष्ठ',
    'nav.finance': 'वित्त आणि संपत्ती',
    'nav.calculators': 'कॅल्क्युलेटर',
    'nav.student': 'विद्यार्थी टूल्स',
    'nav.career': 'करिअर टूल्स',
    'nav.image': 'इमेज टूल्स',
    'nav.allTools': 'सर्व टूल्स',
    'nav.blog': 'ब्लॉग व मार्गदर्शक',
    'nav.budget': 'बजेट प्लॅनर',
    'nav.debtClock': 'राष्ट्रीय कर्ज घड्याळ',
    'nav.scientific': 'सायंटिफिक कॅल्क्युलेटर',
    'nav.numberCalc': 'नंबर कॅल्क्युलेटर',
    'nav.percentage': 'टक्केवारी कॅल्क्युलेटर',
    'nav.age': 'वय कॅल्क्युलेटर',
    'nav.searchPlaceholder': '२०+ स्मार्ट टूल्स शोधा...',
    'nav.searchShortcut': 'शोधा',
    'nav.categories': 'वर्गवारी',
    'nav.quickTools': 'झटपट टूल्स',
    'nav.trending': 'लोकप्रिय',
    'nav.exploreAll': 'सर्व टूल्स पहा',
    'theme.light': 'लाइट',
    'theme.dark': 'डार्क',
    'theme.system': 'सिस्टम',
    'theme.toggle': 'थीम बदला',
    'lang.select': 'भाषा निवडा',
    'lang.language': 'भाषा',
    
    // Hero
    'hero.badge': 'नेक्स्ट-जेन उत्पादकता सुइट • १००% मोफत व सुरक्षित',
    'hero.title': 'स्मार्ट टूल्स तुमच्या',
    'hero.highlight': 'करिअर, संपत्ती आणि शिक्षणासाठी.',
    'hero.subtitle': 'अचूक आणि वेगवान कॅल्क्युलेटर, एसआयपी चक्रवाढ व्याज, पगार कर विभाजन, रिझ्युमे मेकर व इमेज टूल्स. १००% सुरक्षित.',
    'hero.exploreBtn': 'टूल्स पहा',
    'hero.searchPlaceholder': 'टूल्स शोधा... (SIP, Salary, EMI, CGPA, Resume, Age)',
    'hero.quickSipTitle': 'थेट एसआयपी चक्रवाढ कॅल्क्युलेटर',
    'hero.monthlyInvest': 'मासिक गुंतवणूक (₹)',
    'hero.timeHorizon': 'कालावधी (वर्षे)',
    'hero.estValue': 'अंदाजित एकूण मॅच्युरिटी रक्कम',
    'hero.invested': 'एकूण गुंतवलेली रक्कम',
    'hero.wealthGain': 'अंदाजित परतावा नफा',
    'hero.openFullCalc': 'संपूर्ण एसआयपी कॅल्क्युलेटर उघडा',

    // Privacy Section
    'privacy.badge': 'गोपनीयतेची हमी',
    'privacy.title': 'शून्य ट्रॅकिंग. शून्य सर्व्हर स्टोरेज. सर्वोच्च गती.',
    'privacy.subtitle': 'सर्व गणिते आणि फाइल्स थेट तुमच्या वेब ब्राउझरमध्ये सुरक्षितपणे चालतात. तुमचा डेटा कधीही बाहेर जात नाही.',
    'privacy.feat1Title': '१००% क्लायंट-साइड इंजिन',
    'privacy.feat1Desc': 'सर्व गणना थेट तुमच्या डिव्हाइसवर तत्काळ होतात.',
    'privacy.feat2Title': 'शून्य डेटा संकलन',
    'privacy.feat2Desc': 'कोणतेही खाते आवश्यक नाही, ट्रॅकिंग नाही आणि इनपुट सेव्ह केले जात नाहीत.',
    'privacy.feat3Title': 'झटपट आणि सोपे',
    'privacy.feat3Desc': 'अल्ट्रा-लाइटवेट डिझाइन जे मोबाइलवरही अत्यंत वेगाने काम करते.',

    // Categories
    'cat.sectionBadge': 'सर्व वर्गवारी',
    'cat.sectionTitle': 'विभागानुसार शोधा',
    'cat.toolsCount': 'टूल्स',
    'cat.exploreCategory': 'वर्गवारी पहा',

    // Featured Tools
    'tools.featuredBadge': 'विशेष संग्रह',
    'tools.featuredTitle': 'सर्वाधिक लोकप्रिय टूल्स',
    'tools.useTool': 'वापरा',
    'tools.exploreAllCount': 'सर्व टूल्स एक्सप्लोर करा',

    // Common
    'common.calculate': 'गणना करा',
    'common.reset': 'रीसेट',
    'common.copy': 'कॉपी करा',
    'common.copied': 'कॉपी झाले!',
    'common.download': 'डाउनलोड',
    'common.share': 'शेअर करा',
    'common.howToUse': 'कसे वापरावे',
    'common.faq': 'सतत विचारले जाणारे प्रश्न',
    'common.relatedTools': 'संबंधित टूल्स',
    'common.whyNaviko': 'NAVIKO का निवडावे?',

    // Footer
    'footer.tagline': 'विद्यार्थी, व्यावसायिक आणि गुंतवणूकदारांसाठी वेगवान व विश्वासू डिजिटल साधने.',
    'footer.privacyBadge': '१००% क्लायंट-साइड सुरक्षित • शून्य लॉग',
    'footer.quickLinks': 'महत्त्वाच्या लिंक्स',
    'footer.categories': 'वर्गवारी',
    'footer.popular': 'लोकप्रिय टूल्स',
    'footer.disclaimer': 'अस्वीकरण: NAVIKO वित्तीय कॅल्क्युलेटर केवळ माहिती आणि नियोजनाच्या उद्देशाने दिले आहेत.',
    'footer.copyright': '© २०२६ NAVIKO स्मार्ट सुइट. सर्व हक्क सुरक्षित.',
  },

  ar: {
    'nav.home': 'الرئيسية',
    'nav.finance': 'المالية والاستثمار',
    'nav.calculators': 'الحاسبات',
    'nav.student': 'أدوات الطلاب',
    'nav.career': 'أدوات العمل',
    'nav.image': 'أدوات الصور',
    'nav.allTools': 'جميع الأدوات',
    'nav.blog': 'المقالات والأدلة',
    'nav.budget': 'مخطط الميزانية',
    'nav.debtClock': 'ساعة الدين العام',
    'nav.scientific': 'الحاسبة العلمية',
    'nav.numberCalc': 'الحاسبة البسيطة',
    'nav.percentage': 'حاسبة النسبة المئوية',
    'nav.age': 'حاسبة العمر والتاريخ',
    'nav.searchPlaceholder': 'ابحث في أكثر من 20 أداة ذكية...',
    'nav.searchShortcut': '⌘K',
    'nav.categories': 'الفئات',
    'nav.quickTools': 'أدوات سريعة',
    'nav.trending': 'شائع',
    'nav.exploreAll': 'عرض جميع الأدوات',
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    'theme.system': 'النظام',
    'theme.toggle': 'تبديل المظهر',
    'lang.select': 'اختر اللغة',
    'lang.language': 'اللغة',
    
    // Hero
    'hero.badge': 'مجموعة الإنتاجية الذكية • مجانية وخاصة تماماً',
    'hero.title': 'أدوات ذكية متطورة من أجل',
    'hero.highlight': 'المستقبل المهني، الثروة والتعليم.',
    'hero.subtitle': 'حاسبات فائقة السرعة، الفائدة المركبة، تفاصيل الراتب الصافي والضرائب، بناء السيرة الذاتية ومعالجة الصور. خصوصية 100%.',
    'hero.exploreBtn': 'استكشف الأدوات',
    'hero.searchPlaceholder': 'ابحث عن الأدوات... (استثمار، راتب، قرض، سيرة ذاتية، عمر)',
    'hero.quickSipTitle': 'حاسبة الاستثمار التراكمي الفورية',
    'hero.monthlyInvest': 'الاستثمار الشهري',
    'hero.timeHorizon': 'الفترة الزمنية (سنوات)',
    'hero.estValue': 'القيمة الإجمالية المتوقعة',
    'hero.invested': 'إجمالي المبلغ المستثمر',
    'hero.wealthGain': 'الأرباح المتوقعة',
    'hero.openFullCalc': 'فتح الحاسبة الكاملة',

    // Privacy Section
    'privacy.badge': 'ضمان الخصوصية التامة',
    'privacy.title': 'بلا تتبع. بلا تخزين في السحابة. سرعة فائقة.',
    'privacy.subtitle': 'تتم جميع العمليات الحسابية ومعالجة الملفات محلياً داخل متصفحك. بياناتك لا تغادر جهازك أبداً.',
    'privacy.feat1Title': '100% معالجة داخل المتصفح',
    'privacy.feat1Desc': 'استجابة فورية دون أي تأخير أو انتظار للسيرفر.',
    'privacy.feat2Title': 'انعدام جمع البيانات',
    'privacy.feat2Desc': 'لا يتطلب تسجيل حساب، ولا ملفات تعريف ارتباط للتعقب.',
    'privacy.feat3Title': 'خفيف وسريع للغاية',
    'privacy.feat3Desc': 'تصميم فائق الخفة متوافق مع كافة الهواتف والأجهزة اللوحية.',

    // Categories
    'cat.sectionBadge': 'جميع الفئات',
    'cat.sectionTitle': 'تصفح حسب الفئة',
    'cat.toolsCount': 'أداة',
    'cat.exploreCategory': 'استكشف الفئة',

    // Featured Tools
    'tools.featuredBadge': 'المجموعة المميزة',
    'tools.featuredTitle': 'الأدوات الأكثر استخداماً',
    'tools.useTool': 'استخدم الأداة',
    'tools.exploreAllCount': 'عرض كافة الأدوات',

    // Common
    'common.calculate': 'احسب',
    'common.reset': 'إعادة ضبط',
    'common.copy': 'نسخ',
    'common.copied': 'تم النسخ!',
    'common.download': 'تحميل',
    'common.share': 'مشاركة',
    'common.howToUse': 'طريقة الاستخدام',
    'common.faq': 'الأسئلة الشائعة',
    'common.relatedTools': 'أدوات ذات صلة',
    'common.whyNaviko': 'لماذا NAVIKO؟',

    // Footer
    'footer.tagline': 'أدوات رقمية دقيقة وخاصة مصممة للطلاب والمهنيين والمستثمرين حول العالم.',
    'footer.privacyBadge': '100% خصوصية على جهازك • بلا سجلات',
    'footer.quickLinks': 'روابط سريعة',
    'footer.categories': 'الفئات',
    'footer.popular': 'الأدوات الشائعة',
    'footer.disclaimer': 'إخلاء مسؤولية: أدوات NAVIKO مخصصة للأغراض التعليمية والإرشادية فقط.',
    'footer.copyright': '© 2026 منصة NAVIKO. جميع الحقوق محفوظة.',
  },
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  languages: LanguageMeta[];
  activeMeta: LanguageMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('naviko_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      setCurrentLanguageState(lang);
      try {
        localStorage.setItem('naviko_language', lang);
      } catch {
        // ignore
      }
      const meta = LANGUAGES.find((l) => l.code === lang);
      if (meta) {
        document.documentElement.dir = meta.dir;
        document.documentElement.lang = meta.code;
      }
    }
  };

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === currentLanguage);
    if (meta) {
      document.documentElement.dir = meta.dir;
      document.documentElement.lang = meta.code;
    }
  }, [currentLanguage]);

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return defaultText || key;
  };

  const activeMeta = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages: LANGUAGES, activeMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
