// src/components/dashboard/TopicPerformanceList.js
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

function TopicPerformanceList({ topics, subjectName }) {
    const theme = useTheme();

    if (!topics || topics.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                    No quizzes taken for any specific topic in {subjectName} during this period.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5 }, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Topic Performance in {subjectName}</Typography>
            <List>
                {topics.map((topic, index) => (
                    <React.Fragment key={topic.id}>
                        <ListItem>
                            <ListItemText
                                primary={topic.name}
                                secondary={`${topic.count} quiz(zes) taken`}
                                sx={{ flexBasis: '60%' }}
                            />
                            <Box sx={{ width: '100%', flexBasis: '40%', ml: 2 }}>
                                <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    {topic.average}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={topic.average}
                                    sx={{
                                        height: 8, borderRadius: 4,
                                        backgroundColor: alpha(theme.palette.grey[500], 0.2),
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: theme.palette.info.main,
                                        }
                                    }}
                                />
                            </Box>
                        </ListItem>
                        {index < topics.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}

export default TopicPerformanceList;