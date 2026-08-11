<script setup>
// 配置页：Tab 1 常规设置（主题/启动/访问路径），Tab 2 Sub-Store 环境变量编辑器。
import { computed, onMounted, ref } from 'vue'
import {
  MiuixCard,
  MiuixDropdownPreference,
  MiuixSmallTitle,
  MiuixSwitchPreference,
  MiuixButton,
  MiuixText,
  MiuixTabRow,
} from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import { useStoredTheme } from '../composables/useStoredTheme'
import * as moduleApi from '../api/module'
import EnvFileEditor from '@/components/EnvFileEditor.vue'

const { status, busy, refreshStatus, runAction } = useModuleState()

// 主题：跟随系统 / 浅色 / 深色（对应 miuix example SettingsPage 的 Color Mode），选择持久化。
const { mode, setThemeMode } = useStoredTheme()
const colorModes = ['system', 'light', 'dark']
const colorModeItems = ['跟随系统', '浅色', '深色']
const colorMode = computed({
  get: () => colorModes.indexOf(mode.value),
  set: (i) => setThemeMode(colorModes[i] ?? 'system'),
})

onMounted(() => {
  refreshStatus(false)
})

const pathIsDefault = computed(() => status.value?.backendPathIsDefault ?? false)

// 与概览页同一个开关：值没变直接跳过，失败时回读真实状态。
function handleAutostartToggle(v) {
  if (v === status.value.autostart) return
  runAction('toggle-autostart', () => moduleApi.toggleAutostart()).then((ok) => {
    if (!ok) refreshStatus(false)
  })
}

// Tab：0=设置 1=编辑器。面板用 v-show 保持挂载，切 Tab 不丢失未保存的编辑器内容。
const tab = ref(0)
</script>

<template>
  <div class="page">
    <MiuixCard class="ex-card ex-card--pad settings-tabs">
      <MiuixTabRow v-model="tab" :tabs="['设置', '编辑器']" contour />
    </MiuixCard>

    <div v-show="tab === 0" class="settings-panel">
      <!-- 外观（主题切换，对应 miuix example 的 Color Mode） -->
      <MiuixSmallTitle text="外观" />
      <MiuixCard class="ex-card">
        <MiuixDropdownPreference
          v-model="colorMode"
          title="主题"
          :items="colorModeItems"
        />
      </MiuixCard>

      <MiuixSmallTitle text="启动" />
      <MiuixCard class="ex-card">
        <MiuixSwitchPreference
          v-if="status"
          title="开机自启"
          summary="下次开机自动启动服务"
          :model-value="status.autostart"
          @update:model-value="handleAutostartToggle"
        />
      </MiuixCard>

      <MiuixSmallTitle text="访问路径" />
      <MiuixCard class="ex-card ex-card--pad">
        <div class="control-row">
          <MiuixButton
            type="secondary"
            :disabled="busy"
            @click="runAction('regenerate-backend-path', () => moduleApi.regenerateBackendPath())"
          >重新生成随机路径</MiuixButton>
        </div>
        <MiuixText
          v-if="status && pathIsDefault"
          type="body2"
          color="var(--m-color-error)"
          class="path-warn"
        >当前仍为模块默认值，所有安装者都一样，建议重新生成。</MiuixText>
      </MiuixCard>
    </div>

    <div v-show="tab === 1" class="editor-panel">
      <EnvFileEditor title="sub_store.env" />
    </div>
  </div>
</template>

<style lang="scss">
.page {
  // 占满滚动视口：Tab 栏固定，设置 Tab 内部滚动，编辑器 Tab 填满剩余空间
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 12px;
}

.ex-card {
  margin: 0 12px 12px;

  &--pad .m-card {
    padding: 16px;
  }
}

.settings-tabs {
  flex: none;
}

.settings-panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 12px;
}

.editor-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.control-row {
  display: flex;
  gap: 12px;
}

.path-warn {
  display: block;
  margin-top: 12px;
}
</style>
