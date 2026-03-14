// src/utils/seo.ts

/** Set or create a <meta> tag by name or property attribute. */
export function setMeta(name: string, content: string, property?: boolean): void {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Set or create a <link rel="canonical"> tag. */
export function setCanonical(url: string): void {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/** Set or create a JSON-LD <script> tag. Use `key` to target a specific script. */
export function setJsonLd(data: Record<string, unknown>, key = 'default'): HTMLScriptElement {
  const selector = `script[data-ld-key="${key}"]`;
  let script = document.querySelector(selector) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ld-key', key);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return script;
}
