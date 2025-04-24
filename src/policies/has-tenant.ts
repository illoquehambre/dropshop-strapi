/*export default (policyContext) => {
  return Boolean(policyContext.state.tenantId);
};*/

export default async (
  context: any,
  config: any,
  { strapi }: { strapi: any }
): Promise<boolean> => {
  const tenantId = context.state?.tenantId;

  if (!tenantId) {
    context.response.status = 400;
    context.response.body = { error: 'Tenant ID missing' };
    return false;
  }

  return true;
};
