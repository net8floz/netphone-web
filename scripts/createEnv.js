const fs = require('fs');

const vars = [
  'VUE_APP_FIREBASE_CONFIG',
  'VUE_APP_GRAPHQL_ENDPOINT',
  'VUE_APP_OAUTH_LOGIN_ENDPOINT',
  'VUE_APP_SELF_ENDPOINT',
];

const str = vars
  .map((i) => {
    return `${i}=${process.env[i]}`;
  })
  .join('\n');

fs.writeFileSync('./.env', str);

console.log('Wrote ' + str);

console.log(env);
