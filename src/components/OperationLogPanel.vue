<script setup>
// 操作日志展示：标题 + 卡片 + 行渲染，行色按日志级别。
// 供概览页（服务控制）与更新页（更新）复用；两页各自的完成判定/轮询逻辑留在页内。
// fill=true 时逐层 flex 拉伸占满父级剩余空间（更新页用），否则保持限高 300px（概览页用）。
import { ref, watch } from 'vue'
import { MiuixCard, MiuixSmallTitle } from 'miuix-vue'
// Supports weights 100-800
import '@fontsource-variable/jetbrains-mono/wght.css';

const props = defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: '' },
  title: { type: String, required: true },
  fill: { type: Boolean, default: false },
})

const boxRef = ref(null)

function logLineClass(line) {
  if (/\[Error\]/.test(line)) return 'log-line--error'
  if (/\[Warn\]/.test(line)) return 'log-line--warn'
  if (/\[Info\]/.test(line)) return 'log-line--info'
  return ''
}

// 日志增长时跟随到底部（用户已滚回上方则不打断），伪实时刷新时最新输出始终可见。
watch(
  () => props.content,
  () => {
    const box = boxRef.value
    if (box && box.scrollHeight - box.scrollTop - box.clientHeight < 40) {
      box.scrollTop = box.scrollHeight
    }
  },
)
</script>

<template>
  <div class="log-panel" :class="{ 'log-panel--fill': fill }">
    <MiuixSmallTitle v-if="visible && content" :text="title" />
    <MiuixCard
      v-if="visible && content"
      class="ex-card ex-card--pad"
      :class="{ 'log-panel__card--fill': fill }"
    >
      <div ref="boxRef" class="log-box" :class="{ 'log-box--fill': fill }">
        <div
          v-for="(line, i) in content.split('\n')"
          :key="i"
          class="log-line"
          :class="logLineClass(line)"
        >{{ line || ' ' }}</div>
      </div>
    </MiuixCard>
  </div>
</template>

<style lang="scss" scoped>
// 非 fill：普通流，日志限高 300px（概览页）；fill：逐层 flex 拉伸占满父级（更新页）
.log-panel--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.log-panel__card--fill {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(.m-card) {
    flex: 1;
    min-height: 0;
  }
}

.log-box {
  overflow-y: auto;
  max-height: 300px;
  font-family: 'JetBrains Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;

  // fill：去掉限高，占满卡片剩余高度，内部滚动
  &--fill {
    max-height: none;
    height: 100%;
    min-height: 0;
  }
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
