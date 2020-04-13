<template>
  <b-card class="TaskList text-center">
    <template v-slot:header>
      <span>{{ vuexTaskList.title }}</span>
      <b-icon-gear @click="showTaskListEditor(vuexTaskList.id)" />
    </template>
    <slot />
  </b-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { BIconGear } from 'bootstrap-vue'

import { VuexTaskList } from '~/store/taskListStore'

import { taskListEditor } from '~/store'

@Component({
  components: {
    BIconGear
  }
})
export default class TaskList extends Vue {
  @Prop()
  vuexTaskList!: VuexTaskList

  // =================================================
  // TaskListEditor
  // =================================================

  showTaskListEditor(taskListId?: string) {
    taskListEditor.init(taskListId)
    this.$bvModal.show('modal-taskList-editor')
  }
}
</script>

<style lang="scss" scoped>
.TaskList {
  .card-body {
    padding: 0.5rem;
  }
}
</style>
