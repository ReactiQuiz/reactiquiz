// src/components/notes/MarkdownRenderer.tsx
/**
 * Note Renderer / Markdown Renderer Export
 * 
 * Re-exports NoteRenderer and slugifyHeading for backward compatibility.
 */

import NoteRenderer, { slugifyHeading, NoteRendererProps } from './NoteRenderer';

export { NoteRenderer, slugifyHeading };
export type { NoteRendererProps };

export const MarkdownRenderer = NoteRenderer;
export default NoteRenderer;
