// src/components/notes/NoteRenderer.tsx
/**
 * Note Renderer Component
 * 
 * High-performance Markdown parser and renderer supporting:
 * - GFM tables (responsive, styled table headers, borders, hover states)
 * - LaTeX math formulas ($...$ inline and $$...$$ display) via KaTeX
 * - Interactive Mermaid diagrams (flowcharts, mindmaps, graphs) via Mermaid.js
 * - GitHub-style Alert callout cards ([!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]) with Lucide icons
 * - One-click Copy Code buttons on code snippets with language badges
 * - Clean dark theme typography (h1, h2, h3, p, ul, ol, li, blockquotes)
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

// Utility to slugify heading text for anchor links
export const slugifyHeading = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// Helper to extract plain text from React children
function extractTextFromChildren(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join('');
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractTextFromChildren((node.props as any).children);
  }
  return '';
}

// Mermaid Diagram Render Block
interface MermaidBlockProps {
  chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const uniqueIdRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !chart.trim()) {
        if (isMounted) {
          setSvg('');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });

        const renderId = `${uniqueIdRef.current}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(renderId, chart.trim());

        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err?.message || 'Failed to render Mermaid diagram');
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-300">
        <div className="flex items-center gap-2 mb-2 font-semibold text-xs uppercase tracking-wider text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Diagram Render Note</span>
        </div>
        <pre className="text-xs overflow-x-auto bg-slate-950/80 p-3 rounded-lg text-slate-300 font-mono border border-slate-800">
          {chart}
        </pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-4 p-8 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-400 border-t-transparent mr-3" />
        <span>Rendering diagram...</span>
      </div>
    );
  }

  return (
    <div className="my-5 p-4 rounded-xl border border-slate-700/80 bg-slate-900/70 overflow-x-auto flex justify-center shadow-inner">
      <div
        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

// Code and Pre Blocks
interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  // Render Mermaid diagrams
  if (!inline && language === 'mermaid') {
    return <MermaidBlock chart={codeContent} />;
  }

  // Inline code snippet
  if (inline || !className) {
    return (
      <code
        className="px-1.5 py-0.5 text-xs sm:text-sm font-mono bg-slate-800 text-sky-400 rounded border border-slate-700/60"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Styled non-mermaid code block
  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md">
      {/* Code Header Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-400 font-mono">
        <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="m-0 p-4 overflow-x-auto font-mono text-sm leading-relaxed text-slate-200 bg-slate-950/70">
        <code className={className} {...props}>
          {codeContent}
        </code>
      </pre>
    </div>
  );
};

// GitHub Callout Configuration
const ALERT_CONFIG: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    border: string;
    bg: string;
    titleColor: string;
  }
> = {
  NOTE: {
    title: 'NOTE',
    icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    border: 'border-blue-500/40',
    bg: 'bg-blue-950/30',
    titleColor: 'text-blue-400',
  },
  TIP: {
    title: 'TIP',
    icon: <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />,
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/30',
    titleColor: 'text-emerald-400',
  },
  IMPORTANT: {
    title: 'IMPORTANT',
    icon: <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />,
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/30',
    titleColor: 'text-purple-400',
  },
  WARNING: {
    title: 'WARNING',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/30',
    titleColor: 'text-amber-400',
  },
  CAUTION: {
    title: 'CAUTION',
    icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
    border: 'border-rose-500/40',
    bg: 'bg-rose-950/30',
    titleColor: 'text-rose-400',
  },
};

// Custom Blockquote for Standard Quotes & GitHub-style Alert Callouts
const CustomBlockquote = ({ children }: { children?: React.ReactNode }) => {
  const rawText = extractTextFromChildren(children).trim();
  const alertMatch = rawText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

  // If not an alert, render standard styled blockquote with left border
  if (!alertMatch) {
    return (
      <blockquote className="my-4 pl-4 py-2 border-l-4 border-sky-500/60 bg-slate-800/40 rounded-r-lg italic text-slate-300 [&>p]:my-1">
        {children}
      </blockquote>
    );
  }

  const alertType = alertMatch[1].toUpperCase();
  const config = ALERT_CONFIG[alertType] || ALERT_CONFIG.NOTE;

  // Clean out the [!TAG] prefix from inner content
  let tagStripped = false;
  const tagRegex = new RegExp(`^\\[!${alertType}\\]\\s*`, 'i');

  const removeTagFromNode = (node: React.ReactNode): React.ReactNode => {
    if (tagStripped) return node;

    if (typeof node === 'string') {
      if (tagRegex.test(node.trimStart())) {
        tagStripped = true;
        const cleaned = node.trimStart().replace(tagRegex, '').trimStart();
        return cleaned.length > 0 ? cleaned : null;
      }
      return node;
    }

    if (Array.isArray(node)) {
      const filtered = node.map(removeTagFromNode).filter(n => n !== null && n !== '');
      return filtered.length > 0 ? filtered : null;
    }

    if (React.isValidElement(node)) {
      const pProps = node.props as any;
      if (pProps && pProps.children !== undefined) {
        const newChild = removeTagFromNode(pProps.children);
        if (newChild === null || (Array.isArray(newChild) && newChild.length === 0)) {
          return null;
        }
        return React.cloneElement(node, { ...pProps, children: newChild });
      }
    }

    return node;
  };

  const cleanedChildren = removeTagFromNode(children);

  return (
    <div className={`my-4 p-4 rounded-xl border ${config.border} ${config.bg} shadow-sm space-y-2`}>
      <div className={`flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${config.titleColor}`}>
        {config.icon}
        <span>{config.title}</span>
      </div>
      <div className="text-sm leading-relaxed text-slate-200 [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {cleanedChildren}
      </div>
    </div>
  );
};

// Custom Table Components
const TableContainer = ({ children, ...props }: any) => (
  <div className="overflow-x-auto my-5 rounded-xl border border-slate-700 bg-slate-900/70 shadow-md">
    <table className="w-full text-left text-sm text-slate-200 border-collapse" {...props}>
      {children}
    </table>
  </div>
);

const Thead = ({ children, ...props }: any) => (
  <thead className="bg-slate-800/90 text-xs uppercase font-semibold text-slate-300 border-b border-slate-700 tracking-wider" {...props}>
    {children}
  </thead>
);

const Tbody = ({ children, ...props }: any) => (
  <tbody className="divide-y divide-slate-700/70" {...props}>
    {children}
  </tbody>
);

const Tr = ({ children, ...props }: any) => (
  <tr className="hover:bg-slate-800/50 transition-colors duration-150" {...props}>
    {children}
  </tr>
);

const Th = ({ children, ...props }: any) => (
  <th className="px-4 py-3 font-semibold text-slate-200 border-r border-slate-700/60 last:border-r-0 whitespace-nowrap" {...props}>
    {children}
  </th>
);

const Td = ({ children, ...props }: any) => (
  <td className="px-4 py-3 text-slate-300 border-r border-slate-700/60 last:border-r-0 align-top" {...props}>
    {children}
  </td>
);

// Headings & Text
const H1 = ({ children }: any) => {
  const text = extractTextFromChildren(children);
  const id = slugifyHeading(text);
  return (
    <h1
      id={id}
      className="text-2xl sm:text-3xl font-bold text-slate-100 mt-8 mb-4 pb-2 border-b border-slate-700/80 scroll-mt-24 tracking-tight"
    >
      {children}
    </h1>
  );
};

const H2 = ({ children }: any) => {
  const text = extractTextFromChildren(children);
  const id = slugifyHeading(text);
  return (
    <h2
      id={id}
      className="text-xl sm:text-2xl font-bold text-slate-100 mt-6 mb-3 scroll-mt-24 tracking-tight"
    >
      {children}
    </h2>
  );
};

const H3 = ({ children }: any) => {
  const text = extractTextFromChildren(children);
  const id = slugifyHeading(text);
  return (
    <h3
      id={id}
      className="text-lg sm:text-xl font-semibold text-slate-200 mt-5 mb-2 scroll-mt-24 tracking-tight"
    >
      {children}
    </h3>
  );
};

const P = ({ children, ...props }: any) => (
  <p className="text-slate-300 leading-relaxed my-3" {...props}>
    {children}
  </p>
);

const Ul = ({ children, ...props }: any) => (
  <ul className="list-disc list-outside pl-6 my-3 space-y-1.5 text-slate-300" {...props}>
    {children}
  </ul>
);

const Ol = ({ children, ...props }: any) => (
  <ol className="list-decimal list-outside pl-6 my-3 space-y-1.5 text-slate-300" {...props}>
    {children}
  </ol>
);

const Li = ({ children, ...props }: any) => (
  <li className="leading-relaxed" {...props}>
    {children}
  </li>
);

const A = ({ href, children, ...props }: any) => (
  <a
    href={href}
    target={href?.startsWith('http') ? '_blank' : undefined}
    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    className="text-sky-400 hover:text-sky-300 underline underline-offset-4 transition-colors"
    {...props}
  >
    {children}
  </a>
);

const Hr = () => <hr className="my-6 border-slate-700/80" />;

// NoteRenderer Props Interface
export interface NoteRendererProps {
  content?: string;
  text?: string;
  children?: string;
  fontSizeMultiplier?: number;
  className?: string;
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({
  content,
  text,
  children,
  fontSizeMultiplier = 1,
  className = '',
}) => {
  const markdownText = content ?? text ?? children ?? '';

  return (
    <div
      className={`note-renderer text-slate-200 ${className}`}
      style={{
        fontSize: fontSizeMultiplier !== 1 ? `${fontSizeMultiplier}rem` : undefined,
        lineHeight: 1.75,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          code: CodeBlock,
          blockquote: CustomBlockquote,
          table: TableContainer,
          thead: Thead,
          tbody: Tbody,
          tr: Tr,
          th: Th,
          td: Td,
          h1: H1,
          h2: H2,
          h3: H3,
          p: P,
          ul: Ul,
          ol: Ol,
          li: Li,
          a: A,
          hr: Hr,
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
};

export default NoteRenderer;
