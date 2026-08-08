<script setup>
// 操作日志展示：标题 + 卡片 + 行渲染，行色按日志级别。
// 供概览页（服务控制）与更新页（更新）复用；两页各自的完成判定/轮询逻辑留在页内。
import { MiuixCard, MiuixSmallTitle } from 'miuix-vue'

defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: '' },
  title: { type: String, required: true },
})

function logLineClass(line) {
  if (/\[Error\]/.test(line)) return 'log-line--error'
  if (/\[Warn\]/.test(line)) return 'log-line--warn'
  if (/\[Info\]/.test(line)) return 'log-line--info'
  return ''
}
</script>

<template>
  <MiuixSmallTitle v-if="visible && content" :text="title" />
  <MiuixCard v-if="visible && content" class="ex-card ex-card--pad">
    <div class="log-box">
      <div
        v-for="(line, i) in content.split('\n')"
        :key="i"
        class="log-line"
        :class="logLineClass(line)"
      >{{ line || ' ' }}</div>
    </div>
  </MiuixCard>
</template>

<style lang="scss" scoped>
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
</style>
