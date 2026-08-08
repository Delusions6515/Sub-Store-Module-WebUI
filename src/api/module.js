import { exec, moduleInfo } from 'kernelsu'
import { mockExec, MOCK_MODULE_VERSION } from './mock'

// 浏览器开发环境没有 ksu 全局对象，使用 mock 实现（pnpm dev 本地预览）
const isBrowserDev = typeof window !== 'undefined' && !window.ksu

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

// 读取 run 目录下操作日志尾部（run.log + run_error.log）
export async function getLog() {
  const result = await runModuleCommand(`sh ${WEBUI_SCRIPT} log`)
  return result.ok ? result.stdout : result.stderr || result.stdout
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
