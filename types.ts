
export enum AppState {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  RESEARCHING = 'RESEARCHING',
  ARCHITECTING = 'ARCHITECTING',
  GENERATING = 'GENERATING',
  PATCHING = 'PATCHING',
  INJECTING = 'INJECTING',
  VALIDATING = 'VALIDATING',
  REPAIRING = 'REPAIRING',
  BUILDING = 'BUILDING',
  DIAGNOSING = 'DIAGNOSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}

export type AIProvider = 'gemini' | 'puter';

export type AIModel = 
  | 'gemini-3-pro-preview'
  | 'gemini-3-flash-preview'
  | 'gpt-4o' 
  | 'gpt-3.5-turbo'
  | 'grok-2'
  | 'claude-3.5-sonnet';

export type ProjectType = 'MOD' | 'RESOURCEPACK' | 'DATAPACK' | 'PLUGIN' | 'CLIENT' | 'MIGRATION';

export interface GeneratedFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  fixed: boolean;
}

export interface ProjectValidation {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface CompatibilityReport {
  compatibilityScore: number;
  securityRating: number;
  offlineReadiness: number;
}

export interface KnowledgeSnippet {
  id: string;
  category: 'LORE' | 'ART_STYLE' | 'CODE_PATTERN' | 'MECHANIC';
  title: string;
  content: string;
  isActive: boolean;
}

export interface ModPlan {
  name: string;
  modId: string;
  description: string;
  version: string;
  loader: string;
  features: string[];
  rulesApplied: string[];
  technicalSummary: string;
  fileStructure: string[];
  usageInstructions: string[];
  troubleshooting: string[];
  files: GeneratedFile[];
  validation?: ProjectValidation;
  modelUsed?: string;
  providerUsed?: AIProvider;
  isPatched?: boolean;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'fix';
}

export interface DownloadOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  extension: string;
  color: string;
}

export type CreationRule = 
  | 'OFFLINE_READY' 
  | 'STRICT_TYPES' 
  | 'MODULAR_ARCH' 
  | 'OPTIMIZED_PERF' 
  | 'ANTI_PIRACY_STUB'
  | 'MAPPINGS_V2'
  | 'LEGACY_SUPPORT';