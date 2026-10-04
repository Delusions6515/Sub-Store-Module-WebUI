import { watch } from 'vue'
import { useStorage } from './useStorage.js'

const monetEnabled = useStorage('monetEnabled', false)
// 开关和初始化取色使用同一个严格布尔值；无效存储按默认关闭处理。
monetEnabled.value = monetEnabled.value === true
let palettesPromise
let paletteStyle

function loadPalettes() {
  if (!palettesPromise) {
    // 此地址由支持 Monet 的 WebUI 宿主拦截，不需要 root 命令。
    // 默认关闭时既不加载宿主色板，也不下载配色生成库。
    palettesPromise = new Promise((resolve) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://mui.kernelsu.org/internal/colors.css'
      link.onload = () => resolve(getComputedStyle(document.documentElement).getPropertyValue('--primary'))
      link.onerror = () => resolve('')
      document.head.append(link)
    }).then(async (seed) => {
      if (!seed.trim()) return null
      const { createMonetPalettes } = await import('../theme/monet.js')
      return createMonetPalettes(seed)
    }).catch(() => null)
  }
  return palettesPromise
}

function rule(selector, colors) {
  const declarations = Object.entries(colors).map(([token, color]) => `${token}:${color}`).join(';')
  return `${selector}{${declarations}}`
}

watch(monetEnabled, async (enabled, _previous, onCleanup) => {
  const root = document.documentElement
  root.classList.remove('m-theme-monet')
  if (enabled !== true) return

  let cancelled = false
  onCleanup(() => { cancelled = true })
  const palettes = await loadPalettes()
  // 加载期间关掉开关，不得在请求完成后重新应用 Monet。
  if (cancelled || !palettes) return

  if (!paletteStyle) {
    paletteStyle = document.createElement('style')
    paletteStyle.textContent = rule(':root.m-theme-monet', palettes.light)
      + rule(':root.m-theme-monet.m-theme-dark', palettes.dark)
    document.head.append(paletteStyle)
  }
  root.classList.add('m-theme-monet')
}, { immediate: true })

export function useMonetTheme() {
  return { monetEnabled }
}
