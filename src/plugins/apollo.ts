import Vue from 'vue';
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-boost';
import auth from '@/plugins/auth';

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: process.env.VUE_APP_GRAPHQL_ENDPOINT,
  request: (operation) => {
    const { token } = auth;
    operation.setContext({
      headers: {
        Authorization: token ? `${token}` : '',
      },
    });
  },
});

Vue.use(VueApollo);

export default new VueApollo({
  defaultClient: apolloClient,
});
