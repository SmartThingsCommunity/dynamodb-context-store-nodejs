/* eslint no-undef: "off" */
const AWS = require('aws-sdk')
const DynamoDBContextStore = require('../lib/dynamodb-context-store')

describe('context-store-spec', () => {
	/** @type {DynamoDBContextStore} */
	let store

	it('should set table defaults', () => {
		const tableDefaults = {
			name: 'smartapp',
			hashKey: 'id',
			sortKey: null,
			prefix: 'ctx:'
		}
		store = new DynamoDBContextStore({autoCreate: false})
		expect(store.table).toEqual(tableDefaults)
	})

	it('should allow overriding DynamoDB Client', () => {
		const testDynamoClient = new AWS.DynamoDB()
		store = new DynamoDBContextStore({client: testDynamoClient, autoCreate: false})
		expect(store.client).toEqual(testDynamoClient)

		store = new DynamoDBContextStore({autoCreate: false})
		expect(store.client).not.toEqual(testDynamoClient)
	})
})
