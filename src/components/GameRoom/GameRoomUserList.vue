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
  <!-- 
    <v-list class="mt-0 pt-0">
        <v-list-item v-for="socketUser in room.users" :key="socketUser.id">
          <v-list-item-avatar size="28" class="mr-2" v-if="!socketUser.isGuest">
            <img :src="socketUser.profilePictureUrl" />
          </v-list-item-avatar>
          <v-list-item-avatar
            v-else
            rounded
            color="primary"
            size="28"
            class="pr-1 mr-2 justify-center"
          >
            <div>G</div>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ socketUser.displayName }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list> -->
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class GameRoomUserList extends Vue {}
</script>
