/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOICE_DETECTION_API_URL?: string;
  readonly VITE_VOICE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
