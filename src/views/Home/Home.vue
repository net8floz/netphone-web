<template>
  <div class="d-flex flex-grow-1 screen-events">
    <v-container class="fill-parent-height">
      <v-row class="fill-parent-height">
        <v-col>
          <gql-me>
            <template #default="{ me }">
              <div class="d-flex flex-column fill-parent-height">
                <h2 class="d-flex align-center mb-2">
                  GMDiscord / {{ me.displayName }}
                  <v-spacer />
                  <!-- <v-btn
                @click="showDetails"
                icon
                :color="!isShowingCalendar ? 'primary' : ''"
              >
                <v-icon>mdi-format-list-checkbox</v-icon>
              </v-btn>
              <v-btn
                @click="showCalendar"
                icon
                :color="isShowingCalendar ? 'primary' : ''"
              >
                <v-icon>mdi-calendar</v-icon>
              </v-btn> -->
                </h2>

                <v-card>
                  {{ $auth.token }}
                </v-card>
              </div>
            </template>
          </gql-me>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GqlMe from '@/components/GqlMe.vue';

@Component({
  components: {
    GqlMe,
  },
})
export default class Home extends Vue {}
</script>
