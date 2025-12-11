export enum AgentType {
  ROUTER = 'ROUTER',
  REGISTRATION = 'REGISTRATION',
  EMR = 'EMR',
  BILLING = 'BILLING',
  APPOINTMENT = 'APPOINTMENT',
  SYSTEM = 'SYSTEM' // For internal UI messages
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  agent?: AgentType; // Which agent generated this message
  timestamp: Date;
  metadata?: any; // For router debugging or extra info
}

export interface RouterOutput {
  route: AgentType;
  reasoning: string;
  parameters: Record<string, any>;
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  color: string;
  icon: string;
  systemInstruction: string;
}