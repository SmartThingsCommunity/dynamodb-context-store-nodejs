const { v4: uuid } = require('uuid')
const { createLocalClient } = require('../utilities/client-utils')
const DynamoDBContextStore = require('../../lib/dynamodb-context-store')

describe('Context Store without sort key', () => {
	const dynamoClient = createLocalClient()
	const contextStore = new DynamoDBContextStore({
		table: {
			name: 'context-store-test-1',
		},
		client: dynamoClient,
	})

	test('can put and get', async () => {
		const installedAppId = uuid()
		await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			locale: 'ko-KR',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'},
			state: {isaState: 'some state'}
		})

		const context = await contextStore.get(installedAppId)
		expect(context.installedAppId).toEqual(installedAppId)
		expect(context.locationId).toEqual('locationId')
		expect(context.authToken).toEqual('authToken')
		expect(context.refreshToken).toEqual('refreshToken')
		expect(context.locale).toEqual('ko-KR')
		expect(context.config).toEqual({settings: 'something'})
		expect(context.state).toEqual({isaState: 'some state'})

		await contextStore.delete(installedAppId)
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
