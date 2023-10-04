const { v4: uuid } = require('uuid')
const { createLocalClient, waitForCreation } = require('../utilities/client-utils')
const DynamoDBContextStore = require('../../lib/dynamodb-context-store')

describe('Automatic table creation', () => {
	const dynamoClient = createLocalClient()

	test('create with sort key string', async () => {
		const contextStore = new DynamoDBContextStore({
			table: {
				name: 'context-store-test-3',
				sortKey: 'sk'
			},
			client: dynamoClient,
		})

		await waitForCreation()

		const installedAppId = uuid()
		await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			locale: 'ko-KR',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'},
		})

		const context = await contextStore.get(installedAppId)
		expect(context.installedAppId).toEqual(installedAppId)
		expect(context.locationId).toEqual('locationId')
		expect(context.authToken).toEqual('authToken')
		expect(context.refreshToken).toEqual('refreshToken')
		expect(context.locale).toEqual('ko-KR')
		expect(context.config).toEqual({settings: 'something'})

		await contextStore.delete(installedAppId)
	})

	test('create with sort key object', async () => {
		const contextStore = new DynamoDBContextStore({
			table: {
				name: 'context-store-test-4',
				sortKey: {
					AttributeName: 'order',
					AttributeType: 'N',
					AttributeValue: 0,
					KeyType: 'RANGE'
				}
			},
			client: dynamoClient,
		})

		await waitForCreation()

		const installedAppId = uuid()
		await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			locale: 'en-US',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'},
		})

		const context = await contextStore.get(installedAppId)
		expect(context.installedAppId).toEqual(installedAppId)
		expect(context.locationId).toEqual('locationId')
		expect(context.authToken).toEqual('authToken')
		expect(context.refreshToken).toEqual('refreshToken')
		expect(context.locale).toEqual('en-US')
		expect(context.config).toEqual({settings: 'something'})

		await contextStore.delete(installedAppId)
	})

	afterAll(() => {
		dynamoClient.destroy()
	})
})
