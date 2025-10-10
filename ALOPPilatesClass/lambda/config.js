const config = {
  api_key: process.env.ALOP_API_KEY || 'be65fe76147759d7931718826f7db263',
  app_id:
    process.env.ALOP_APP_ID || 'amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa',
  host_name: process.env.ALOP_HOST_NAME || 'www.alotofpilates.com',
  host: process.env.ALOP_HOST || 'https://www.alotofpilates.com',
  api_secret: process.env.ALOP_API_SECRET || 'MPP-Allow-API-Call'
};

module.exports = config;