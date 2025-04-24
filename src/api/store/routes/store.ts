import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::store.store', {
  only: ['find', 'findOne', 'create', 'update', 'delete'],
  config: {
    find: {
      //policies: ['global::is-authenticated'],
    },
    findOne: {
      //policies: ['global::is-owner'],
    },
    update: {
      policies: ['global::is-owner'],
    },
    delete: {
      policies: ['global::is-owner'],
    },
    create: {
      //policies: ['global::is-authenticated'],
    }
  }
});
