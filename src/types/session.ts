// Content block types (discriminated union)
export interface TextBlock {
  type: 'text'
  text: string
}

export interface ThinkingBlock {
  type: 'thinking'
  thinking: string
  signature?: string
}

export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
  caller?: { type: string }
}

export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string | ContentBlock[]
  is_error?: boolean
}

export interface ImageBlock {
  type: 'image'
  source: {
    type: 'base64' | 'url'
    media_type?: string
    data?: string
    url?: string
  }
}

export type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock | ImageBlock

// Token usage
export interface TokenUsage {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
  service_tier?: string
}

// Raw record base
export interface BaseRecord {
  type: string
  uuid: string
  timestamp: string
  sessionId: string
  slug?: string
  version?: string
  cwd?: string
  gitBranch?: string
  parentUuid: string | null
  isSidechain?: boolean
  agentId?: string
}

export interface UserRecord extends BaseRecord {
  type: 'user'
  message: {
    role: 'user'
    content: string | ContentBlock[]
  }
  promptId?: string
  permissionMode?: string
  sourceToolAssistantUUID?: string
}

export interface AssistantRecord extends BaseRecord {
  type: 'assistant'
  message: {
    role: 'assistant'
    content: ContentBlock[]
    id?: string
    model?: string
    usage?: TokenUsage
    stop_reason?: string
  }
  requestId?: string
}

export interface QueueOperationRecord extends BaseRecord {
  type: 'queue-operation'
  operation: string
  content?: string
}

export interface ProgressRecord extends BaseRecord {
  type: 'progress'
  data?: {
    type: string
    hookEvent?: string
    hookName?: string
    command?: string
  }
  parentToolUseID?: string
  toolUseID?: string
}

export type RawRecord = UserRecord | AssistantRecord | QueueOperationRecord | ProgressRecord

// Merged message (assistant streaming chunks merged)
export interface MergedMessage {
  id: string
  uuid: string
  timestamp: string
  parentUuid: string | null
  role: 'user' | 'assistant'
  content: ContentBlock[]
  rawContent?: string // for user messages that are plain strings
  model?: string
  usage?: TokenUsage
  stopReason?: string
}

// Conversation tree node
export interface ConversationNode {
  message: MergedMessage
  children: ConversationNode[]
}

// Session stats
export interface SessionStats {
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheTokens: number
  messageCount: number
  toolUseCount: number
  duration: number // ms
  models: string[]
}

// Subagent
export interface SubagentMeta {
  agentId: string
  agentType: string
  description: string
}

export interface SubagentData {
  meta: SubagentMeta
  messages: MergedMessage[]
}

// Session
export interface Session {
  id: string
  slug?: string
  timestamp: string
  messages: MergedMessage[]
  subagents: SubagentData[]
  stats: SessionStats
  cwd?: string
  gitBranch?: string
}

// Project
export interface Project {
  encodedPath: string
  decodedPath: string
  sessions: Session[]
}

// Search
export interface SearchHit {
  messageId: string
  sessionId: string
  snippet: string
  role: 'user' | 'assistant' | 'tool'
  timestamp: string
}

export interface SearchIndex {
  entries: {
    messageId: string
    sessionId: string
    text: string
    role: 'user' | 'assistant' | 'tool'
    timestamp: string
  }[]
}
