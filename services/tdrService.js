const request = require('request');
const moment = require('moment');
const Service = require('./service');
const getToken = require('../iam').getToken;
const interpreter = require('../interpreter');
const applicationConfig = require('../config.json');

class TDRService extends Service {
  constructor(config) {
    super(config);
    this.tokenCache = null;
  }

  getCachedToken() {
    if (this.tokenCache && (moment().unix() - this.tokenCache.creation < applicationConfig.tokenCachenMin * 60)) {
      return Promise.resolve(this.tokenCache.token);
    }
    return getToken(this.config.iamUrl,this.config.oAuthClient, this.config.oAuthClientPassword,
      this.config.username, this.config.password)
      .then((accessToken) => {
        this.tokenCache = {
          token: accessToken,
          creation: moment().unix()
        }
        return accessToken;
      });
  }

  queryTDR(token) {
    const options = {
      method: 'GET',
      json: true,
      url: `${this.config.url}/DataItem`,
      qs: { 
        organization: this.config.organization,
        dataType: this.config.datatype,
        timestamp: `gt${this.lastQueryTimestamp.toISOString()}`
      },
      headers: { 
        'cache-control': 'no-cache',
        authorization: `Bearer ${token}`,
        'content-type': '*',
        'api-version': '3' 
      }
    };
    const currentTimestamp = moment();
    
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        
        if (response.statusCode !== 200) {
          return reject(new Error(`TDR error, status code: ${response.statusCode}`));
        }
        if (body.entry.length > 0) {
          this.lastQueryTimestamp = currentTimestamp;
        }

        return resolve(body);
      });
    });
  }

  query() {
    return this.getCachedToken()
      .then((token) => {
        return this.queryTDR(token);
      })
      .then((response) => {
        const resources = response.entry.map(x => x.resource);
        const transformedResources = resources.map(x => ({
          id: x.id,
          playerID: x.device.value,
          timestamp: moment(x.creationTimestamp).valueOf(),
          data: x.data.data
        }));
        interpreter.addRecords(transformedResources);
        // console.log(transformedResources);
        return Promise.resolve();
      })
      .catch((error) => {
        console.error('Error', error);
        return Promise.resolve([]);
      });
  }
}

module.exports = TDRService;