import { ref } from 'vue'
import * as moduleApi from '../api/module'

// 操作日志状态与执行：后台执行命令（nohup & 立即返回），轮询 run.log 停止增长判定完成，
// 再读取日志内容。日志展示（标题/卡片/行着色）见 components/OperationLogPanel.vue。
export function useOperationLog() {
  const content = ref('')
  const visible = ref(false)
  const pending = ref(false)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  // 轮询 update.log 字节数，连续 stableTimes 次无增长视为完成；
  // onPoll 在每次轮询时调用（伪实时刷新日志内容用）
  async function pollUntilIdle(timeoutMs, onPoll, intervalMs = 1000, stableTimes = 4) {
    const deadline = Date.now() + timeoutMs
    let stable = 0
    let lastSize = -1
    while (Date.now() < deadline) {
      const size = await moduleApi.getUpdateLogSize().catch(() => lastSize)
      if (size === lastSize) {
        stable += 1
        if (stable >= stableTimes) return true
      } else {
        stable = 0
      }
      lastSize = size
      if (onPoll) await onPoll()
      await sleep(intervalMs)
    }
    return false
  }

  // 执行更新命令并展示其日志：内部先归档旧日志，新 update.log 只含本次输出；
  // 执行期间轮询伪实时刷新日志内容，结束后再读一次完整日志
  async function runWithLog(name, { timeoutMs = 600000 } = {}) {
    visible.value = true
    content.value = '正在执行，等待输出…'
    pending.value = true
    try {
      const result = await moduleApi.runBackground(name)
      if (!result.ok) {
        content.value = result.stderr || '指令发送失败'
        return false
      }
      if (!moduleApi.isBrowserDev) {
        // 伪实时：执行期间每次轮询都刷新日志内容（空日志保持占位符，避免面板闪空）
        await pollUntilIdle(timeoutMs, async () => {
          const log = await moduleApi.getUpdateLog().catch(() => '')
          if (log) content.value = log
        })
      }
      content.value = await moduleApi.getUpdateLog().catch(() => content.value)
      return true
    } catch (err) {
      content.value = err?.message || '操作失败'
      return false
    } finally {
      pending.value = false
    }
  }

  return { content, visible, pending, runWithLog }
}
