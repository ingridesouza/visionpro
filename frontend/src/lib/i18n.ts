type Locale = "pt-BR" | "en";

const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    // Permission
    "app.title": "VisionPro",
    "app.subtitle": "Analise visual em tempo real",
    "permission.description":
      "Acesse sua camera para detectar expressoes faciais, reconhecer gestos em Libras e desenhar com as maos.",
    "permission.button": "Permitir Camera",
    "permission.denied": "Permissao da camera negada. Por favor, permita o acesso.",
    "permission.error": "Falha ao acessar a camera.",

    // Connection
    "status.connected": "Conectado",
    "status.connecting": "Conectando...",
    "status.disconnected": "Desconectado",
    "status.error": "Indisponivel",
    "status.error.hint": "Backend offline",

    // Emotions
    "emotion.happy": "Feliz",
    "emotion.sad": "Triste",
    "emotion.angry": "Com Raiva",
    "emotion.surprise": "Surpreso",
    "emotion.neutral": "Neutro",
    "emotion.sleeping": "Dormindo",
    "emotion.fear": "Com Medo",
    "emotion.disgust": "Nojo",
    "emotion.no_face": "Nenhum rosto detectado",

    // Features
    "feature.emotions": "Sentimentos",
    "feature.drawing": "Desenhar",
    "feature.libras": "Libras",
    "feature.clear_drawing": "Limpar desenho",
    "feature.backspace": "Apagar",
    "feature.clear_text": "Limpar texto",

    // Libras
    "libras.waiting": "Mostre uma letra...",

    // Loading
    "loading.models": "Carregando modelos de IA...",
    "loading.camera": "Iniciando camera...",

    // Theme
    "theme.dark": "Escuro",
    "theme.light": "Claro",
  },
  en: {
    "app.title": "VisionPro",
    "app.subtitle": "Real-time visual analysis",
    "permission.description":
      "Access your camera to detect facial expressions, recognize Libras gestures, and draw with your hands.",
    "permission.button": "Allow Camera",
    "permission.denied": "Camera permission denied. Please allow access.",
    "permission.error": "Failed to access camera.",

    "status.connected": "Connected",
    "status.connecting": "Connecting...",
    "status.disconnected": "Disconnected",
    "status.error": "Unavailable",
    "status.error.hint": "Backend offline",

    "emotion.happy": "Happy",
    "emotion.sad": "Sad",
    "emotion.angry": "Angry",
    "emotion.surprise": "Surprised",
    "emotion.neutral": "Neutral",
    "emotion.sleeping": "Sleeping",
    "emotion.fear": "Afraid",
    "emotion.disgust": "Disgust",
    "emotion.no_face": "No face detected",

    "feature.emotions": "Emotions",
    "feature.drawing": "Draw",
    "feature.libras": "Libras",
    "feature.clear_drawing": "Clear drawing",
    "feature.backspace": "Delete",
    "feature.clear_text": "Clear text",

    "libras.waiting": "Show a letter...",

    "loading.models": "Loading AI models...",
    "loading.camera": "Starting camera...",

    "theme.dark": "Dark",
    "theme.light": "Light",
  },
};

let currentLocale: Locale = "pt-BR";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  return translations[currentLocale][key] ?? key;
}

export function getAvailableLocales(): Locale[] {
  return ["pt-BR", "en"];
}
