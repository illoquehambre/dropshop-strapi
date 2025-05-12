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
    ],
  };