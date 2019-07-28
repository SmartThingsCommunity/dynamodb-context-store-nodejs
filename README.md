# Javascript DynamoDB Context Store

<p align="center">
<a href="https://circleci.com/gh/SmartThingsCommunity/dynamodb-context-store-nodejs/tree/master"><img src="https://circleci.com/gh/SmartThingsCommunity/dynamodb-context-store-nodejs.svg?style=svg"/></a>
<a href="https://www.npmjs.com/package/@smartthings/dynamodb-context-store"><img src="https://badgen.net/npm/v/@smartthings/dynamodb-context-store"/></a>
<a href="https://www.npmjs.com/package/@smartthings/dynamodb-context-store"><img src="https://badgen.net/npm/license/@smartthings/dynamodb-context-store"/></a>
<a href="https://codecov.io/gh/SmartThingsCommunity/dynamodb-context-store-nodejs"><img src="https://codecov.io/gh/SmartThingsCommunity/dynamodb-context-store-nodejs/branch/master/graph/badge.svg"/></a>
<a href="https://status.badgen.net/"><img src="https://badgen.net/xo/status/@smartthings/dynamodb-context-store"/></a>
</p>

Used by the [SmartApp SDK](https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs) to store IDs and access tokens for an installed instance of a SmartApp and retrieves that information for use in asynchronous API calls. The use of a context store is only needed when SmartApps have to call the SmartThings API in response to external events. SmartApps that only response to lifecycle events from the SmartThings platform will automatically have the proper context without the app having to store it.

The context stored by this module consists of the following data elements:

* **installedAppId**: the UUID of the installed app instance. This is the primary key of the table.
* **locationId**: the UUID of the location in which the app is installed
* **authToken**: the access token used in calling the API
* **refreshToken**: the refresh token used in generating a new access token when one expires
* **config**: the current installed app instance configuration, i.e. selected devices, options, etc.

_Note: Version 2.X.X is a breaking change to version 1.X.X as far as configuring the context store is
concerned, but either one can be used with any version of the SmartThings SDK._

## Installation

```bash
npm install @smartthings/dynamodb-context-store
```

## Usage

Create a `DynamoDBContextStore` object and pass it to the SmartApp connector to store the context in a table 
named `"smartapp"` in the `us-east-1` AWS region. If the table does not exist it will be created.

```javascript
smartapp.contextStore(new DynamoDBContextStore())
```

The more extensive set of options are shown in this example:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        table: {
            name: 'custom-table',   // defaults to 'smartapp'
            hashKey: 'key1',        // defaults to 'id'
            prefix: 'context',      // defaults to 'ctx'
            readCapacityUnits: 10,  // defaults to 5, applies to automatic creation only
            writeCapacityUnits: 10  // defaults to 5, applies to automatic creation only
        },
        AWSRegion: 'us-east-2',     // defaults to 'us-east-1'
        autoCreate: true            // defaults to true
    }
))
```

The **table** configuration options are:

* **name** -- The name of the DynamoDB table storing the context
* **hashKey** -- The name of the partition key of the table
* **prefix** -- A string pre-pended to the installed app ID and used as the partition key for the entry
* **readCapacityUnits** -- Number of consistent reads per second. Used only when table is created
* **writeCapacityUnits** -- Number of writes per second. Used only when table is created
* **sortKey** -- Optional sort key definition (see below for more details)

Other configuration options are:

* **AWSRegion** -- The AWS region containing the table
* **AWSConfigPath** -- The location of the AWS configuration JSON file
* **AWSConfigJSON** -- The AWS credentials and region
* **autoCreate** -- Controls whether table is created if it doesn't already exist

Note that only one of the AWS options should be specified or behavior will be inconsistent

### AWS Configuration Options

By default, the AWS credentials are picked up from the environment. If you prefer you can read the credentials
from a file with this configuration:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        AWSConfigPath: './path/to/file.json'
    }
))
```

You can also explicitly set the credentials in this way:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        AWSConfigJSON: {
            accessKeyId: '<YOUR_ACCESS_KEY_ID>',
            secretAccessKey: '<YOUR_SECRET_ACCESS_KEY>',
            region: 'us-east-2'
        }
    }
))
```

### Sort Key Configuration

In order to support single table schemas, the context store can be configured to use a table with a sort key.
The simplest way to do that is by specifying the sort key name:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        table: {
            name: 'my-application',
            hashKey: 'pk', 
            sortKey: 'sk'
        }
    }
))
```

More control over the sort key can be exercised using this form, which is configured with the default values
used when just the sort key name is specified:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        table: {
            name: 'my-application',
            hashKey: 'pk', 
            sortKey: {
                AttributeName: 'sk',
                AttributeType: 'S',
                AttributeValue: 'context',
                KeyType: 'RANGE'
            }
        }
    }
))
```
