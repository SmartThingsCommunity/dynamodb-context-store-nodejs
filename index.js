'use strict';
const AWS = require('aws-sdk');

module.exports = class DynamoDBContextStore {
    constructor(region, tableName) {
        this.region = region;
        this.tableName = tableName;
        AWS.config.update({region: region});
        this.docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    }

    get(installedAppId) {
        let params = {
            TableName: this.tableName,
            Key: {
                installedAppId: installedAppId
            },
            ConsistentRead: true
        };

        return new Promise((resolve, reject) => {
            this.docClient.get(params, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    if (data.Item) {
                        let result = data.Item;
                        result.config = JSON.parse(result.config);
                        resolve(result);
                    }
                    else {
                        resolve({});
                    }
                }
            });
        });
    }

    put(params) {
        const data = {
            TableName: this.tableName,
            Item: {
                installedAppId: params.installedAppId,
                locationId: params.locationId,
                authToken: params.authToken,
                refreshToken: params.refreshToken,
                clientId: params.clientId,
                clientSecret: params.clientSecret,
                config: JSON.stringify(params.config)
            }
        };
        console.log(JSON.stringify(data, null, 2));

        return new Promise((resolve, reject) => {
            this.docClient.put(data, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    update(installedAppId, params) {
        const data = {
            TableName: this.tableName,
            Key: {'installedAppId': installedAppId},
            UpdateExpression: 'SET authToken = :x, refreshToken = :y',
            ExpressionAttributeValues: {
                ':x': params.authToken,
                ':y': params.refreshToken
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.update(data, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    delete(installedAppId) {
        let params = {
            TableName: this.tableName,
            Key: {
                installedAppId: installedAppId
            }
        };

        return new Promise((resolve, reject) => {
            this.docClient.delete(params, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
};