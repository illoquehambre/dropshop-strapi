import type { Context } from 'koa';

export default (
  config: Record<string, unknown>,
  { strapi }: { strapi: any }   // `strapi` inyectado sin tipar estrictamente
) => {
  return async (ctx: Context, next: () => Promise<unknown>) => {
    // 1. Extraer subdominio como tenantId
    const host = ctx.request.header.host ?? '';
    const subdomain = host.split('.')[0];
    ctx.state.tenantId = subdomain;

    // 2. Verificar existencia de la tienda
    const store = await strapi.db.query('api::store.store').findOne({
      where: { slug: subdomain },
    });
    if (!store) {
      return ctx.badRequest('Tenant no encontrado');
    }

    // 3. Continuar flujo
    await next();
  };
};
