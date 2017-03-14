var config = {};

config.api_key = 'be65fe76147759d7931718826f7db263';

config.app_id = 'amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa';
if (process.env.NODE_ENV == 'dev'){
	config.app_id ='amzn1.ask.skill.8a6e07e0-d6c4-4c24-9b37-b63245116251';
}
config.host_name = 'www.alotofpilates.com';
config.host = 'https://www.alotofpilates.com';
config.api_secret ='MPP-Allow-API-Call';


module.exports = config;
