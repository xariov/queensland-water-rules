/** Minimal SVG string builder; keeps the renderer free of DOM dependencies. */

export type Attributes = Record<string, string | number | undefined>;

const escapeText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttribute = (value: string): string =>
  escapeText(value).replace(/"/g, '&quot;');

export function element(name: string, attributes: Attributes, ...children: string[]): string {
  const parts = Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}="${escapeAttribute(String(value))}"`);
  const open = parts.length > 0 ? `<${name} ${parts.join(' ')}` : `<${name}`;
  if (children.length === 0) return `${open}/>`;
  return `${open}>${children.join('')}</${name}>`;
}

export function text(content: string, attributes: Attributes): string {
  return element('text', attributes, escapeText(content));
}
