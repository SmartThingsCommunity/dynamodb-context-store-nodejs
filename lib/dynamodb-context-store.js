const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const { DeleteCommand, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

const primaryKey = Symbol('private')
const createTableIfNecessary = Symbol('private')

module.exports = class DynamoDBContextStore {
	/**
	 * Create a context store instance
	 * @param {DynamoDBContextStoreOptions} [options] Table and AWS configuration options
	 */
	constructor(options = {}) {
		this.table = {
			name: 'smartapp',
			hashKey: 'id',
			prefix: 'ctx:'
		}

		if (options.table) {
			const {table} = options
			this.table.name = table.name || this.table.name
			this.table.hashKey = table.hashKey || this.table.hashKey
			this.table.prefix = table.prefix || this.table.prefix
			if (typeof options.table.sortKey === 'string') {
				this.table.sortKey = {
					AttributeName: options.table.sortKey,
					AttributeType: 'S',
					AttributeValue: 'context',
					KeyType: 'RANGE'
				}
			} else {
				this.table.sortKey = options.table.sortKey
			}
		}

		if (options.client) {
			this.client = options.client
		} else if (options.aws) {
			this.client = new DynamoDBClient(options.aws)
		} else {
			this.client = new DynamoDBClient()
		}

		const marshallOptions = { removeUndefinedValues: true }
		const unmarshallOptions = {}
		const translateConfig = { marshallOptions, unmarshallOptions }
		this.documentClient = DynamoDBDocumentClient.from(this.client, translateConfig)

		if (options.autoCreate !== false) {
			this[createTableIfNecessary](options)
		}
	}

	/**
	 * Get the data associated with the `installedAppId`
	 * @param {String} installedAppId Installed app identifier
	 * @returns {Promise<ContextObject>}
	 */
	async get(installedAppId) {
		const params = {
			TableName: this.table.name,
			Key: {
				[this.table.hashKey]: this[primaryKey](installedAppId)
			},
			ConsistentRead: true
		}

		if (this.table.sortKey) {
			params.Key[this.table.sortKey.AttributeName] = this.table.sortKey.AttributeValue
		}

		const data = await this.documentClient.send(new GetCommand(params))
		return data.Item
	}

	/**
	 * Puts the data into the context store
	 * @param {ContextObject} context Context object
	 * @returns {Promise<ContextObject>}
	 */
	async put(context) {
		const item = {
			installedAppId: context.installedAppId,
			locationId: context.locationId,
			locale: context.locale,
			authToken: context.authToken,
			refreshToken: context.refreshToken,
			config: context.config,
			state: context.state || {}
		}

		const params = {
			TableName: this.table.name,
			Item: {
				[this.table.hashKey]: this[primaryKey](context.installedAppId),
				...item
			}
		}

		if (this.table.sortKey) {
			params.Item[this.table.sortKey.AttributeName] = this.table.sortKey.AttributeValue
		}

		await this.documentClient.send(new PutCommand(params))

		return item
	}

	/**
	 * Updates the data in the context store by `installedAppId`
	 * @param {String} installedAppId Installed app identifier
	 * @param {Partial<ContextObject>} context The Context object values to update
	 * @returns {Promise<Partial<ContextObject>>}
	 */
	async update(installedAppId, context) {
		const names = {}
		const values = {}
		const expressions = []
		for (const name of Object.keys(context)) {
			const expressionNameKeys = []
			const nameSegs = name.split('.')
			for (const i in nameSegs) {
				if (Object.prototype.hasOwnProperty.call(nameSegs, i)) {
					const nameKey = `#${nameSegs.slice(0, i + 1).join('_')}`
					names[nameKey] = nameSegs[i]
					expressionNameKeys.push(nameKey)
				}
			}

			const valueKey = `:${nameSegs.join('_')}`
			values[valueKey] = context[name]
			expressions.push(`${expressionNameKeys.join('.')} = ${valueKey}`)
		}

		const params = {
			TableName: this.table.name,
			Key: {
				[this.table.hashKey]: this[primaryKey](installedAppId)
			},
			UpdateExpression: 'SET ' + expressions.join(', '),
			ExpressionAttributeNames: names,
			ExpressionAttributeValues: values
		}

		if (this.table.sortKey) {
			params.Key[this.table.sortKey.AttributeName] = this.table.sortKey.AttributeValue
		}

		await this.documentClient.send(new UpdateCommand(params))
	}

	/**
	 * Delete the row from the table
	 * @param {String} installedAppId Installed app identifier
	 * @returns {Promise<void>}
	 */
	async delete(installedAppId) {
		const params = {
			TableName: this.table.name,
			Key: {
				[this.table.hashKey]: this[primaryKey](installedAppId)
			}
		}

		if (this.table.sortKey) {
			params.Key[this.table.sortKey.AttributeName] = this.table.sortKey.AttributeValue
		}

		await this.documentClient.send(new DeleteCommand(params))
	}

	[primaryKey](installedAppId) {
		return `${this.table.prefix}${installedAppId}`
	}

	async [createTableIfNecessary](options) {
		try {
			await this.client.send(new DescribeTableCommand({'TableName': this.table.name}))
			console.log(`DynamoDB context table '${this.table.name}' exists`)
		} catch (error) {
			if (error.name === 'ResourceNotFoundException') {
				console.log(`DynamoDB context table ${this.table.name}, creating`)
				const params = {
					TableName: this.table.name,
					AttributeDefinitions: [
						{
							AttributeName: this.table.hashKey,
							AttributeType: 'S'
						}
					],
					KeySchema: [
						{
							KeyType: 'HASH',
							AttributeName: this.table.hashKey
						}
					],
					BillingMode: 'PAY_PER_REQUEST'
				}

				if (options.table && (options.table.billingMode === 'PROVISIONED' || options.table.writeCapacityUnits || options.table.readCapacityUnits)) {
					params.BillingMode = 'PROVISIONED'
					params.ProvisionedThroughput = {
						WriteCapacityUnits: options.table.writeCapacityUnits || 1,
						ReadCapacityUnits: options.table.readCapacityUnits || 1
					}
				}

				if (this.table.sortKey) {
					params.AttributeDefinitions.push({
						AttributeName: this.table.sortKey.AttributeName,
						AttributeType: this.table.sortKey.AttributeType
					})
					params.KeySchema.push({
						KeyType: this.table.sortKey.KeyType,
						AttributeName: this.table.sortKey.AttributeName
					})
				}

				return this.client.send(new CreateTableCommand(params))
			}

			console.error(`Error creating DynamoDB table '${this.table.name}'`, error)
		}
	}
}
