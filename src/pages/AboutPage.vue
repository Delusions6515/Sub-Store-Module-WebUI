<script setup>
// 关于页：项目介绍 / 相关项目链接 / 许可。
import { MiuixCard, MiuixText, MiuixSmallTitle, MiuixArrowPreference, MiuixDialog, showSnackbar } from 'miuix-vue'
import { onScopeDispose, ref } from 'vue'

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

const sponsors = [
  { developer: 'Delusions6515', github: 'https://github.com/Delusions6515', methods: [
    { type: 'url', name: '爱发电', url: 'https://afdian.com/a/Delusions6515' },
    { type: 'crypto', name: 'Tron', address: 'TKqrs3bfRxNRiRNJtLG8XxvMgisBb495qb' }
  ]},
  { developer: 'lanyi233', github: 'https://github.com/lanyi233', methods: [
    { type: 'crypto', name: 'Tron (Trx Only)', address: 'TXZUEEcJkzucYjYdYZv3wR4d6a3mYoWp77' }
  ]},
  { developer: 'xream', github: 'https://github.com/xream', methods: [
    { type: 'crypto', name: 'Tron', address: 'TLqQU7oKLXBcbFFTvLbnKsNf412m6PVH8J' }
  ]}
]

const sponsorDialogVisible = ref(false)
const sponsorDialogDeveloper = ref({})
function openSponsorDialog(sponsorName) {
  sponsorDialogDeveloper.value = sponsors.find(s => s.developer === sponsorName)
  sponsorDialogDeveloper.value.methods.map(m => {
    switch (m.type) {
      case 'url':
        m.summary = `点击跳转 ${m.name}`
        break
      case 'crypto':
        m.summary = `点击复制 ${m.name} 地址`
        break
    }
  })
  sponsorDialogVisible.value = true
}
function onSponsorDialogClose() {
  sponsorDialogVisible.value = false
  sponsorDialogDeveloper.value = {}
}

function openSponsor (method) {
  switch (method.type) {
    case 'url':
      openLink(method.url)
      break
    case 'crypto':
      navigator.clipboard.writeText(method.address)
      showSnackbar({ message: `已复制 ${sponsorDialogDeveloper.value.developer} 的 ${method.name} 地址到剪贴板`, withDismissAction: true })
      break
  }
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

    <MiuixSmallTitle text="赞助我们" />
    <MiuixCard class="ex-card">
      <MiuixArrowPreference
        v-for="s in sponsors"
        :key="s.developer"
        :title="s.developer"
        :summary="s.github"
        @click="openSponsorDialog(s.developer)"
      />
    </MiuixCard>

    <MiuixDialog
      v-model="sponsorDialogVisible"
      :title="sponsorDialogDeveloper.developer + ' 的赞助方式'"
      @close="onSponsorDialogClose"
    >
      <MiuixCard class="ex-card">
        <MiuixArrowPreference
          v-for="m in sponsorDialogDeveloper.methods"
          :key="m.name"
          :title="m.name"
          :summary="m.summary"
          @click="openSponsor(m)">
        </MiuixArrowPreference>
      </MiuixCard>
    </MiuixDialog>

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
