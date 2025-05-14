export default {
    routes: [
      {
        method: 'GET',
        path: '/printful-products/:slug',
        handler: 'printful-product.getAll',
        config: {
          policies: [],
          middlewares: [],
        },
      },
       {
        method: 'GET',
        path: '/printful-products/:slug/details/:id',
        handler: 'printful-product.getById',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };