<script setup>
// 关于页：项目介绍 / 相关项目链接 / 许可。
import { MiuixCard, MiuixText, MiuixSmallTitle, MiuixArrowPreference } from 'miuix-vue'

const relatedProjects = [
  { name: '模块仓库', url: 'https://github.com/Delusions6515/Sub-Store-Module' },
  { name: 'WebUI 仓库', url: 'https://github.com/Delusions6515/Sub-Store-Module-WebUI' },
  { name: 'Sub-Store', url: 'https://github.com/sub-store-org/Sub-Store' },
  { name: 'miuix-vue', url: 'https://github.com/YuKongA/miuix-vue' },
]

// noopener/noreferrer：新开页面无法通过 window.opener 反控本页。
function openLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="page">
    <MiuixSmallTitle text="Sub-Store for Android" />
    <MiuixCard class="ex-card ex-card--pad">
      <MiuixText type="body1">
        在 Android 上以系统级服务运行 Sub-Store 与 HTTP-META 的 Magisk / KernelSU / APatch 模块。
      </MiuixText>
    </MiuixCard>

    <MiuixSmallTitle text="相关项目" />
    <MiuixCard class="ex-card">
      <MiuixArrowPreference
        v-for="p in relatedProjects"
        :key="p.name"
        :title="p.name"
        :summary="p.url"
        @click="openLink(p.url)"
      />
    </MiuixCard>

    <MiuixSmallTitle text="许可" />
    <MiuixCard class="ex-card ex-card--pad">
      <MiuixText type="body1">GPL-3.0</MiuixText>
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
</style>
