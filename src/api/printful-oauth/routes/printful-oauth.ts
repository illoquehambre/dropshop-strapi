export default {
  routes: [
    {
      method: 'GET',
      path: '/printful-oauth',
      handler: 'printful-oauth.connectPrintful',
      config: {
        policies: [], // 
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/printful-oauth/callback',
      handler: 'printful-oauth.callbackPrintful',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};