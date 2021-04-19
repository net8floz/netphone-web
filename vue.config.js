module.exports = {
  lintOnSave: false,
  transpileDependencies: ['vuetify'],
  chainWebpack: (config) => {
    // GraphQL Loader
    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end();
  },
  // devServer: {
  //   proxy: {
  //     '^/graphql': {
  //       target: process.env.DEV_SERVER_PROXY_GRAPHQL_HOST,
  //       ws: true,
  //       changeOrigin: true
  //     },
  //     '^/oauth': {
  //       target: process.env.DEV_SERVER_PROXY_OAUTH_HOST
  //     }
  //   }
  // }
};
