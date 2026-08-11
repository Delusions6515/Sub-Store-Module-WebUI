<script setup>
// Sub-Store 模块 WebUI 应用骨架：
// 固定顶栏 + NavigationBar + ScrollArea + SnackbarHost + 主题切换。
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  MiuixIcon,
  MiuixNavigationBar,
  MiuixScrollArea,
  MiuixSnackbarHost,
  MiuixTopAppBar,
} from 'miuix-vue'
import { GridView, Update, Settings, Info } from 'miuix-vue/icons'
import OverviewPage from './pages/OverviewPage.vue'
import UpdatesPage from './pages/UpdatesPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import AboutPage from './pages/AboutPage.vue'
import { MODULE_VERSION, requestFullScreen } from './api/module'
import { useStoredTheme } from './composables/useStoredTheme'

// 顶栏副标题：模块版本号（module.prop 的 version）
const subtitle = MODULE_VERSION ? `v${MODULE_VERSION}` : ''

// 主题持久化：恢复上次选择并持续写回（useStoredTheme 是模块级单例，此处调用保证初始化）
useStoredTheme()

const pages = [OverviewPage, UpdatesPage, SettingsPage, AboutPage]
const titles = ['概览', '更新', '配置', '关于']
const navItems = titles.map((label) => ({ label }))
// 各 tab 图标：与 miuix example 的 AppContent.kt navigationItems 对应。
const navIcons = [GridView, Update, Settings, Info]

const navIndex = ref(0)
const activePage = computed(() => pages[navIndex.value])
const activeTitle = computed(() => titles[navIndex.value])

// 每个 tab 保留滚动位置：切换前保存出去的 tab 的 scrollTop，进入时恢复。
const scrollerRef = ref(null)
const scrollPositions = new Map()

watch(
  navIndex,
  (_next, prev) => {
    scrollPositions.set(prev, scrollerRef.value?.getScrollTop?.() ?? 0)
  },
  { flush: 'pre' },
)

function onPageEnter() {
  scrollerRef.value?.setScrollTop?.(scrollPositions.get(navIndex.value) ?? 0)
}

// SnackbarHost 会浮到 body 顶层并悬在底部导航上方（对应 miuix Scaffold）。
// 把导航栏实测高度同步为 --m-snackbar-inset-bottom，让 host 让开导航栏。
const bottomBarRef = ref(null)
let barObserver = null

function syncSnackbarInset() {
  const h = bottomBarRef.value?.offsetHeight ?? 0
  document.documentElement.style.setProperty('--m-snackbar-inset-bottom', `${h}px`)
}

onMounted(() => {
  // KSU/APatch 全屏：进 WebUI 即请求全屏并接收系统栏 inset（浏览器 dev 下为空操作）
  requestFullScreen()

  if (bottomBarRef.value) {
    barObserver = new ResizeObserver(syncSnackbarInset)
    barObserver.observe(bottomBarRef.value)
  }
  syncSnackbarInset()
})

onBeforeUnmount(() => {
  barObserver?.disconnect()
  document.documentElement.style.removeProperty('--m-snackbar-inset-bottom')
})
</script>

<template>
  <div class="app">
    <!-- 固定顶栏：不随内容滚动，主标题固定应用名，当前 tab 名放副标题。
         主题切换在配置页，顶栏不保留切换按钮。 -->
    <MiuixTopAppBar class="app__topbar" title="Sub-Store for Android" :subtitle="subtitle" />

    <!-- 内容区：4 个 tab 页面（概览/更新/配置/关于），内部滚动。 -->
    <MiuixScrollArea ref="scrollerRef" class="app__body">
      <Transition name="page" mode="out-in" @enter="onPageEnter">
        <KeepAlive>
          <component :is="activePage" :key="navIndex" />
        </KeepAlive>
      </Transition>
    </MiuixScrollArea>

    <div ref="bottomBarRef" class="app__bottom">
      <MiuixNavigationBar v-model="navIndex" :items="navItems">
        <template #icon="{ index }">
          <MiuixIcon :icon="navIcons[index]" :size="26" />
        </template>
      </MiuixNavigationBar>
    </div>
  </div>

  <MiuixSnackbarHost />
</template>

<style lang="scss">
// KSU/APatch 全屏：加载官方 insets.css，提供 --window-inset-* 等安全区变量
// （KSU 管理器会自动替换为实际系统栏像素，浏览器 dev 下回退 0）。
@import url("https://mui.kernelsu.org/internal/insets.css");

// 全局基础样式（原 src/styles/theme.css 收进这里），字体栈沿用 example 的 MiSans 那套。
// 语义色调：库 token 只覆盖 主色(蓝)/错误(红)，绿/橙没有现成语义 token，
// 用 miuix 色板近似值（example 下拉示例的 #36D167 绿 / #FFB21D 黄）定义成
// 全局变量，状态卡片与操作日志共用，便于日后统一换 token。
:root {
  color-scheme: light dark;
  --tone-success: #36d167;
  --tone-warning: #ffb21d;

  // 布局安全区：顶栏垫状态栏、底栏垫手势条（值来自上方 insets.css）
  --top-inset: var(--window-inset-top, 0px);
  --bottom-inset: var(--window-inset-bottom, 0px);
}

html,
body {
  margin: 0;
  height: 100%;
}

* {
  box-sizing: border-box;
}

body {
  font-family:
    'MiSans-VF',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
  background: var(--m-color-background);
  color: var(--m-color-on-background);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 0;
  background: var(--m-color-surface);

  // KSU/APatch 全屏：顶部分别垫状态栏高度，表面背景仍延伸盖住系统栏区域。
  padding-top: var(--top-inset, 0px);

  // 顶栏留白：不贴屏幕边缘，行高 52px 基础上再给四周呼吸空间。
  &__topbar {
    padding: 8px 20px;
  }

  &__bottom {
    flex: none;
    z-index: 10;
    // 底部垫手势条高度，导航栏内容避开系统手势区。
    padding-bottom: var(--bottom-inset, 0px);
  }

  // flex:1 + min-height:0 让 body 恰好占满上下栏之间的空间，
  // MiuixScrollArea 内部滚动（viewport 裁掉横向溢出）。
  &__body {
    flex: 1;
    min-height: 0;
  }

  // 内容 wrapper 撑满视口高度，供子页面（如设置页编辑器 Tab）用 height:100% 占满剩余空间。
  // 内容超出视口的页面（概览/更新等）仍由 viewport 滚动：scrollable overflow 含溢出于孙，
  // 不受 height:100% 影响。
  &__body .m-scroll-area__content {
    height: 100%;
  }

  // 固定顶栏 + 滚动体 + 底栏都坐在 surface 背景上（卡片之下）。
  &__body,
  .m-top-app-bar,
  .m-navigation-bar {
    background: var(--m-color-surface);
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
