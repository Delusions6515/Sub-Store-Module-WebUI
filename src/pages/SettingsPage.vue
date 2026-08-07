<script setup>
// 配置页：主题 / 启动开关 / 访问路径重生成。
import { computed, onMounted } from 'vue'
import {
  MiuixCard,
  MiuixDropdownPreference,
  MiuixSmallTitle,
  MiuixSwitchPreference,
  MiuixButton,
  MiuixText,
  useTheme,
} from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import * as moduleApi from '../api/module'

const { status, busy, refreshStatus, runAction } = useModuleState()

// 主题：跟随系统 / 浅色 / 深色（对应 miuix example SettingsPage 的 Color Mode）。
const { mode, setThemeMode } = useTheme()
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
</script>

<template>
  <div class="page">
    <!-- 外观（主题切换，对应 miuix example 的 Color Mode） -->
    <MiuixSmallTitle text="外观" />
    <MiuixCard class="ex-card">
      <MiuixDropdownPreference
        v-model="colorMode"
        title="主题"
        :summary="colorModeItems[colorMode]"
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
</template>

<style lang="scss">
.page {
  padding-bottom: 12px;

  > :last-child {
    margin-bottom: 0;
  }
}

.ex-card {
  margin: 0 12px 12px;

  &--pad .m-card {
    padding: 16px;
  }
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
