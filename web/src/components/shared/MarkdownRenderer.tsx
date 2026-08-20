// src/components/shared/MarkdownRenderer.tsx
/**
 * Markdown Renderer Component
 * 
 * This component renders markdown text with support for:
 * - Standard markdown syntax
 * - Math expressions (LaTeX) using KaTeX
 * - Links and other HTML elements
 * 
 * Used throughout the application to render formatted text,
 * especially for question explanations and descriptions.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'; // Plugin for parsing math expressions
import rehypeKatex from 'rehype-katex'; // Plugin for rendering math with KaTeX
import { Typography, Link as MuiLink } from '@mui/material';

/**
 * MarkdownRendererProps Interface
 * 
 * Props for the MarkdownRenderer component.
 */
interface MarkdownRendererProps {
  text: string; // Markdown text to render
}

/**
 * Markdown Renderer Component
 * 
 * Renders markdown text with:
 * - Standard markdown support (headers, lists, etc.)
 * - Math expression support (LaTeX) via KaTeX
 * - Custom Material-UI styled components
 * - Link support with Material-UI Link component
 * 
 * Features:
 * - Parses markdown syntax
 * - Renders LaTeX math expressions
 * - Styles paragraphs with Material-UI Typography
 * - Converts links to Material-UI Link components
 * 
 * @param {MarkdownRendererProps} props - Component props
 * @returns {JSX.Element | null} Rendered markdown content or null if no text
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  // Don't render if no text provided
  if (!text) {
    return null;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]} // Parse math expressions
      rehypePlugins={[rehypeKatex]} // Render math with KaTeX
      components={{
        // Custom paragraph component with Material-UI Typography
        p: ({ children }) => (
          <Typography variant="inherit" component="div" sx={{ mt: 1, mb: 1 }}>
            {children}
          </Typography>
        ),
        // Custom link component with Material-UI Link
        a: ({ children, href }) => <MuiLink href={href}>{children}</MuiLink>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
