<script setup>
// 概览页：状态卡片 / 地址 / 服务控制 / 开机自启。
import { computed, onMounted } from 'vue'
import { MiuixCard, MiuixText, MiuixButton, MiuixSmallTitle, MiuixSwitchPreference } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import * as moduleApi from '../api/module'

const { status, busy, error, refreshStatus, runAction } = useModuleState()

onMounted(() => {
  refreshStatus(false)
})

// 状态卡片：每行 2 个。tone 决定色调（success/danger/primary/warning），
// 具体颜色在样式中以带语义名的局部变量表达（见 .status-cell 处注释）。
const statusCards = computed(() => {
  if (!status.value) return []
  return [
    {
      label: '服务状态',
      value: status.value.serviceRunning ? '运行中' : '未运行',
      tone: status.value.serviceRunning ? 'success' : 'danger',
    },
    {
      label: '开机自启',
      value: status.value.autostart ? '已启用' : '已禁用',
      tone: status.value.autostart ? 'primary' : 'warning',
    },
    {
      label: '配置状态',
      value: status.value.configModified ? '已修改未重启' : '正常',
      tone: status.value.configModified ? 'warning' : 'success',
    },
    {
      label: '后端模式',
      value: status.value.mergeMode ? '合并端口' : '前后端分离',
      tone: 'primary',
    },
  ]
})

// 与 action.sh 一致：合并模式显示直达，分离模式分开显示前后端
const addresses = computed(() => {
  if (!status.value) return []
  if (status.value.mergeMode) {
    return [{ label: '直达地址', value: status.value.directUrl }]
  }
  return [
    { label: '前端地址', value: status.value.frontUrl },
    { label: '后端地址', value: status.value.backUrl },
  ]
})

function handleOpen() {
  if (status.value?.openUrl) {
    runAction('open', () => moduleApi.openUrl(status.value.openUrl))
  }
}

// 开关值没变直接跳过；失败时回读真实状态，避免 UI 与模块不一致。
function handleAutostartToggle(v) {
  if (v === status.value.autostart) return
  runAction('toggle-autostart', () => moduleApi.toggleAutostart()).then((ok) => {
    if (!ok) refreshStatus(false)
  })
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="状态" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="status-grid">
        <div
          v-for="card in statusCards"
          :key="card.label"
          class="status-cell"
          :class="`status-cell--${card.tone}`"
        >
          <MiuixText
            class="status-cell__label"
            type="body2"
            color="var(--m-color-on-surface-variant-summary)"
            >{{ card.label }}</MiuixText
          >
          <MiuixText class="status-cell__value" :size="20" weight="bold">{{ card.value }}</MiuixText>
        </div>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="地址" />
    <MiuixCard class="ex-card ex-card--pad">
      <div v-for="item in addresses" :key="item.label" class="addr-row">
        <MiuixText
          class="addr-row__label"
          type="body2"
          color="var(--m-color-on-surface-variant-summary)"
          >{{ item.label }}</MiuixText
        >
        <MiuixText class="addr-row__value" type="body1" :selectable="true">{{ item.value }}</MiuixText>
      </div>
      <div class="addr-open">
        <MiuixButton type="primary" :disabled="busy" @click="handleOpen">打开</MiuixButton>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="服务控制" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="busy || status?.serviceRunning"
          @click="runAction('start', () => moduleApi.startService())"
        >启动</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy || !status?.serviceRunning"
          @click="runAction('stop', () => moduleApi.stopService())"
        >停止</MiuixButton>
        <MiuixButton
          type="primary"
          :disabled="busy"
          @click="runAction('restart', () => moduleApi.restartService())"
        >重启</MiuixButton>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="开机自启" />
    <MiuixCard class="ex-card">
      <MiuixSwitchPreference
        v-if="status"
        title="开机自启"
        summary="下次开机自动启动服务"
        :model-value="status.autostart"
        @update:model-value="handleAutostartToggle"
      />
    </MiuixCard>

    <div v-if="error" class="ex-error">
      <MiuixText type="body2" color="var(--m-color-error)">{{ error }}</MiuixText>
    </div>
  </div>
</template>

<style lang="scss">
.page {
  // 底部 12dp 空隙（底栏在滚动区外，无需 nav-bar inset）。用 padding 而非 margin，
  // 因为滚动容器可靠地包含内容 padding 进滚动高度，却可能裁掉最后一个子元素的 margin。
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

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.status-cell {
  // 语义色调：库 token 只覆盖 主色(蓝)/错误(红)，绿/橙没有现成语义 token，
  // 用 miuix 色板近似值（example 下拉示例的 #36D167 绿 / #FFB21D 黄）定义成
  // 带语义名的局部变量，集中管理、便于日后统一换 token。
  --tone-success: #36d167;
  --tone-warning: #ffb21d;

  display: grid;
  gap: 2px;

  &--success &__value {
    color: var(--tone-success);
  }
  &--danger &__value {
    color: var(--m-color-error);
  }
  &--warning &__value {
    color: var(--tone-warning);
  }
  &--primary &__value {
    color: var(--m-color-primary);
  }
}

.addr-row {
  display: grid;
  gap: 2px;
  margin-bottom: 10px;

  &:last-of-type {
    margin-bottom: 0;
  }

  &__value {
    overflow-wrap: anywhere;
  }
}

.addr-open {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.control-row {
  display: flex;
  gap: 12px;
}

.ex-error {
  margin: 0 12px 12px;
}
</style>
