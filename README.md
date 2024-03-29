# Javascript DynamoDB Context Store

Used by the [SmartApp SDK](https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs) to store IDs and access tokens for an installed instance of a SmartApp and retrieves that information for use in asynchronous API calls. The use of a context store is only needed when SmartApps have to call the SmartThings API in response to external events. SmartApps that only response to lifecycle events from the SmartThings platform will automatically have the proper context without the app having to store it.

The context stored by this module consists of the following data elements:

* **installedAppId**: the UUID of the installed app instance. This is the primary key of the table.
* **locationId**: the UUID of the location in which the app is installed
* **locale**: the locale client used to install the app
* **authToken**: the access token used in calling the API
* **refreshToken**: the refresh token used in generating a new access token when one expires
* **config**: the current installed app instance configuration, i.e. selected devices, options, etc.
* **state**: name-value storage for the installed app instance. This is useful for storing information
  between invocations of the SmartApp. It's not retried by the `get` method, but rather by `getItem`.

**_Note: Version 3.X.X is a breaking change to version 2.X.X as far as configuring the context store is
concerned, but either one can be used with any version of the SmartThings SDK. The new state storage
functions are only available with version 5.X.X or later of the SDK._**

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
            name: 'custom-table',       // defaults to 'smartapp'
            hashKey: 'key1',            // defaults to 'id'
            prefix: 'context',          // defaults to 'ctx'
            billingMode: 'PROVISIONED', // defaults to 'PAY_PER_REQUEST'
            readCapacityUnits: 10,      // defaults to 1, applies to automatic creation only
            writeCapacityUnits: 10      // defaults to 1, applies to automatic creation only
        },
        aws: {
			region: 'us-east-2',        // defaults to 'us-east-1'
		},
        autoCreate: true                // defaults to true
    }
))
```

The **table** configuration options are:

* **name** -- The name of the DynamoDB table storing the context
* **hashKey** -- The name of the partition key of the table
* **prefix** -- A string pre-pended to the installed app ID and used as the partition key for the entry
* **billingMode** -- The billing mode of the table. Either `PAY_PER_REQUEST` or `PROVISIONED`
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

By default, the AWS credentials are picked up from the environment. If you prefer you can 
explicitly set the credentials in this way:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        aws: {
			endpoint: 'http://localhost:8000',
            credentials: {
				accessKeyId: '<YOUR_ACCESS_KEY_ID>',
				secretAccessKey: '<YOUR_SECRET_ACCESS_KEY>',
            },
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

### Partition Key Prefix

The default behavior is to construction the partition key of the context records from the installedAppId with
the prefix `pre:`. If you want to override this prefix you can do so by specifying the `prefix` option:

```javascript
smartapp.contextStore(new DynamoDBContextStore(
    {
        table: {
            name: 'my-application',
            prefix: 'context$'
        }
    }
))
```

## State Storage

The context store can also be used to store state information for the installed app instance. This is
particularly useful for SmartApps that are not stateless, i.e. they need to remember information between
invocations. The state storage functions are only available with version 5.X.X or later of the SDK.
