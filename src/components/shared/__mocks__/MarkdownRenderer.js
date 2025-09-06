// src/components/shared/__mocks__/MarkdownRenderer.js

import React from 'react';

// This is our fake MarkdownRenderer.
// It's a simple function that takes the 'text' prop and renders it inside a div.
// This is perfect for our tests, as we can easily check if the correct text is present.
const MockMarkdownRenderer = ({ text }) => {
  if (!text) return null;
  return <div data-testid="markdown-content">{text}</div>;
};

export default MockMarkdownRenderer;