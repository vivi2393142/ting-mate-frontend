export enum AssistantStatus {
  CONFIRMED = 'CONFIRMED',
  INCOMPLETE = 'INCOMPLETE',
  FAILED = 'FAILED',
}

export interface AssistantVoiceCommandInput {
  audioUri: string;
  conversationId?: string;
  encoding?: string;
}

export interface AssistantVoiceCommandOutput {
  conversationId: string;
  status: AssistantStatus;
  userInput: string;
  furtherQuestion?: string;
}

export enum TalkRole {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  LOADING = 'LOADING',
}
