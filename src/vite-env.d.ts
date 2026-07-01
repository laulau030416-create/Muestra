/// <reference types="vite/client" />

declare module 'shaders/js' {
  export interface PreviewOptions {
    presetId: string;
    [key: string]: any;
  }
  export interface PreviewInstance {
    destroy?: () => void;
    [key: string]: any;
  }
  export function createPreview(
    element: HTMLElement | null,
    options: PreviewOptions
  ): Promise<PreviewInstance>;
}
