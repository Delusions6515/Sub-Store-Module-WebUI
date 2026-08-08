// 开发环境 mock：浏览器里没有 ksu 全局对象，这里模拟 kernelsu.exec
// 数据与真实 webui.sh status 输出对齐，方便在电脑上调试 UI

// 模拟 module.prop 的 version，供顶栏副标题预览
const MOCK_MODULE_VERSION = '2.0.1 (Browser Dev)'

export { MOCK_MODULE_VERSION }

const MOCK_STATUS = {
  serviceRunning: true,
  autostart: true,
  configModified: false,
  mergeMode: true,
  directUrl: 'http://127.0.0.1:3001?api=http://127.0.0.1:3001/AbCdEfGhIjKlMnOpQrStUv',
  frontUrl: 'http://127.0.0.1:3002',
  backUrl: 'http://127.0.0.1:3001?api=http://127.0.0.1:3001/AbCdEfGhIjKlMnOpQrStUv',
  openUrl: 'http://127.0.0.1:3001?api=http://127.0.0.1:3001/AbCdEfGhIjKlMnOpQrStUv',
  backendPathIsDefault: true,
}

const MOCK_OUTPUT = {
  restart: 'restarting sub_store_node service.\nstarting sub_store_node service.',
  'update-all': '[Info] 后端已是最新版本\n[Info] 前端已是最新版本\n[Info] http-meta 处理完成',
  'toggle-autostart': '已禁用开机自启',
  default: 'mock output',
}

export function mockExec(command, options = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (command.includes('status')) {
        resolve({ errno: 0, stdout: JSON.stringify(MOCK_STATUS), stderr: '' })
        return
      }
      const key = Object.keys(MOCK_OUTPUT).find((k) => command.includes(k))
      resolve({ errno: 0, stdout: MOCK_OUTPUT[key] || MOCK_OUTPUT.default, stderr: '' })
    }, 300)
  })
}
