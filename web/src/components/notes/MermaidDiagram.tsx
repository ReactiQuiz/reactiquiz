// src/components/notes/MermaidDiagram.tsx
/**
 * Mermaid Diagram Component
 * 
 * Renders Mermaid flowcharts, sequence diagrams, mind maps, and entity relation
 * diagrams asynchronously with error boundary and theme synchronization.
 */

import React, { useEffect, useRef, useState, useId } from 'react';
import { Box, Typography, CircularProgress, useTheme, Alert } from '@mui/material';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const theme = useTheme();
  const rawId = useId();
  const cleanId = 'mermaid-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || !chart.trim()) {
        setSvgContent('');
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      setError(null);

      try {
        const isDark = theme.palette.mode === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          themeVariables: {
            fontFamily: theme.typography.fontFamily,
            darkMode: isDark,
            background: isDark ? '#0F172A' : '#F8FAFC',
            primaryColor: isDark ? '#38BDF8' : '#0284C7',
            primaryTextColor: isDark ? '#F8FAFC' : '#0F172A',
            lineColor: isDark ? '#64748B' : '#94A3B8',
          },
        });

        // Use a unique ID for every render pass
        const renderId = `${cleanId}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, chart.trim());

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to render diagram.');
          setIsRendering(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, theme.palette.mode, theme.typography.fontFamily, cleanId]);

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Diagram Syntax Note:
          </Typography>
          <Box component="pre" sx={{ m: 0, p: 1, fontSize: '0.75rem', overflowX: 'auto', bgcolor: 'action.hover', borderRadius: 1 }}>
            {chart}
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        my: 2.5,
        p: 2,
        borderRadius: 2,
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)',
        border: (t) => `1px solid ${t.palette.divider}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowX: 'auto',
        minHeight: 120,
        '& svg': {
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
        },
      }}
    >
      {isRendering ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="caption" color="text.secondary">Rendering diagram...</Typography>
        </Box>
      ) : (
        <Box
          dangerouslySetInnerHTML={{ __html: svgContent }}
          sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Box>
  );
};

export default MermaidDiagram;
