<script setup>
// 更新页：Sub-Store 前后端 / http-meta 两组更新按钮。
import { MiuixCard, MiuixButton, MiuixSmallTitle } from 'miuix-vue'
import { useModuleState } from '../composables/useModuleState'
import * as moduleApi from '../api/module'

const { busy, runAction } = useModuleState()
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Sub-Store 前后端" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="primary"
          :disabled="busy"
          @click="runAction('update-all', () => moduleApi.updateAll())"
        >全部更新</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('update-sub-store', () => moduleApi.updateSubStore())"
        >更新前后端</MiuixButton>
      </div>
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('update-backend', () => moduleApi.updateBackend())"
        >仅后端</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('update-frontend', () => moduleApi.updateFrontend())"
        >仅前端</MiuixButton>
      </div>
    </MiuixCard>

    <MiuixSmallTitle text="http-meta" />
    <MiuixCard class="ex-card ex-card--pad">
      <div class="control-row">
        <MiuixButton
          type="primary"
          :disabled="busy"
          @click="runAction('http-meta all', () => moduleApi.updateHttpMeta('all'))"
        >全部</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('http-meta js', () => moduleApi.updateHttpMeta('js'))"
        >js + tpl</MiuixButton>
      </div>
      <div class="control-row">
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('http-meta kernel', () => moduleApi.updateHttpMeta('kernel'))"
        >内核稳定版</MiuixButton>
        <MiuixButton
          type="secondary"
          :disabled="busy"
          @click="runAction('http-meta kernel-alpha', () => moduleApi.updateHttpMeta('kernel-alpha'))"
        >内核 Alpha</MiuixButton>
      </div>
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
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
