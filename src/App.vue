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
    <MiuixTopAppBar class="app__topbar" title="Sub-Store for Android" :subtitle="activeTitle" />

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
// 全局基础样式（原 src/styles/theme.css 收进这里），字体栈沿用 example 的 MiSans 那套。
:root {
  color-scheme: light dark;
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
    'MiSans VF',
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

  // 顶栏留白：不贴屏幕边缘，行高 52px 基础上再给四周呼吸空间。
  &__topbar {
    padding: 8px 20px;
  }

  &__bottom {
    flex: none;
    z-index: 10;
  }

  // flex:1 + min-height:0 让 body 恰好占满上下栏之间的空间，
  // MiuixScrollArea 内部滚动（viewport 裁掉横向溢出）。
  &__body {
    flex: 1;
    min-height: 0;
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
