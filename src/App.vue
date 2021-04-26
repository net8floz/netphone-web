<template>
  <v-app>
    <v-main>
      <AuthGuard>
        <div class="d-flex flex-column main-container">
          <Header />
          <router-view style="height: 100%" />
        </div>
      </AuthGuard>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AuthGuard from '@/components/AuthGuard.vue';
import Header from '@/components/Header.vue';


@Component({
  components: {
    AuthGuard,
    Header,
  },
})
export default class App extends Vue {}
</script>
