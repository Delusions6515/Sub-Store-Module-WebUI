<script setup>
// 可复用 env 文件编辑器：CodeMirror（shell 高亮），原始文本编辑模块生效的 env。
// 读写走 webui.sh read-env/save-env（脚本内解析用户配置目录优先，保存前自动备份）。
// 保存成功后 emit('saved')，可据此触发服务重启（env 修改需重启生效）。
import { computed, onMounted, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { oneDark } from '@codemirror/theme-one-dark'
import { MiuixButton, MiuixCard, MiuixSmallTitle, MiuixText } from 'miuix-vue'
import { readEnvFile, writeEnvFile } from '../api/module'
import { useStoredTheme } from '../composables/useStoredTheme'

const props = defineProps({
  title: { type: String, default: '' },
})
const emit = defineEmits(['saved', 'error'])

const content = ref('')
const original = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const dirty = computed(() => content.value !== original.value)

// 主题跟随应用（system 按系统偏好解析），dark 时叠加 one-dark
const { mode } = useStoredTheme()
const isDark = computed(() => {
  if (mode.value === 'dark') return true
  if (mode.value === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
})

const extensions = computed(() => [
  EditorView.lineWrapping,
  StreamLanguage.define(shell),
  ...(isDark.value ? [oneDark] : []),
])

onMounted(load)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const text = await readEnvFile()
    content.value = text
    original.value = text
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    await writeEnvFile(content.value)
    original.value = content.value
    emit('saved')
  } catch (e) {
    error.value = e.message
    emit('error', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <MiuixSmallTitle v-if="title" :text="title" />
    <MiuixCard class="ex-card ex-card--pad">
      <Codemirror
        v-model="content"
        class="env-editor__code"
        :extensions="extensions"
        :disabled="loading || saving"
        placeholder="加载中…"
      />
      <MiuixText
        v-if="error"
        type="body2"
        color="var(--m-color-error)"
        class="env-editor__error"
      >{{ error }}</MiuixText>
      <div class="env-editor__actions">
        <MiuixButton
          type="secondary"
          :disabled="loading || saving || !dirty"
          @click="load"
        >重新加载</MiuixButton>
        <MiuixButton
          :disabled="loading || saving || !dirty"
          @click="save"
        >{{ saving ? '保存中…' : '保存' }}</MiuixButton>
      </div>
    </MiuixCard>
  </div>
</template>

<style lang="scss" scoped>
// CodeMirror 限高滚动；浅色用默认白底，深色叠加 one-dark
.env-editor__code {
  :deep(.cm-editor) {
    min-height: 320px;
    max-height: 50vh;
    font-size: 13px;
  }
  :deep(.cm-scroller) {
    max-height: 50vh;
    overflow: auto;
  }
}

.env-editor__error {
  display: block;
  margin-top: 8px;
}

.env-editor__actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
