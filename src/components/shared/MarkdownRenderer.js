// src/components/shared/MarkdownRenderer.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Typography, Link as MuiLink } from '@mui/material';

// This component will render markdown text and correctly format LaTeX math blocks.
function MarkdownRenderer({ text }) {
    if (!text) {
        return null;
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                p: ({ node, ...props }) => <Typography variant="inherit" component="div" sx={{ mt: 1, mb: 1 }} {...props} />,
                a: ({ node, ...props }) => <MuiLink {...props} />,
                // Add more custom components for other markdown elements if needed
            }}
        >
            {text}
        </ReactMarkdown>
    );
}

export default MarkdownRenderer;