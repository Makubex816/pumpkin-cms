module.exports = async function staticContactHealth(context) {
  context.res = {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
    body: {
      ok: true,
      service: 'static-contact',
      route: '/api/static-contact-health',
      contactRoute: '/api/static-contact',
      programmingModel: 'azure-functions-v3-function-json',
    },
  };
};
