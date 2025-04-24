import type Koa from 'koa';

export default async (ctx: Koa.Context) => {
  const { user } = ctx.state;
  const storeId = ctx.params.id;

  if (!user || !storeId) return false;

  const store = await strapi.db.query('api::store.store').findOne({
    where: { id: storeId },
    populate: { owner: true },
  });

  if (!store || !store.owner) return false;

  return store.owner.id === user.id;
};
