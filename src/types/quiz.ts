/**
 * TypeScript types for the quiz/assessment system
 * These types mirror the Prisma schema but provide additional type safety
 * for the Json fields used in questions and answers.
 */

// ============================================================
// Enums
// ============================================================

/**
 * Question types supported by the assessment system
 */
export type QuestionType =
  | "SINGLE_CHOICE" // Radio buttons - select one
  | "MULTIPLE_CHOICE" // Checkboxes - select many
  | "YES_NO" // True/false style
  | "TEXT" // Open text input
  | "RANKING" // Drag to rank items
  | "PROFILE_SELECT"; // Special: select one profile description

// ============================================================
// Option Types (for Json fields)
// ============================================================

/**
 * Single option for a question
 * Used in SINGLE_CHOICE, MULTIPLE_CHOICE, YES_NO, PROFILE_SELECT
 */
export interface QuestionOption {
  id: string;
  label: string; // Display text (Italian)
  value: string; // Value stored when selected
  nextQuestionId?: string; // Optional: jump to specific question if selected
  description?: string; // Optional: additional context (used in PROFILE_SELECT)
}

/**
 * Condition for showing/hiding a question
 * Stored in Question.showCondition Json field
 */
export interface ShowCondition {
  questionId: string; // ID of question this depends on
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  value: string | string[] | number | boolean; // Value to compare against (boolean for YES_NO conditions)
}

// ============================================================
// Answer Value Types
// ============================================================

/**
 * Answer value for SINGLE_CHOICE, YES_NO, PROFILE_SELECT
 */
export interface SingleAnswerValue {
  selectedOptionId: string;
  selectedValue: string;
}

/**
 * Answer value for MULTIPLE_CHOICE
 */
export interface MultipleAnswerValue {
  selectedOptionIds: string[];
  selectedValues: string[];
}

/**
 * Answer value for TEXT
 */
export interface TextAnswerValue {
  text: string;
}

/**
 * Answer value for RANKING
 */
export interface RankingAnswerValue {
  rankedOptionIds: string[]; // Ordered from highest to lowest
}

/**
 * Union type for all answer values
 */
export type AnswerValue =
  | SingleAnswerValue
  | MultipleAnswerValue
  | TextAnswerValue
  | RankingAnswerValue;

// ============================================================
// Entity Types (matching Prisma models)
// ============================================================

/**
 * Survey/Quiz definition
 */
export interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question definition
 */
export interface Question {
  id: string;
  surveyId: string;
  order: number;
  type: QuestionType;
  text: string;
  description: string | null;
  options: QuestionOption[] | null;
  isRequired: boolean;
  nextQuestionId: string | null;
  showCondition: ShowCondition | null;
  createdAt: Date;
}

/**
 * User session (anonymous)
 */
export interface Session {
  id: string;
  surveyId: string;
  resumeToken: string;
  startedAt: Date;
  completedAt: Date | null;
  currentIndex: number;
  feedback: string | null;
}

/**
 * Individual answer
 */
export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  value: AnswerValue;
  answeredAt: Date;
}

// ============================================================
// Utility Types (with relations)
// ============================================================

/**
 * Question with typed options (for runtime use)
 */
export interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}

/**
 * Session with all related answers
 */
export interface SessionWithAnswers extends Session {
  answers: Answer[];
}

/**
 * Session with answers and related survey
 */
export interface SessionWithAnswersAndSurvey extends SessionWithAnswers {
  survey: Survey;
}

/**
 * Survey with all questions loaded
 */
export interface SurveyWithQuestions extends Survey {
  questions: Question[];
}

/**
 * Full survey with questions and typed options
 */
export interface FullSurvey extends Survey {
  questions: QuestionWithOptions[];
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Question for client-side rendering (excludes sensitive fields)
 */
export interface ClientQuestion {
  id: string;
  order: number;
  type: QuestionType;
  text: string;
  description: string | null;
  options: QuestionOption[] | null;
  isRequired: boolean;
}

/**
 * Session state for client
 */
export interface ClientSessionState {
  sessionId: string;
  resumeToken: string;
  currentIndex: number;
  totalQuestions: number;
  isComplete: boolean;
}

/**
 * Answer submission payload
 */
export interface AnswerSubmission {
  sessionId: string;
  questionId: string;
  value: AnswerValue;
}

/**
 * Feedback response from AI
 */
export interface FeedbackResponse {
  sessionId: string;
  feedback: string;
  generatedAt: Date;
}
