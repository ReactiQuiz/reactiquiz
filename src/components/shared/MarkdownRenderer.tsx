// src/components/shared/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Typography, Link as MuiLink } from '@mui/material';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  if (!text) {
    return null;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <Typography variant="inherit" component="div" sx={{ mt: 1, mb: 1 }}>{children}</Typography>,
        a: ({ children, href }) => <MuiLink href={href}>{children}</MuiLink>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
