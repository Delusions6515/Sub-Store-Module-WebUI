<script setup>
// 概览页：状态卡片 / 地址 / 安全建议 / 服务控制 / 操作日志。
import { computed, onActivated, ref } from 'vue'
import { MiuixCard, MiuixText, MiuixButton, MiuixSmallTitle, showSnackbar } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import { useOperationLog } from '../composables/useOperationLog'
import OperationLogPanel from '../components/OperationLogPanel.vue'
import * as moduleApi from '../api/module'

const { status, busy, error, refreshStatus, runAction } = useModuleState()

onActivated(() => {
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

// 服务控制：nohup 后台执行立即返回，轮询状态至操作完成，再展示 run.log。
// 日志内容/可见性与更新页共用 useOperationLog + OperationLogPanel 展示。
const { content, visible } = useOperationLog()
const currentAction = ref('')
const pendingAction = ref(false)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function pollUntil(pred, timeoutMs, intervalMs = 600, onPoll) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await refreshStatus(false)
    if (onPoll) await onPoll()
    if (pred()) return
    await sleep(intervalMs)
  }
}

async function pollServiceState(name, onPoll) {
  if (name === 'restart') {
    // 先等 stop 生效（变 false），再等启动完成（true）
    await pollUntil(() => status.value?.serviceRunning === false, 6000, 600, onPoll)
    await pollUntil(() => status.value?.serviceRunning === true, 15000, 600, onPoll)
  } else if (name === 'start') {
    await pollUntil(() => status.value?.serviceRunning === true, 12000, 600, onPoll)
  } else {
    await pollUntil(() => status.value?.serviceRunning === false, 10000, 600, onPoll)
  }
}

async function handleServiceAction(name) {
  currentAction.value = name
  pendingAction.value = true
  visible.value = true
  content.value = '正在执行，等待输出…'
  try {
    // 1. 后台触发（内部先归档旧日志，新 run.log 只含本次输出；exec 立即返回）
    const result = await moduleApi.runBackground(name)
    if (!result.ok) throw new Error(result.stderr || '指令发送失败')
    // 2. 轮询服务状态至操作完成（浏览器 dev 环境跳过），期间伪实时刷新日志
    if (!moduleApi.isBrowserDev) {
      await pollServiceState(name, async () => {
        const log = await moduleApi.getLog().catch(() => '')
        if (log) content.value = log
      })
    }
    // 3. 读取本次操作的日志
    content.value = await moduleApi.getLog().catch(() => '')
    visible.value = true
  } catch (err) {
    error.value = err?.message || '操作失败'
    showSnackbar({ message: error.value, withDismissAction: true })
  } finally {
    pendingAction.value = false
    currentAction.value = ''
  }
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
  if (status.value.runUserIsRoot) {
    issues.push({
      title: '运行用户',
      text: '当前以 root 用户运行，存在安全风险，建议改用 shell 用户运行（可在 sub_store.config 中 修改 run_as_user="shell"）',
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
    <MiuixCard v-if="securityIssues.length" class="ex-card ex-card--pad">
      <div v-for="(issue,i) in securityIssues" :key="issue.title" class="issues-item" :class='{ "issues-item--divided": i > 0 }'>
        <div class="issues-item__head">
          <MiuixText type="body1" weight="bold">{{ issue.title }}</MiuixText>
        </div>
        <MiuixText type="body2" class="issues-item__sample" color="var(--m-color-error)">{{ issue.text }}</MiuixText>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="服务控制" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="pendingAction || status?.serviceRunning"
          @click="handleServiceAction('start')"
        >{{ pendingAction && currentAction === 'start' ? '执行中…' : '启动' }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="pendingAction || !status?.serviceRunning"
          @click="handleServiceAction('stop')"
        >{{ pendingAction && currentAction === 'stop' ? '执行中…' : '停止' }}</MiuixButton>
        <MiuixButton
          type="primary"
          :disabled="pendingAction"
          @click="handleServiceAction('restart')"
        >{{ pendingAction && currentAction === 'restart' ? '执行中…' : '重启' }}</MiuixButton>
      </div>
    </MiuixCard>

    <OperationLogPanel :visible="visible" :content="content" title="操作日志" />

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

.issues-item {
  display: flex;
  flex-direction: column;
  // TextStyleItem: Column padding(vertical = 10.dp).
  padding: 10px 0;

  // HorizontalDivider between items (vertical padding 2dp in source).
  &--divided {
    border-top: 0.75px solid var(--m-color-divider-line);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    // Spacer(8.dp) between the header row and the first sample.
    margin-bottom: 8px;
  }

  // Spacer(2.dp) between consecutive sample lines.
  &__sample + &__sample {
    margin-top: 2px;
  }
}
</style>
