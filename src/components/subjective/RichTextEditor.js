// src/components/subjective/RichTextEditor.js
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, IconButton, Paper, Divider, Tooltip } from '@mui/material';

// Import all the icons we need for the toolbar
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';

// This is the toolbar that sits above the text editor
const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ display: 'flex', flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider', p: 0.5 }}>
      <Tooltip title="Bold"><IconButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBoldIcon /></IconButton></Tooltip>
      <Tooltip title="Italic"><IconButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalicIcon /></IconButton></Tooltip>
      <Tooltip title="Underline"><IconButton onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}><FormatUnderlinedIcon /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
      <Tooltip title="Bullet List"><IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulletedIcon /></IconButton></Tooltip>
      <Tooltip title="Numbered List"><IconButton onClick={() => editor.chain().focus().toggleNumberedList().run()} color={editor.isActive('numberedList') ? 'primary' : 'default'}><FormatListNumberedIcon /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />
      <Tooltip title="Code Block"><IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon /></IconButton></Tooltip>
    </Paper>
  );
};

// The main component that combines the toolbar and the editor content area
function RichTextEditor({ onUpdate, content }) {
  const editor = useEditor({
    extensions: [
      StarterKit, // Includes bold, italic, lists, etc.
    ],
    content: content || '', // Initial content
    // This function is called every time the content changes
    onUpdate: ({ editor }) => {
      // We export the content as secure JSON
      onUpdate(editor.getJSON());
    },
    editorProps: {
      attributes: {
        // Apply styles to make it look like a text input field
        class: 'prose prose-invert max-w-none focus:outline-none',
      },
    },
  });

  return (
    <Paper variant="outlined">
      <EditorToolbar editor={editor} />
      <Box sx={{ p: 1.5, minHeight: 150, '& .ProseMirror': { outline: 'none' } }}>
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}

export default RichTextEditor;