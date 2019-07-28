/* eslint no-undef: "off" */
const AWS = require('aws-sdk')
const {expect} = require('chai')
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
		expect(store.table).to.include(tableDefaults)
	})

	it('should allow overriding DynamoDB Client', () => {
		const testDynamoClient = new AWS.DynamoDB()
		store = new DynamoDBContextStore({client: testDynamoClient, autoCreate: false})
		expect(store.client).to.deep.equal(testDynamoClient)

		store = new DynamoDBContextStore({autoCreate: false})
		expect(store.client).to.not.deep.equal(testDynamoClient)
	})
})
