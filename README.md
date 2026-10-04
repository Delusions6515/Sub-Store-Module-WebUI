# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Monet 取色

在“配置 → 外观”开启 **Monet 取色**，默认关闭，选择保存在当前 WebUI 的 localStorage。

- 通过宿主提供的 `https://mui.kernelsu.org/internal/colors.css` 读取 `--primary`，不执行 root 命令或读取壁纸文件；需要宿主支持该接口并提供有效的动态配色。KernelSU 管理器中需先启用 Monet/动态色主题。
- 以宿主颜色为种子，用 Material Color Utilities 生成浅色、深色两套完整配色；“跟随系统 / 浅色 / 深色”仍可独立选择，生成结果不保证与宿主逐色一致。
- 关闭后恢复原配色；普通浏览器、旧宿主或没有可用配色时也保持原配色。关闭状态不加载宿主色板或配色生成库。
- 重新打开 WebUI 时重新取色，因此更换壁纸/宿主配色后可以刷新页面。

取色入口参考 [meta-magic_mount-rs 的 WebUI](https://github.com/Tools-cx-app/meta-magic_mount-rs)，生成明暗配色使用独立实现。

运行 `pnpm test` 检查色板对比度、开关持久化、加载期间关闭及取色不可用时的回退；`pnpm build` 生成模块使用的 `dist/`。
