import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

export default factories.createCoreController('api::store.store', ({ strapi }) => ({
    // GET /stores
    async find(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized();
        }

        const stores = await strapi.entityService.findMany('api::store.store', {
            filters: {
                owner: user.id,
            },
            populate: ['owner'],
        });

        return stores;
    },
    async findOne(ctx) {
        const { id } = ctx.params;
        console.log('slug', id);
        const entity = await strapi.db.query('api::store.store').findOne({

            where: { title: id },
            populate: ['owner'],
        });
        console.log('entity', entity);
        if (!entity) {
            return ctx.notFound('Store not found');
        }

        // ⚠️ Devuelve solo los campos que quieres exponer públicamente
        return {
            title: entity.title,
            logo: entity.logo,
            owner: {
                username: entity.owner?.username,
            },
        };
    },

    // POST /stores
    async create(ctx) {
        const user = ctx.state.user;
        const data = ctx.request.body.data;

        const entry = await strapi.entityService.create('api::store.store', {
            data: {
                ...data,
                owner: user.id,
            },
        });

        return entry;
    }

    // PUT /stores/:id
    /*async update(ctx: Context) {
      ctx.request.body.data = {
        ...(ctx.request.body.data ?? {}),
        tenantId: ctx.state.tenantId,
      };
      return super.update(ctx);
    },
  
    // DELETE /stores/:id
    async delete(ctx: Context) {
      return super.delete(ctx);
    },*/
}));
