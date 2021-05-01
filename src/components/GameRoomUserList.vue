<template>
  <v-list>
    <v-list-item> Players <v-spacer /> n/n </v-list-item>
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-magnify</v-icon>
      </v-list-item-avatar>
      <v-list-item-content> Username </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class GameRoomUserList extends Vue {}
</script>
