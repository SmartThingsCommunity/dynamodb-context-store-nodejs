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

	test('can set and get item', async () => {
		const installedAppId = uuid()
		const context = await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		await contextStore.setItem(context.installedAppId, 'count', 1)
		const count = await contextStore.getItem(context.installedAppId, 'count')
		expect(count).toEqual(1)

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

	test('clear item', async () => {
		const installedAppId = uuid()
		const context = await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		await contextStore.setItem(context.installedAppId, 'count', 1)
		let count = await contextStore.getItem(context.installedAppId, 'count')
		expect(count).toEqual(1)

		await contextStore.removeItem(context.installedAppId, 'count')
		count = await contextStore.getItem(context.installedAppId, 'count')
		expect(count).toBeUndefined()

		await contextStore.delete(installedAppId)
	})

	test('clear all items', async () => {
		const installedAppId = uuid()
		const context = await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		await contextStore.setItem(context.installedAppId, 'count', 1)
		await contextStore.setItem(context.installedAppId, 'name', 'Fred')
		let count = await contextStore.getItem(context.installedAppId, 'count')
		let name = await contextStore.getItem(context.installedAppId, 'name')
		expect(count).toEqual(1)
		expect(name).toEqual('Fred')

		await contextStore.removeAllItems(context.installedAppId)
		count = await contextStore.getItem(context.installedAppId, 'count')
		name = await contextStore.getItem(context.installedAppId, 'name')
		expect(count).toBeUndefined()
		expect(name).toBeUndefined()

		await contextStore.delete(installedAppId)
	})

	afterAll(() => {
		dynamoClient.destroy()
	})
})
