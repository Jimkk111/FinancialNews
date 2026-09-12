/**
 * 从 SSE 文本流中提取 data 事件。
 *
 * SSE 以换行分帧；切片边界可能落在行中间，非 final 模式下
 * 最后一行视为不完整，通过 rest 返回并与下个 chunk 拼接。
 */
export function extractSseEvents(
  text: string,
  final = false,
): { events: string[]; rest: string } {
  const lines = text.split('\n')
  const rest = final ? '' : (lines.pop() ?? '')

  const events: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data:')) {
      events.push(trimmed.slice(5).trim())
    }
  }
  return { events, rest }
}
