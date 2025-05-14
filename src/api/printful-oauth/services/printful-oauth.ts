import axios from 'axios';

export async function refreshPrintfulToken(store) {
  // Llama al endpoint de refresh token de Printful
  const resp = await axios.post(
    'https://www.printful.com/oauth/token',
    null,
    {
      params: {
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: store.refreshToken,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  const { access_token, refresh_token, expires_in } = resp.data;
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Actualiza la entidad Store con los nuevos tokens
  await strapi.entityService.update('api::store.store', store.id, {
    data: {
      token: access_token,
      refreshToken: refresh_token,
      expiresAt: newExpiresAt,
    },
  });

  return { access_token, refresh_token, expiresAt: newExpiresAt };
}