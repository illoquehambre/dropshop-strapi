import { Context } from "vm";

export default {
  async getAll(ctx: Context) {
    const { slug } = ctx.params;
    if (!slug) {
      return ctx.badRequest("Falta el slug de la tienda");
    }
    console.log("slug", slug);
    // 1. Buscar tienda por slug en colección `store`
    const store = await strapi.db
      .query("api::store.store")
      .findOne({ where: { slug } });

    if (!store) {
      return ctx.notFound("Tienda no encontrada");
    }
    console.log("store", store);
    const apiKey = store.printful_api_key;
    if (!apiKey) {
      return ctx.badRequest("API key de Printful no configurada");
    }
    console.log("apiKey", apiKey);
    // 2. Construir petición a Printful
    const url = "https://api.printful.com/store/products";
    

    const params: { category_id?: string } = {};
    if (ctx.query.category) {
      params.category_id = ctx.query.category;
    }

    // 3. Llamada al API externo
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        ctx.status = response.status;
        ctx.body = { error: `Error al obtener productos: ${response.statusText}` };
        return;
      }
  
      const data = await response.json();

      // 4. Devolver los datos al cliente
      ctx.body = data;
    } catch (err) {
      if (err.response) {
        ctx.status = err.response.status;
        return err.response.data;
      }
      ctx.throw(500, `Error comunicándose con Printful: ${err.message}`);
    }
  },
};
