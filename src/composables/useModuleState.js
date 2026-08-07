import { ref } from 'vue'
import { showSnackbar } from 'miuix-vue'
import * as moduleApi from '../api/module'

// 单例状态：所有页面共享同一份 status / busy / error
const status = ref(null)
const loading = ref(false)
const busy = ref(false)
const error = ref('')
const lastOutput = ref('')
const refreshedAt = ref('')

async function refreshStatus(showToast = false) {
  loading.value = true
  error.value = ''
  try {
    status.value = await moduleApi.getStatus()
    refreshedAt.value = new Date().toLocaleTimeString()
    if (showToast) showSnackbar({ message: '状态已刷新', withDismissAction: true })
  } catch (err) {
    console.error(err)
    error.value = err?.message || '状态读取失败'
    if (showToast) showSnackbar({ message: error.value, withDismissAction: true })
  } finally {
    loading.value = false
  }
}

async function runAction(name, fn) {
  busy.value = true
  error.value = ''
  try {
    const result = await fn()
    lastOutput.value = result.stdout
    if (!result.ok) {
      error.value = result.stderr || result.stdout || '命令执行失败'
      showSnackbar({ message: error.value, withDismissAction: true })
      return false
    }
    showSnackbar({ message: '操作完成', withDismissAction: true })
    await refreshStatus(false)
    return true
  } catch (err) {
    console.error(err)
    error.value = err?.message || '操作失败'
    showSnackbar({ message: error.value, withDismissAction: true })
    return false
  } finally {
    busy.value = false
  }
}

export function useModuleState() {
  return {
    status,
    loading,
    busy,
    error,
    lastOutput,
    refreshedAt,
    refreshStatus,
    runAction,
  }
}
