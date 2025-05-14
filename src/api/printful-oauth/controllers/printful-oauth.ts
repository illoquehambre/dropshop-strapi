import { Context } from "vm";
import axios from 'axios';
export default {
  async connectPrintful(ctx: Context) {
    
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }
    // Buscar la tienda por slug y owner
    const store = await strapi.db.query('api::store.store').findOne({
      where: { owner: user.id },
      populate: ['owner'],
    });
    if (!store) {
      return ctx.notFound('Store no encontrada o no tienes permiso');
    }
    console.log('store', store);
    // Construir la URL de autorización
    const clientId = process.env.PRINTFUL_CLIENT_ID;
    const redirectUrl = process.env.PRINTFUL_REDIRECT_URL;
    const state = store.slug; // Puedes incluir un nonce adicional para seguridad
    console.log('redirectUrl', redirectUrl);
    const authUrl =
      `https://www.printful.com/oauth/authorize?` +
      `client_id=${clientId}` +
      `&redirect_url=${encodeURIComponent(redirectUrl)}` +
      `&state=${state}` +
      `&response_type=code` +
      `&grant_type=authorize`;
    // Redirigir al usuario a Printful para autorizar
    console.log('URL:', authUrl);
    return ctx.send({authUrl});
  },

  async callbackPrintful(ctx) {
    console.log('CALLBACK');
    const { code, state } = ctx.query;
    if (!code) {
      return ctx.badRequest('Authorization code missing');
    }
    console.log('code', code);
    // Encontrar la tienda por el state (slug) y usuario autenticado

    const store = await strapi.db.query('api::store.store').findOne({
      where: { slug: state },
    });
    if (!store) {
      return ctx.notFound('Store no encontrada');
    }
    // Intercambiar el code por tokens
    try {
      const tokenResponse = await axios.post('https://www.printful.com/oauth/token', null, {
        params: {
          client_id: process.env.PRINTFUL_CLIENT_ID,
          client_secret: process.env.PRINTFUL_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.PRINTFUL_REDIRECT_URL,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log('tokenResponse', tokenResponse.data);
      const { access_token, refresh_token, expires_at } = tokenResponse.data;
      // Calcular fecha de expiración
      const expiresAt = new Date(Date.now() + expires_at).toISOString();
      console.log('expiresAt', expiresAt);
      // Guardar tokens en la tienda de Strapi
      const updatedStore = await strapi.documents('api::store.store').update({
        documentId: store.documentId,
        data: {
          token: access_token,
          refreshToken: refresh_token,
          expiresAt: expiresAt,
        },
      });
      ctx.body = { message: 'Printful conectado exitosamente' };
    } catch (err) {
      console.error('Error token Printful:', err.response?.data || err.message);
      return ctx.internalServerError('No se pudo conectar con Printful');
    }
  }
};
