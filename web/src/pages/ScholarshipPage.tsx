// src/pages/ScholarshipPage.tsx
/**
 * Scholarship Page
 *
 * Provides access to Maharashtra State Scholarship Examination mock papers
 * for Class 5th (4th Scholarship) and Class 8th (7th Scholarship).
 * Features Paper 1 and Paper 2 with 2-option marking support and score tracking.
 */
import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychometryIcon from "@mui/icons-material/Psychology";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useScholarship } from "../hooks/useScholarship";
import ScholarshipModal from "../components/quiz/scholarship/ScholarshipModal";

const ScholarshipPage: React.FC = () => {
  const {
    paper1ModalOpen,
    paper2ModalOpen,
    selectedClass,
    scholarshipAccentColor,
    isCreatingSession,
    setSelectedClass,
    handleOpenPaper1Modal,
    handleClosePaper1Modal,
    handleOpenPaper2Modal,
    handleClosePaper2Modal,
    handleStartPaperTest,
  } = useScholarship();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
      {/* Breadcrumb Navigation */}
      <Typography
        color="text.secondary"
        sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5, fontSize: 13.5 }}
      >
        <RouterLink to="/subjects" style={{ color: "inherit", textDecoration: "none" }}>
          Subjects
        </RouterLink>
        <span>&rsaquo;</span>
        <Typography component="span" sx={{ color: scholarshipAccentColor, fontWeight: 600, fontSize: "inherit" }}>
          Scholarship
        </Typography>
      </Typography>

      {/* Page Title & Subtitle */}
      <Typography variant="h1" sx={{ fontSize: { xs: "1.9rem", sm: "2.4rem" }, mb: 1 }}>
        Scholarship Examination
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary", maxWidth: "68ch" }}>
        Official pattern mock papers for Maharashtra State High School and Primary Scholarship Exams (Std 5th &amp; 8th / 4th &amp; 7th Scholarship). Test Paper 1 and Paper 2 with automatic 2-option system evaluation.
      </Typography>

      {/* Paper Cards Grid */}
      <Grid container spacing={3} justifyContent="flex-start">
        {/* Paper 1 Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <MenuBookIcon sx={{ fontSize: 48, color: scholarshipAccentColor }} />
                <Chip label="Paper 1" color="primary" sx={{ fontWeight: 700 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Paper 1: First Language &amp; Mathematics
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Contains 25 questions of First Language (Marathi/English - 50 marks) and 50 questions of Mathematics (100 marks).
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                <Chip label="75 Questions" size="small" variant="outlined" />
                <Chip label="150 Marks" size="small" variant="outlined" color="primary" />
                <Chip label="2 Correct System" size="small" color="secondary" />
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleOpenPaper1Modal}
                startIcon={<AssignmentTurnedInIcon />}
                sx={{
                  bgcolor: scholarshipAccentColor,
                  fontWeight: 600,
                  py: 1.2,
                  borderRadius: 2,
                  "&:hover": { bgcolor: scholarshipAccentColor },
                }}
              >
                Solve Paper 1
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Paper 2 Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <PsychometryIcon sx={{ fontSize: 48, color: scholarshipAccentColor }} />
                <Chip label="Paper 2" color="secondary" sx={{ fontWeight: 700 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Paper 2: Third Language &amp; Intelligence Test
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Contains 25 questions of Third Language (English - 50 marks) and 50 questions of Intelligence Test &amp; Logical Reasoning (100 marks).
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                <Chip label="75 Questions" size="small" variant="outlined" />
                <Chip label="150 Marks" size="small" variant="outlined" color="primary" />
                <Chip label="2 Correct System" size="small" color="secondary" />
              </Box>
            </CardContent>

            <CardActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleOpenPaper2Modal}
                startIcon={<AssignmentTurnedInIcon />}
                sx={{
                  bgcolor: scholarshipAccentColor,
                  fontWeight: 600,
                  py: 1.2,
                  borderRadius: 2,
                  "&:hover": { bgcolor: scholarshipAccentColor },
                }}
              >
                Solve Paper 2
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Paper 1 Config Modal */}
      <ScholarshipModal
        open={paper1ModalOpen}
        onClose={handleClosePaper1Modal}
        paperType="paper_1"
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        onStart={handleStartPaperTest}
        isCreatingSession={isCreatingSession}
        accentColor={scholarshipAccentColor}
      />

      {/* Paper 2 Config Modal */}
      <ScholarshipModal
        open={paper2ModalOpen}
        onClose={handleClosePaper2Modal}
        paperType="paper_2"
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        onStart={handleStartPaperTest}
        isCreatingSession={isCreatingSession}
        accentColor={scholarshipAccentColor}
      />
    </Box>
  );
};

export default ScholarshipPage;
