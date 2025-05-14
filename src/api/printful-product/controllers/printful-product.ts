import { Context } from "vm";
import { refreshPrintfulToken } from "../../printful-oauth/services/printful-oauth";

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
    let token = store.token;
    const refreshToken = store.refreshToken;
    const expiresAt = store.expiresAt;

    if (!token || !refreshToken) {
      return ctx.badRequest('No hay tokens de Printful configurados');
    }
    
    if (new Date(expiresAt) <= new Date()) {
      try {
        const refreshed = await refreshPrintfulToken(store);
        token = refreshed.access_token;
        // opcional: podrías redeclara expiresAt si lo necesitas más abajo
      } catch (err) {
        strapi.log.error('Error refrescando token Printful:', err);
        return ctx.internalServerError('No se pudo renovar el token de Printful');
      }
    }
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
          'Authorization': `Bearer ${token}`,
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

  async getById(ctx) {
    console.log('getById')
    const { slug, id } = ctx.params;
    console.log("id", id);
    if (!slug || !id) {
      return ctx.badRequest("Falta el slug de la tienda o el ID de producto");
    }
    
    // 1. Buscar tienda
    const store = await strapi.db
      .query("api::store.store")
      .findOne({ where: { slug } });

    if (!store) {
      return ctx.notFound("Tienda no encontrada");
    }

    let token = store.token;
    const refreshToken = store.refreshToken;
    const expiresAt    = store.expiresAt;

    if (!token || !refreshToken) {
      return ctx.badRequest("No hay tokens de Printful configurados");
    }

    // 2. Refrescar si está expirado
    if (new Date(expiresAt) <= new Date()) {
      try {
        const refreshed = await refreshPrintfulToken(store);
        token = refreshed.access_token;
      } catch (err) {
        strapi.log.error("Error refrescando token Printful:", err);
        return ctx.internalServerError("No se pudo renovar el token de Printful");
      }
    }
   
    console.log("token", token);
    console.log("store", store);
    // 3. Llamar al endpoint de Printful para producto por ID
    const url = `https://api.printful.com/store/products/${id}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        ctx.status = response.status;
        ctx.body   = { error: `Error al obtener producto: ${response.statusText}` };
        return;
      }

      const data = await response.json();
      ctx.body = data;
    } catch (err) {
      strapi.log.error("Error comunicándose con Printful:", err);
      return ctx.internalServerError(`Error comunicándose con Printful: ${err.message}`);
    }
  },
};
