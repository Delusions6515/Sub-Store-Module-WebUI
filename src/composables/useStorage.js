import { ref, watch } from 'vue'

// 通用本地持久化：读 localStorage（JSON 反序列化），ref 变化自动写回。
// 新增一个持久化设置只需一行：
//   const x = useStorage('键名', 默认值)   // 读写都用 x.value
// 值可以是任意 JSON 可序列化类型（对象/数组需对象变化时也能感知，已开 deep watch）。
export function useStorage(key, defaultValue) {
  const value = ref(read())

  function read() {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? defaultValue : JSON.parse(raw)
    } catch {
      return defaultValue
    }
  }

  watch(
    value,
    (v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v))
      } catch {
        /* 存储不可用（隐私模式/禁用等）时静默忽略 */
      }
    },
    { deep: true },
  )

  return value
}
