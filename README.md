# Javascript DynamoDB Context Store

Used by the [SmartApp SDK](https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs) to store IDs and access tokens for an installed instance of a SmartApp
and retrieves that information for use in asynchronous API calls. The use of a context store
is only needed when SmartApps have to call the SmartThings API in response to external
events. SmartApps that only response to lifecycle events from the SmartThings platform
will automatically have the proper context without the app having to store it. 

The context stored by this module consists of the following data elements:

* **installedAppId**: the UUID of the installed app instance. This is the primary key of the table.
* **locationId**: the UUID of the location in which the app is installed
* **authToken**: the access token used in calling the API
* **refreshToken**: the refresh token used in generating a new access token when one expires
* **clientId**: the SmartApp's client ID, used in generating a new access token
* **clientSecret**: the SmartApp's client secret, used in generating a new access token
* **config**: the current installed app instance configuration, i.e. selected devices, options, etc.v

## Installation:
```
npm install @smartthings/dynamodb-context-store --save
```

## Usage

To use this module to add DynamoDB context storage to your SmartApp you should:
1. Create a DynamoDB table with `installedAppId` as its primary key

1. Give your Lambda permission to access that table

1. Create a context store instance with the table name and AWS region and pass it to the
smartapp SDK object. For example, the following code:

```
const smartapp = require('@smartthings/dynamodb-context-store');
const DynamoDBContextStore = require('@smartthings/dynamodb-context-store');

smartapp.contextStore(new DynamoDBContextStore('us-east-2', 'app-table-name'))
    .configureI18n()
    .page('mainPage', (page) => {
    ...    
```

will use a table named `app-table-name` in the `us-east-2` region.