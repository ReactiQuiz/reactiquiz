// src/components/quiz/scholarship/ScholarshipModal.tsx
/**
 * Scholarship Modal Component
 *
 * Allows users to select grade level (Class 5th / 4th Scholarship Level,
 * Class 8th / 7th Scholarship Level) and start the selected Scholarship Examination Paper.
 */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Divider,
  Chip
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface ScholarshipModalProps {
  open: boolean;
  onClose: () => void;
  paperType: "paper_1" | "paper_2";
  selectedClass: string;
  setSelectedClass: (classLevel: string) => void;
  onStart: (paperType: "paper_1" | "paper_2", classLevel: string) => void;
  isCreatingSession: boolean;
  accentColor: string;
}

const ScholarshipModal: React.FC<ScholarshipModalProps> = ({
  open,
  onClose,
  paperType,
  selectedClass,
  setSelectedClass,
  onStart,
  isCreatingSession,
  accentColor,
}) => {
  const isPaper1 = paperType === "paper_1";
  const title = isPaper1 ? "Scholarship Paper 1" : "Scholarship Paper 2";
  const subjects = isPaper1
    ? "First Language (Marathi / English) + Mathematics"
    : "Third Language + Intelligence Test (Mental Ability)";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <QuizIcon sx={{ color: accentColor }} />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterPath>
            Examinee Standard / Grade Selection:
          </Typography>
          <FormControl component="fieldset" sx={{ mt: 1, width: "100%" }}>
            <RadioGroup
              row
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <FormControlLabel
                value="Class 5th"
                control={<Radio sx={{ color: accentColor, "&.Mui-checked": { color: accentColor } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Class 5th (Primary / 4th Grade Scholarship)
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                value="Class 8th"
                control={<Radio sx={{ color: accentColor, "&.Mui-checked": { color: accentColor } }} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Class 8th (Higher Primary / 7th Grade Scholarship)
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MenuBookIcon fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Subjects:</strong> {subjects}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QuizIcon fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Questions:</strong> 75 Questions (150 Marks Total)
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimerIcon fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Duration:</strong> 90 Minutes (1 Hour 30 Mins)
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleOutlineIcon fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Special Marking:</strong> ~20% of questions require 2 correct options (2 marks each).
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label="75 Questions" size="small" variant="outlined" />
          <Chip label="150 Marks" size="small" variant="outlined" color="primary" />
          <Chip label="2 Correct System Applied" size="small" color="secondary" />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isCreatingSession} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onStart(paperType, selectedClass)}
          disabled={isCreatingSession}
          sx={{ bgcolor: accentColor, "&:hover": { bgcolor: accentColor } }}
        >
          {isCreatingSession ? "Preparing Paper..." : "Start Examination"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScholarshipModal;
