// api/_utils/dataTransformer.js
/**
 * Data Transformation Utility
 * 
 * Transforms data from the existing JSON format to match Supabase schema.
 * Provides static methods to convert data structures between different formats
 * during database migrations or data imports.
 */

class DataTransformer {
    /**
     * Transform Subjects Data
     * 
     * Transforms subjects data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default values.
     * 
     * @param {Array} subjects - Array of subject objects in JSON format
     * @returns {Array} Array of transformed subject objects for Supabase
     */
    static transformSubjects(subjects) {
        return subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            description: subject.description,
            icon_name: subject.iconName,
            display_order: subject.displayOrder,
            subject_key: subject.subjectKey,
            accent_color_dark: subject.accentColorDark,
            accent_color_light: subject.accentColorLight,
            is_active: true
        }));
    }
    
    /**
     * Transform Topics Data
     * 
     * Transforms topics data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default values.
     * 
     * @param {Array} topics - Array of topic objects in JSON format
     * @returns {Array} Array of transformed topic objects for Supabase
     */
    static transformTopics(topics) {
        return topics.map(topic => ({
            id: topic.id,
            name: topic.name,
            description: topic.description,
            class: topic.class,
            genre: topic.genre,
            subject: topic.subject,
            is_active: true
        }));
    }
    
    /**
     * Transform Questions Data
     * 
     * Transforms questions data from JSON format to Supabase schema format.
     * Maps difficulty levels from 11-20 range to 1-5 scale and converts
     * property names to snake_case.
     * 
     * @param {Array} questions - Array of question objects in JSON format
     * @returns {Array} Array of transformed question objects for Supabase
     */
    static transformQuestions(questions) {
        return questions.map(question => ({
            id: question.id,
            topic_id: question.topicId,
            text: question.text,
            options: question.options,
            correct_option_id: question.correctOptionId,
            explanation: question.explanation,
            // Map difficulty from 11-20 range to 1-5 scale
            difficulty_level: question.difficulty ? Math.min(Math.max(1, Math.floor(question.difficulty / 3)), 5) : 1,
            points: question.points || 1,
            is_active: true
        }));
    }
    
    /**
     * Transform Subjective Questions Data
     * 
     * Transforms subjective questions data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default values.
     * 
     * @param {Array} subjectiveQuestions - Array of subjective question objects in JSON format
     * @returns {Array} Array of transformed subjective question objects for Supabase
     */
    static transformSubjectiveQuestions(subjectiveQuestions) {
        return subjectiveQuestions.map(question => ({
            id: question.id,
            topic_id: question.topicId,
            text: question.text,
            question_type: question.questionType || 'subjective',
            expected_answer: question.expectedAnswer,
            keywords: question.keywords,
            max_points: question.maxPoints || 10,
            difficulty: question.difficulty || 1,
            is_active: true
        }));
    }
    
    /**
     * Transform Quiz Results Data
     * 
     * Transforms quiz results data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default timestamps.
     * 
     * @param {Array} quizResults - Array of quiz result objects in JSON format
     * @returns {Array} Array of transformed quiz result objects for Supabase
     */
    static transformQuizResults(quizResults) {
        return quizResults.map(result => ({
            id: result.id,
            session_id: result.sessionId,
            question_id: result.questionId,
            user_answer: result.userAnswer,
            is_correct: result.isCorrect,
            points_earned: result.pointsEarned || 0,
            time_spent: result.timeSpent || 0,
            answered_at: result.answeredAt || new Date().toISOString()
        }));
    }
    
    /**
     * Transform Quiz Sessions Data
     * 
     * Transforms quiz sessions data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default values.
     * 
     * @param {Array} quizSessions - Array of quiz session objects in JSON format
     * @returns {Array} Array of transformed quiz session objects for Supabase
     */
    static transformQuizSessions(quizSessions) {
        return quizSessions.map(session => ({
            id: session.id,
            user_id: session.userId,
            topic_id: session.topicId,
            session_type: session.sessionType || 'practice',
            total_questions: session.totalQuestions,
            questions_answered: session.questionsAnswered || 0,
            correct_answers: session.correctAnswers || 0,
            total_score: session.totalScore || 0,
            max_possible_score: session.maxPossibleScore,
            time_spent: session.timeSpent || 0,
            status: session.status || 'completed',
            started_at: session.startedAt || new Date().toISOString(),
            completed_at: session.completedAt || new Date().toISOString()
        }));
    }
    
    /**
     * Transform Subjective Results Data
     * 
     * Transforms subjective results data from JSON format to Supabase schema format.
     * Maps camelCase properties to snake_case and adds default values.
     * 
     * @param {Array} subjectiveResults - Array of subjective result objects in JSON format
     * @returns {Array} Array of transformed subjective result objects for Supabase
     */
    static transformSubjectiveResults(subjectiveResults) {
        return subjectiveResults.map(result => ({
            id: result.id,
            session_id: result.sessionId,
            question_id: result.questionId,
            user_answer: result.userAnswer,
            ai_feedback: result.aiFeedback,
            ai_score: result.aiScore,
            manual_score: result.manualScore,
            final_score: result.finalScore,
            is_graded: result.isGraded || false,
            graded_at: result.gradedAt,
            answered_at: result.answeredAt || new Date().toISOString()
        }));
    }
}

module.exports = DataTransformer;
