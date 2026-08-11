<script setup>
// 更新页：下拉选择更新项 + 更新按钮。
// 更新为耗时操作，后台执行（nohup &）并轮询日志完成，避免同步等待卡住 UI。
import { ref } from 'vue'
import { MiuixCard, MiuixButton, MiuixDropdownPreference, MiuixSmallTitle } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import { useOperationLog } from '../composables/useOperationLog'
import OperationLogPanel from '../components/OperationLogPanel.vue'

const { refreshStatus } = useModuleState()
const { content, visible, pending, runWithLog } = useOperationLog()

// 下拉项：显示文本 + 说明 → webui.sh 子命令（summary 即 MiuixDropdownItem 的说明行）
const options = [
  { text: '全部更新', summary: 'Sub-Store 前后端 + http-meta 全部', cmd: 'update-all' },
  { text: '更新前后端', summary: 'Sub-Store 前端与后端', cmd: 'update-sub-store' },
  { text: '仅后端', summary: '只更新 Sub-Store 后端', cmd: 'update-backend' },
  { text: '仅前端', summary: '只更新 Sub-Store 前端', cmd: 'update-frontend' },
  { text: 'http-meta 全部', summary: 'js + 模版文件 + 内核', cmd: 'update-http-meta all' },
  { text: 'http-meta js + tpl', summary: '只更新 js 与 模板文件', cmd: 'update-http-meta js' },
  { text: 'http-meta 内核稳定版', summary: '更新到稳定版 Mihomo 内核', cmd: 'update-http-meta kernel' },
  { text: 'http-meta 内核 Alpha', summary: '更新到 Alpha 版 Mihomo 内核', cmd: 'update-http-meta kernel-alpha' },
]

const selectedIndex = ref(0)

// 更新完成（日志停止增长）后刷新状态（服务可能已自动重启）
async function handleUpdate() {
  await runWithLog(options[selectedIndex.value].cmd)
  refreshStatus(false)
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="更新" />
    <MiuixCard class="ex-card update-panel">
      <MiuixDropdownPreference
        v-model="selectedIndex"
        title="更新项"
        :items="options"
        :disabled="pending"
      />
      <div class="update-row">
        <MiuixButton type="primary" :disabled="pending" @click="handleUpdate">
          {{ pending ? '更新中…' : '更新' }}
        </MiuixButton>
      </div>
    </MiuixCard>

    <OperationLogPanel :visible="visible" :content="content" title="操作日志" fill />
  </div>
</template>

<style lang="scss">
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 12px;
}

.ex-card {
  margin: 0 12px 12px;
}

.update-panel {
  min-height: 0;
  overflow-y: auto;
}

// 按钮行：与下拉框内容同宽（basic-component 行内 16px padding），右下角对齐
.update-row {
  display: flex;
  justify-content: flex-end;
  padding: 4px 16px 16px;
}
</style>
