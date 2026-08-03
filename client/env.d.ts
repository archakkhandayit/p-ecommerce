/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL: string
  // Add more environment variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
