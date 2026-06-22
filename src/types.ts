/**
 * ABA Session Note Generator Types (Selection-Based)
 */

export interface ABAFormSessionData {
  // General Info
  setting: string;
  sessionEmphasis: string[];
  participationLevel: number;

  // Affect & Engagement
  affectEngagement: number;

  // ABA Strategies
  strategies: string[];

  // Prompt Receptiveness
  promptReceptiveness: number;

  // Teaching Targets
  teachingTargets: string[];

  // Problem Behavior
  behaviorSeverity: number;
  behaviorTypes: string[];

  // Additional
  additionalDetails: string;
  sentenceCount: number;
}

export interface GenerateResponse {
  narrative: string;
}
