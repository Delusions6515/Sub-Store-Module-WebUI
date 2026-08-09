import { watch } from 'vue'
import { setThemeMode, useTheme } from 'miuix-vue'
import { useStorage } from './useStorage'

// 主题模式持久化（模块级单例）：
// - 模块加载时恢复上次选择（早于首屏，避免主题闪烁）
// - 任何 setThemeMode 变更自动写回 localStorage
// miuix 的 useTheme 只在内存持有 mode，刷新即回 system，这里补一层持久化。
const storedMode = useStorage('themeMode', 'system')

setThemeMode(storedMode.value)

const { mode } = useTheme()
watch(mode, (m) => {
  if (m !== storedMode.value) storedMode.value = m
})

export function useStoredTheme() {
  return { mode: storedMode, setThemeMode }
}
