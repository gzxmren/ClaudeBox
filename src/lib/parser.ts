import type {
  RawRecord,
  AssistantRecord,
  UserRecord,
  MergedMessage,
  ContentBlock,
  SessionStats,
  Session,
  SubagentData,
  SubagentMeta,
} from '../types/session'

export function parseJsonlLines(text: string): RawRecord[] {
  const lines = text.split('\n').filter(l => l.trim())
  const records: RawRecord[] = []
  for (const line of lines) {
    try {
      records.push(JSON.parse(line) as RawRecord)
    } catch {
      // skip malformed lines
    }
  }
  return records
}

function extractUserContent(record: UserRecord): { content: ContentBlock[]; rawContent?: string } {
  const msg = record.message
  if (typeof msg.content === 'string') {
    return {
      content: [{ type: 'text', text: msg.content }],
      rawContent: msg.content,
    }
  }
  return { content: msg.content }
}

export function mergeRecords(records: RawRecord[]): MergedMessage[] {
  const messages: MergedMessage[] = []
  const assistantGroups = new Map<string, AssistantRecord[]>()
  const assistantOrder: string[] = []

  for (const rec of records) {
    if (rec.type === 'user') {
      const user = rec as UserRecord
      const { content, rawContent } = extractUserContent(user)
      messages.push({
        id: user.uuid,
        uuid: user.uuid,
        timestamp: user.timestamp,
        parentUuid: user.parentUuid,
        role: 'user',
        content,
        rawContent,
      })
    } else if (rec.type === 'assistant') {
      const asst = rec as AssistantRecord
      const msgId = asst.message.id || asst.uuid
      if (!assistantGroups.has(msgId)) {
        assistantGroups.set(msgId, [])
        assistantOrder.push(msgId)
      }
      assistantGroups.get(msgId)!.push(asst)
    }
  }

  // Merge assistant groups
  for (const msgId of assistantOrder) {
    const group = assistantGroups.get(msgId)!
    const first = group[0]
    const allContent: ContentBlock[] = []
    let lastUsage = first.message.usage
    let model = first.message.model
    let stopReason = first.message.stop_reason

    for (const rec of group) {
      if (rec.message.content) {
        for (const block of rec.message.content) {
          // Deduplicate: skip if identical block already exists
          const isDup = allContent.some(
            existing => existing.type === block.type && JSON.stringify(existing) === JSON.stringify(block)
          )
          if (!isDup) {
            allContent.push(block)
          }
        }
      }
      if (rec.message.usage) lastUsage = rec.message.usage
      if (rec.message.model) model = rec.message.model
      if (rec.message.stop_reason) stopReason = rec.message.stop_reason
    }

    messages.push({
      id: msgId,
      uuid: first.uuid,
      timestamp: first.timestamp,
      parentUuid: first.parentUuid,
      role: 'assistant',
      content: allContent,
      model,
      usage: lastUsage,
      stopReason,
    })
  }

  // Sort by timestamp
  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  return messages
}

export function computeStats(records: RawRecord[]): SessionStats {
  let totalInput = 0
  let totalOutput = 0
  let totalCache = 0
  let toolUseCount = 0
  const models = new Set<string>()
  let earliest = Infinity
  let latest = -Infinity

  for (const rec of records) {
    const ts = new Date(rec.timestamp).getTime()
    if (ts < earliest) earliest = ts
    if (ts > latest) latest = ts

    if (rec.type === 'assistant') {
      const asst = rec as AssistantRecord
      if (asst.message.usage) {
        totalInput += asst.message.usage.input_tokens || 0
        totalOutput += asst.message.usage.output_tokens || 0
        totalCache += (asst.message.usage.cache_read_input_tokens || 0) +
          (asst.message.usage.cache_creation_input_tokens || 0)
      }
      if (asst.message.model) models.add(asst.message.model)
      if (asst.message.content) {
        for (const block of asst.message.content) {
          if (block.type === 'tool_use') toolUseCount++
        }
      }
    }
  }

  return {
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCacheTokens: totalCache,
    messageCount: records.filter(r => r.type === 'user' || r.type === 'assistant').length,
    toolUseCount,
    duration: latest - earliest,
    models: Array.from(models),
  }
}

export function parseSession(
  id: string,
  mainJsonl: string,
  subagentFiles?: { meta: SubagentMeta; jsonl: string }[]
): Session {
  const records = parseJsonlLines(mainJsonl)
  const messages = mergeRecords(records)
  const stats = computeStats(records)

  const first = records[0]
  const subagents: SubagentData[] = []

  if (subagentFiles) {
    for (const sa of subagentFiles) {
      const saRecords = parseJsonlLines(sa.jsonl)
      const saMessages = mergeRecords(saRecords)
      subagents.push({ meta: sa.meta, messages: saMessages })
    }
  }

  return {
    id,
    slug: first?.slug,
    timestamp: first?.timestamp || new Date().toISOString(),
    messages,
    subagents,
    stats,
    cwd: first?.cwd,
    gitBranch: first?.gitBranch,
  }
}
