const { v4: uuid } = require('uuid')
const { createLocalClient } = require('../utilities/client-utils')
const DynamoDBContextStore = require('../../lib/dynamodb-context-store')
const { PutItemCommand } = require('@aws-sdk/client-dynamodb')

describe('Stateless record migration', () => {
	const tableName = 'context-store-test-0'
	const dynamoClient = createLocalClient()
	const contextStore = new DynamoDBContextStore({
		table: {
			name: tableName,
		},
		client: dynamoClient,
		autoCreate: false,
	})

	test('set item creates state property if missing', async () => {
		const installedAppId = uuid()
		const params = {
			TableName: tableName,
			Item: {
				id: {S: `ctx:${installedAppId}`},
				installedAppId: {S: installedAppId},
			}
		}

		await dynamoClient.send(new PutItemCommand(params))

		await contextStore.setItem(installedAppId, 'count', 1)
		const count = await contextStore.getItem(installedAppId, 'count')
		expect(count).toEqual(1)

		await contextStore.delete(installedAppId)
	})

	test('get item return undefined if state property is missing', async () => {
		const installedAppId = uuid()
		const params = {
			TableName: tableName,
			Item: {
				id: {S: `ctx:${installedAppId}`},
				installedAppId: {S: installedAppId},
			}
		}

		await dynamoClient.send(new PutItemCommand(params))

		const partnerId = await contextStore.getItem(installedAppId, 'partnerId')
		expect(partnerId).toBeUndefined()

		await contextStore.delete(installedAppId)
	})
})
