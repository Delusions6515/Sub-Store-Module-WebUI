import { exec, moduleInfo } from 'kernelsu'
import { mockExec, MOCK_MODULE_VERSION } from './mock'

// 浏览器开发环境没有 ksu 全局对象，使用 mock 实现（pnpm dev 本地预览）
export const isBrowserDev = typeof window !== 'undefined' && !window.ksu

// moduleInfo() 返回 module.prop 全字段 + moduleDir，模块加载时取一次
const moduleInfoData = isBrowserDev
  ? { version: MOCK_MODULE_VERSION }
  : (() => {
      try {
        return JSON.parse(moduleInfo())
      } catch {
        return null
      }
    })()

// 模块内 webui.sh 的路径：优先从 KernelSU 动态取，取不到再 fallback
export const MODULE_PATH = moduleInfoData?.moduleDir || '/data/adb/modules/sub_store'
export const WEBUI_SCRIPT = `${MODULE_PATH}/scripts/webui.sh`

// 模块版本（module.prop 的 version 字段），供顶栏副标题等展示
export const MODULE_VERSION = moduleInfoData?.version || ''

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

// 读取操作日志（run.log + run_error.log；配合 runServiceAction 的 log-reset，内容即本次操作输出）
export async function getLog() {
  const result = await runModuleCommand(`sh ${WEBUI_SCRIPT} log`)
  return result.ok ? result.stdout : result.stderr || result.stdout
}

// 服务控制：先归档操作日志（run.log → .bak），再 nohup 后台执行并立即返回
// 归档后新 run.log 只含本次操作输出，直接读取即可，不受历史日志/轮转影响
export async function runServiceAction(name) {
  await runModuleCommand(`sh ${WEBUI_SCRIPT} log-reset`)
  return runModuleCommand(`nohup sh ${WEBUI_SCRIPT} ${name} >/dev/null 2>&1 &`)
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
