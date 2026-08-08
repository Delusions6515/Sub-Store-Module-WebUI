<script setup>
// 更新页：Sub-Store 前后端 / http-meta 两组更新按钮。
// 更新为耗时操作，后台执行（nohup &）并轮询日志完成，避免同步等待卡住 UI。
import { ref } from 'vue'
import { MiuixCard, MiuixButton, MiuixSmallTitle } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import { useOperationLog } from '../composables/useOperationLog'
import OperationLogPanel from '../components/OperationLogPanel.vue'
import * as moduleApi from '../api/module'

const { refreshStatus } = useModuleState()
const { content, visible, pending, runWithLog } = useOperationLog()

// 当前正在执行的更新项：仅对应按钮显示“更新中…”，其余按钮保持原文字
const currentAction = ref('')

const actions = {
  'update-all': '全部更新',
  'update-sub-store': '更新前后端',
  'update-backend': '仅后端',
  'update-frontend': '仅前端',
  'update-http-meta all': 'http-meta 全部',
  'update-http-meta js': 'http-meta js + tpl',
  'update-http-meta kernel': 'http-meta 内核稳定版',
  'update-http-meta kernel-alpha': 'http-meta 内核 Alpha',
}

function buttonLabel(key) {
  return pending.value && currentAction.value === key ? '更新中…' : actions[key]
}

// 更新完成（日志停止增长）后刷新状态（服务可能已自动重启）
async function handleUpdate(name) {
  currentAction.value = name
  try {
    await runWithLog(name)
  } finally {
    currentAction.value = ''
  }
  refreshStatus(false)
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Sub-Store 前后端" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="primary"
          :disabled="pending"
          @click="handleUpdate('update-all')"
        >{{ buttonLabel('update-all') }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-sub-store')"
        >{{ buttonLabel('update-sub-store') }}</MiuixButton>
      </div>
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-backend')"
        >{{ buttonLabel('update-backend') }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-frontend')"
        >{{ buttonLabel('update-frontend') }}</MiuixButton>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="http-meta" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="primary"
          :disabled="pending"
          @click="handleUpdate('update-http-meta all')"
        >{{ buttonLabel('update-http-meta all') }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-http-meta js')"
        >{{ buttonLabel('update-http-meta js') }}</MiuixButton>
      </div>
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-http-meta kernel')"
        >{{ buttonLabel('update-http-meta kernel') }}</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="pending"
          @click="handleUpdate('update-http-meta kernel-alpha')"
        >{{ buttonLabel('update-http-meta kernel-alpha') }}</MiuixButton>
      </div>
    </MiuixCard>

    <OperationLogPanel :visible="visible" :content="content" title="操作日志" />
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
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
