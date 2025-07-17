// src/pages/AICenterPage.js
import { useEffect, useRef } from 'react';
import { Box, Paper, TextField, IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, CircularProgress, useTheme, Alert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReactMarkdown from 'react-markdown'; // <-- 1. Import ReactMarkdown
import { useAICenter } from '../hooks/useAICenter';
import { useAuth } from '../contexts/AuthContext';

function AICenterPage() {
    const theme = useTheme();
    const { currentUser } = useAuth();
    const { messages, input, setInput, isLoading, error, handleSendMessage } = useAICenter();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const AI_ACCENT_COLOR = theme.palette.info.main;

    // 2. Define custom components to make Markdown render with MUI's Typography
    // This ensures consistent styling with the rest of your app.
    const markdownComponents = {
        p: ({ node, ...props }) => <Typography variant="body1" paragraph sx={{ mb: 1, '&:last-child': { mb: 0 } }} {...props} />,
        strong: ({ node, ...props }) => <Typography component="span" fontWeight="bold" {...props} />,
        em: ({ node, ...props }) => <Typography component="span" fontStyle="italic" {...props} />,
        ol: ({ node, ...props }) => <ol style={{ paddingInlineStart: '20px', margin: 0 }} {...props} />,
        ul: ({ node, ...props }) => <ul style={{ paddingInlineStart: '20px', margin: 0 }} {...props} />,
        li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }}><Typography component="span" {...props} /></li>,
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 49px)', p: { xs: 1, sm: 2 } }}>
            <Paper elevation={3} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
                    <Typography variant="h5" sx={{ color: AI_ACCENT_COLOR, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon /> AI Study Center
                    </Typography>
                </Box>

                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                    {messages.map((msg, index) => (
                        <ListItem key={index} sx={{ alignItems: 'flex-start', py: 1.5 }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: msg.role === 'user' ? theme.palette.secondary.main : AI_ACCENT_COLOR }}>
                                    {msg.role === 'user' ? <AccountCircleIcon /> : <SmartToyIcon />}
                                </Avatar>
                            </ListItemAvatar>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: msg.isError ? theme.palette.error.dark : (msg.role === 'user' ? 'background.paper' : theme.palette.background.default),
                                    border: msg.role === 'user' ? `1px solid ${theme.palette.divider}` : 'none',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    flexGrow: 1,
                                }}
                            >
                                <ListItemText
                                    primary={msg.role === 'user' ? currentUser?.name || 'You' : 'ReactiQuiz AI'}
                                    primaryTypographyProps={{ fontWeight: 'bold', color: msg.isError ? theme.palette.error.contrastText : 'text.primary' }}
                                    // 3. Use ReactMarkdown to render the message text
                                    secondary={
                                        <ReactMarkdown components={markdownComponents}>
                                            {msg.parts[0].text}
                                        </ReactMarkdown>
                                    }
                                    secondaryTypographyProps={{ color: msg.isError ? theme.palette.error.contrastText : 'text.secondary', component: 'div' }}
                                />
                            </Paper>
                        </ListItem>
                    ))}
                    {isLoading && (
                        <ListItem sx={{ justifyContent: 'center' }}>
                           <CircularProgress size={24} sx={{color: AI_ACCENT_COLOR}} />
                           <Typography sx={{ml: 1}} color="text.secondary">Q is thinking...</Typography>
                        </ListItem>
                    )}
                    <div ref={messagesEndRef} />
                </List>
                
                {error && !isLoading && <Alert severity="error" sx={{m: 2, mt: 0}}>{error}</Alert>}

                <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Ask about your results, a concept, or exam strategy..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            endAdornment: (
                                <IconButton type="submit" color="primary" disabled={isLoading || !input.trim()} sx={{ color: AI_ACCENT_COLOR }}>
                                    <SendIcon />
                                </IconButton>
                            )
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default AICenterPage;