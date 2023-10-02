const { v4: uuid } = require('uuid')
const { createLocalClient } = require('../utilities/client-utils')
const DynamoDBContextStore = require('../../lib/dynamodb-context-store')

describe('Context Store with sort key', () => {
	const dynamoClient = createLocalClient()
	const contextStore = new DynamoDBContextStore({
		table: {
			name: 'context-store-test-2',
			sortKey: 'sk'
		},
		client: dynamoClient,
		autoCreate: false,
	})

	test('can update', async () => {
		const installedAppId = uuid()
		await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		await contextStore.update(installedAppId, {
			authToken: 'newAuthToken',
		})

		const context = await contextStore.get(installedAppId)
		expect(context.authToken).toEqual('newAuthToken')

		await contextStore.delete(installedAppId)
	})

	afterAll(() => {
		dynamoClient.destroy()
	})
})
