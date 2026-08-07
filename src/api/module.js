import { exec } from 'kernelsu'
import { mockExec } from './mock'

// 模块内 webui.sh 的固定路径
// 以后如果要从 kernelsu.moduleInfo() 动态取路径，只改这里
export const WEBUI_SCRIPT = '/data/adb/modules/sub_store/scripts/webui.sh'

// 浏览器开发环境没有 ksu 全局对象，走 mock，方便 pnpm dev 在电脑上预览
const isBrowserDev = typeof window !== 'undefined' && !window.ksu

async function runExec(command, options) {
  if (isBrowserDev) {
    return mockExec(command, options)
  }
  return exec(command, options)
}

export async function runModuleCommand(command, options = {}) {
  const result = await runExec(command, options)
  const stdout = result?.stdout ?? ''
  const stderr = result?.stderr ?? ''
  const errno = Number(result?.errno ?? -1)
  return {
    ok: errno === 0,
    errno,
    stdout,
    stderr,
  }
}

export async function getStatus() {
  const result = await runModuleCommand(`sh ${WEBUI_SCRIPT} status`)
  if (!result.ok) {
    throw new Error(result.stderr || result.stdout || '读取状态失败')
  }
  return JSON.parse(result.stdout)
}

export async function startService() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} start`)
}

export async function stopService() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} stop`)
}

export async function restartService() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} restart`)
}

export async function toggleAutostart() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} toggle-autostart`)
}

export async function regenerateBackendPath() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} regenerate-backend-path`)
}

export async function updateAll() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} update-all`)
}

export async function updateSubStore() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} update-sub-store`)
}

export async function updateBackend() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} update-backend`)
}

export async function updateFrontend() {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} update-frontend`)
}

export async function updateHttpMeta(mode = 'all') {
  return runModuleCommand(`sh ${WEBUI_SCRIPT} update-http-meta ${mode}`)
}

export async function openUrl(url) {
  return runModuleCommand(`am start -a android.intent.action.VIEW -d '${url}'`)
}
