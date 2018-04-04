const request = require('request');
const moment = require('moment');
const Service = require('./service').Service;
const getToken = require('../iam').getToken;

class TDRService extends Service {
  constructor(config) {
    super(config);
  }

  queryTDR(token) {
    const options = {
      method: 'GET',
      json: true,
      url: `${this.config.url}/DataItem`,
      qs: { 
        organization: this.config.organization,
        _count: '100',
        dataType: this.config.datatype
      },
      headers: { 
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${token}`,
        'Content-Type': '*',
        'Api-Version': '3' 
      } 
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
      
        console.log(body);
        return resolve(body);
      });
    });
  }

  query(startTimeMS, endTimeMS) {
    return getToken(this.config.iamUrl,this.config.oAuthClient, this.config.oAuthClientPassword,
      this.config.username, this.config.password)
      .then((token) => {
        console.log('Token: ', token);
        return Promise.reject();
      })
      .catch((error) => {
        console.error(error);
        return Promise.resolve([]);
      });
  }
}

module.exports = TDRService;