/* eslint no-undef: "off" */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const DynamoDBContextStore = require('../../lib/dynamodb-context-store')

describe('context-store-spec', () => {
	/** @type {DynamoDBContextStore} */
	let store

	it('table defaults', () => {
		const tableDefaults = {
			name: 'smartapp',
			hashKey: 'id',
			prefix: 'ctx:'
		}
		store = new DynamoDBContextStore({autoCreate: false})
		expect(store.table).toEqual(tableDefaults)
	})

	it('table customization', () => {
		const tableDefaults = {
			name: 'app-data',
			hashKey: 'pk',
			sortKey: {
				AttributeName: 'sk',
				AttributeType: 'S',
				AttributeValue: 'context',
				KeyType: 'RANGE'
			},
			prefix: 'context$'
		}
		store = new DynamoDBContextStore({autoCreate: false, table: {name: 'app-data', hashKey: 'pk', sortKey: 'sk', prefix: 'context$'}})
		expect(store.table).toEqual(tableDefaults)
	})

	it('table customization sort key object', () => {
		const sortKey = {
			AttributeName: 'sk',
			AttributeType: 'N',
			AttributeValue: '0',
			KeyType: 'RANGE'
		}

		const tableDefaults = {
			name: 'smartapp',
			hashKey: 'id',
			sortKey,
			prefix: 'ctx:'
		}
		store = new DynamoDBContextStore({autoCreate: false, table: {sortKey}})
		expect(store.table).toEqual(tableDefaults)
	})

	it('should allow overriding DynamoDB Client', () => {
		const testDynamoClient = new DynamoDBClient()
		store = new DynamoDBContextStore({client: testDynamoClient, autoCreate: false})
		expect(store.client).toEqual(testDynamoClient)

		store = new DynamoDBContextStore({autoCreate: false})
		expect(store.client).not.toEqual(testDynamoClient)
	})
})
