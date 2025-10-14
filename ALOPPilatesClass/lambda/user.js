const axios = require('axios');
const config = require('./config');

var User = function(token){
  this.id = 0;
  this.name = "";
  this.email ="";
  this.token = token;
  this.deviceId = "";
  this.signInCount = 0;
  this.workoutTakenCount = 0;
};

User.prototype.get = function(){
  return axios
    .get(`${config.host}/api/v3/users/`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token': config.api_secret,
        Authorization: `Bearer ${this.token}`
      }
    })
    .then((response) => response.data);
};



module.exports = User;