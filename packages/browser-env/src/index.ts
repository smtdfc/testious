import { JSDOM } from 'jsdom';

export interface TestiousBrowserEnvOption {
  url?: string;
  referrer?: string;
  contentType?: string;
  includeNodeLocations?: boolean;
  pretendToBeVisual?: boolean;
  runScripts?: 'dangerously' | 'outside-only';
  resources?: 'usable' | 'usable';
}

export default function createTestiousDOM(
  html: string,
  options: Partial<TestiousBrowserEnvOption> = {},
) {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    resources: 'usable',
    ...options,
  });

  const { window } = dom;

  if (!('window' in globalThis)) {
    globalThis.window = window as unknown as Window & typeof globalThis;
  }

  if (!('document' in globalThis)) {
    globalThis.document = window.document;
  }

  if (!('navigator' in globalThis)) {
    globalThis.navigator = window.navigator;
  }

  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Node = window.Node;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
  return dom;
}
