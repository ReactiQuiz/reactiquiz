// src/components/notes/TableOfContents.tsx
/**
 * Table of Contents Component
 * 
 * Extracts markdown headings (#, ##, ###) and renders a sticky navigation list
 * with active scroll highlighting and smooth scrolling to anchors.
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { slugifyHeading } from './NoteRenderer';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Extracts markdown headings from a raw markdown string.
 */
export const extractHeadings = (markdown: string): TocHeading[] => {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings: TocHeading[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Remove any trailing markdown formatting from heading text
      const cleanText = rawText.replace(/[*_`[\]]/g, '').trim();
      const id = slugifyHeading(cleanText);
      headings.push({ id, text: cleanText, level });
    }
  }

  return headings;
};

interface TableOfContentsProps {
  content: string;
  accentColor?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, accentColor }) => {
  const theme = useTheme();
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);
    if (extracted.length > 0) {
      setActiveId(extracted[0].id);
    }
  }, [content]);

  // Scrollspy effect to highlight active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map(h => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 140;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  const primaryColor = accentColor || theme.palette.primary.main;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 100,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        p: 2,
        borderRadius: 2,
        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <FormatListBulletedIcon fontSize="small" sx={{ color: primaryColor }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
          Table of Contents
        </Typography>
      </Box>

      <List dense disablePadding>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent = (heading.level - 1) * 12;

          return (
            <ListItem key={heading.id} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => scrollToHeading(heading.id)}
                sx={{
                  py: 0.5,
                  pl: `${8 + indent}px`,
                  pr: 1,
                  borderRadius: 1.5,
                  transition: 'all 150ms ease',
                  bgcolor: isActive ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
                  borderLeft: isActive ? `3px solid ${primaryColor}` : '3px solid transparent',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  },
                }}
              >
                <ListItemText
                  primary={heading.text}
                  primaryTypographyProps={{
                    fontSize: heading.level === 1 ? '0.85rem' : heading.level === 2 ? '0.8rem' : '0.75rem',
                    fontWeight: isActive ? 700 : heading.level === 1 ? 600 : 400,
                    color: isActive ? primaryColor : 'text.secondary',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default TableOfContents;
