// src/hooks/useScholarship.ts
/**
 * Scholarship Exam Hook
 *
 * Manages Maharashtra State Scholarship Examination (4th & 7th Scholarship Exams / Class 5th & 8th)
 * quiz session creation, modal states, paper selection (Paper 1 & Paper 2),
 * and navigation to active quiz session.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import apiClient from "../api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { useNotifications } from "../contexts/NotificationsContext";

export interface ScholarshipQuizParams {
  quizType: string;
  paperType: "paper_1" | "paper_2";
  classLevel: string;
  topicId: string;
  topicName: string;
  accentColor: string;
  subject: string;
  timeLimit?: number;
  numQuestions?: number;
}

export interface UseScholarshipReturn {
  paper1ModalOpen: boolean;
  paper2ModalOpen: boolean;
  selectedClass: string;
  scholarshipAccentColor: string;
  isCreatingSession: boolean;
  setSelectedClass: (classLevel: string) => void;
  handleOpenPaper1Modal: () => void;
  handleClosePaper1Modal: () => void;
  handleOpenPaper2Modal: () => void;
  handleClosePaper2Modal: () => void;
  handleStartPaperTest: (paperType: "paper_1" | "paper_2", classLevel?: string) => void;
}

export const useScholarship = (): UseScholarshipReturn => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addNotification } = useNotifications();

  const [paper1ModalOpen, setPaper1ModalOpen] = useState<boolean>(false);
  const [paper2ModalOpen, setPaper2ModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>("Class 5th");

  const scholarshipAccentColor = theme.palette.primary.main;

  const createSessionMutation = useMutation({
    mutationFn: (quizParams: ScholarshipQuizParams) =>
      apiClient.post("/api/quizSessions", { quizParams }),
    onSuccess: (response: any) => {
      const { sessionId } = response.data;
      localStorage.setItem("activeQuizSessionId", sessionId);
      navigate("/quiz/loading");
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || "Could not start the scholarship exam. Please try again.";
      addNotification(message, "error");
    },
  });

  const handleStartPaperTest = (paperType: "paper_1" | "paper_2", classLevelArg?: string) => {
    const classLevel = classLevelArg || selectedClass;
    const paperName =
      paperType === "paper_1"
        ? "Paper 1 (First Language & Mathematics)"
        : "Paper 2 (Third Language & Intelligence Test)";

    const quizParams: ScholarshipQuizParams = {
      quizType: "scholarship-mock",
      paperType,
      classLevel,
      topicId: `scholarship-${classLevel.toLowerCase().replace(/\s+/g, "")}-${paperType}`,
      topicName: `Scholarship Exam - ${paperName} (${classLevel})`,
      accentColor: scholarshipAccentColor,
      subject: "scholarship",
      timeLimit: 90 * 60, // 90 minutes (1.5 hours)
      numQuestions: 75,
    };

    createSessionMutation.mutate(quizParams);
    setPaper1ModalOpen(false);
    setPaper2ModalOpen(false);
  };

  return {
    paper1ModalOpen,
    paper2ModalOpen,
    selectedClass,
    scholarshipAccentColor,
    isCreatingSession: createSessionMutation.isPending,
    setSelectedClass,
    handleOpenPaper1Modal: () => setPaper1ModalOpen(true),
    handleClosePaper1Modal: () => setPaper1ModalOpen(false),
    handleOpenPaper2Modal: () => setPaper2ModalOpen(true),
    handleClosePaper2Modal: () => setPaper2ModalOpen(false),
    handleStartPaperTest,
  };
};
