<script setup>
// 概览页：状态卡片 / 地址 / 安全建议 / 服务控制 / 操作日志。
import { computed, onMounted, ref } from 'vue'
import { MiuixCard, MiuixText, MiuixButton, MiuixSmallTitle } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import * as moduleApi from '../api/module'

const { status, busy, error, refreshStatus, runAction, lastOutput } = useModuleState()

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

// 服务控制：命令输出与 run.log 尾部合并展示，仅点击操作后出现
const actionLog = ref('')
const showLog = ref(false)
const currentAction = ref('')

async function handleServiceAction(name, fn) {
  currentAction.value = name
  // 命令含进程等待（stop 2s / restart 4s+），设 15s 超时避免界面长时间无响应
  const ok = await runAction(name, fn, { timeout: 15000 })
  const output = lastOutput.value.trim()
  const log = await moduleApi.getLog().catch(() => '')
  // 命令输出在前（本次操作反馈），run.log 尾部在后（历史操作日志）
  actionLog.value = ok && output ? `${output}\n${log}` : log
  showLog.value = true
  currentAction.value = ''
}

function logLineClass(line) {
  if (/\[Error\]/.test(line)) return 'log-line--error'
  if (/\[Warn\]/.test(line)) return 'log-line--warn'
  if (/\[Info\]/.test(line)) return 'log-line--info'
  return ''
}

// 安全问题列表：每条自带标题与描述，新增类型只需往数组里 push
const securityIssues = computed(() => {
  if (!status.value) return []
  const issues = []
  if (status.value.backendPathIsDefault) {
    issues.push({
      title: '访问路径',
      text: '当前仍为模块默认值，所有安装者都一样，建议到设置页重新生成',
    })
  }
  return issues
})
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

    <MiuixSmallTitle v-if="securityIssues.length" text="安全建议" />
    <MiuixCard
      v-for="issue in securityIssues"
      :key="issue.title"
      class="ex-card ex-card--pad"
    >
      <MiuixText type="body1">{{ issue.title }}</MiuixText>
      <MiuixText type="body2" color="var(--m-color-error)">{{ issue.text }}</MiuixText>
    </MiuixCard>

    <MiuixSmallTitle text="服务控制" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="busy || status?.serviceRunning"
          @click="handleServiceAction('start', () => moduleApi.startService())"
        >{{ busy && currentAction === 'start' ? '执行中…' : '启动' }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy || !status?.serviceRunning"
          @click="handleServiceAction('stop', () => moduleApi.stopService())"
        >{{ busy && currentAction === 'stop' ? '执行中…' : '停止' }}</MiuixButton>
        <MiuixButton
          type="primary"
          :disabled="busy"
          @click="handleServiceAction('restart', () => moduleApi.restartService())"
        >{{ busy && currentAction === 'restart' ? '执行中…' : '重启' }}</MiuixButton>
      </div>
    </MiuixCard>

    <MiuixSmallTitle v-if="showLog && actionLog" text="操作日志" />
    <MiuixCard v-if="showLog && actionLog" class="ex-card ex-card--pad">
      <div class="log-box">
        <div
          v-for="(line, i) in actionLog.split('\n')"
          :key="i"
          class="log-line"
          :class="logLineClass(line)"
        >{{ line || ' ' }}</div>
      </div>
    </MiuixCard>

    <div v-if="error" class="ex-error">
      <MiuixText type="body2" color="var(--m-color-error)">{{ error }}</MiuixText>
    </div>
  </div>
</template>

<style lang="scss">
.page {
  // 语义色调：库 token 只覆盖 主色(蓝)/错误(红)，绿/橙没有现成语义 token，
  // 用 miuix 色板近似值（example 下拉示例的 #36D167 绿 / #FFB21D 黄）定义成
  // 带语义名的页面级变量，状态卡片与操作日志共用，便于日后统一换 token。
  --tone-success: #36d167;
  --tone-warning: #ffb21d;

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

// 操作日志：等宽字体、限高滚动，行色按日志级别
.log-box {
  max-height: 240px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Cascadia Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
}

.log-line {
  &--info {
    color: var(--tone-success);
  }
  &--warn {
    color: var(--tone-warning);
  }
  &--error {
    color: var(--m-color-error);
  }
}

.ex-error {
  margin: 0 12px 12px;
}
</style>
