// src/components/results/QuestionBreakdown.tsx
/**
 * Question Breakdown Component
 * 
 * Displays detailed question-by-question breakdown with option states,
 * user selection indicators, correct answer highlight, and explanations.
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, ListItemIcon, useTheme, alpha, Chip, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MarkdownRenderer from '../shared/MarkdownRenderer';

function QuestionBreakdown({ detailedQuestions }: { detailedQuestions: any[] }) {
  const theme = useTheme();
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const neutralColor = theme.palette.text.disabled;

  if (!detailedQuestions || detailedQuestions.length === 0) {
    return (
      <Typography sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
        No question breakdown is available for this result.
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
        Detailed Question Breakdown
      </Typography>

      {detailedQuestions.map((question, index) => {
        const borderAccent = question.isAnswered
          ? (question.isCorrect ? successColor : errorColor)
          : neutralColor;

        return (
          <Paper
            key={question.id || index}
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              borderLeft: `5px solid ${borderAccent}`,
              borderTop: `1px solid ${theme.palette.divider}`,
              borderRight: `1px solid ${theme.palette.divider}`,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme => alpha(theme.palette.background.paper, 0.75),
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Question Header & Status Chip */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Question {index + 1}
              </Typography>

              {question.isAnswered ? (
                question.isCorrect ? (
                  <Chip
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                    label="Correct"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                ) : (
                  <Chip
                    icon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
                    label="Incorrect"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )
              ) : (
                <Chip label="Not Answered" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              )}
            </Box>

            {/* Question Text */}
            <Box sx={{ mb: 2.5, fontSize: '1.05rem', color: 'text.primary', fontWeight: 500 }}>
              <MarkdownRenderer text={question.text} />
            </Box>

            {/* Options List */}
            {Array.isArray(question.options) && question.options.length > 0 && (
              <List dense sx={{ py: 0, mb: question.explanation ? 2 : 0 }}>
                {question.options.map((opt: any) => {
                  const isUserSelected = opt.id === question.userAnswerId;
                  const isCorrectAnswer = opt.id === question.correctOptionId;

                  let optionBg = alpha(theme.palette.action.hover, 0.05);
                  let optionBorder = theme.palette.divider;
                  let icon = <RadioButtonUncheckedIcon fontSize="small" sx={{ color: theme.palette.action.disabled }} />;

                  if (isCorrectAnswer) {
                    optionBg = alpha(successColor, 0.15);
                    optionBorder = alpha(successColor, 0.4);
                    icon = <CheckCircleOutlineIcon fontSize="small" sx={{ color: successColor }} />;
                  }

                  if (isUserSelected) {
                    icon = <RadioButtonCheckedIcon fontSize="small" sx={{ color: isCorrectAnswer ? successColor : errorColor }} />;
                    if (!isCorrectAnswer) {
                      optionBg = alpha(errorColor, 0.15);
                      optionBorder = alpha(errorColor, 0.4);
                    }
                  }

                  return (
                    <ListItem
                      key={opt.id}
                      sx={{
                        my: 1,
                        borderRadius: 2,
                        py: 1.25,
                        px: 2,
                        bgcolor: optionBg,
                        border: `1px solid ${optionBorder}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={<MarkdownRenderer text={opt.text} />}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: (isUserSelected || isCorrectAnswer) ? 700 : 500,
                          color: isCorrectAnswer ? successColor : (isUserSelected ? errorColor : 'text.primary'),
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {/* Explanation Accordion */}
            {question.explanation && (
              <Accordion
                elevation={0}
                disableGutters
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: theme => alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'info.main' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'info.main', fontWeight: 700 }}>
                    <LightbulbIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Explanation
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <MarkdownRenderer text={question.explanation} />
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}

export default QuestionBreakdown;