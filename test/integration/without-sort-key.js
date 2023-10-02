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

	test('can set and get integer item', async () => {
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

		await contextStore.delete('installedAppId3')
	})

	test('can set and get string item', async () => {
		const installedAppId = uuid()
		await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		const context = await contextStore.get(installedAppId)

		await contextStore.setItem(context.installedAppId, 'name', 'Bill')
		const name = await contextStore.getItem(context.installedAppId, 'name')
		expect(name).toEqual('Bill')

		await contextStore.delete(installedAppId,)
	})

	test('can set and get object item', async () => {
		const installedAppId = uuid()
		const context = await contextStore.put({
			installedAppId,
			locationId: 'locationId',
			authToken: 'authToken',
			refreshToken: 'refreshToken',
			config: {settings: 'something'}
		})

		await contextStore.setItem(context.installedAppId, 'point', {x: 1, y: 2, z: 3})
		const point = await contextStore.getItem(context.installedAppId, 'point')
		expect(point).toEqual({x: 1, y: 2, z: 3})

		await contextStore.delete(installedAppId)
	})

	test('multiple setItem calls leave previous state undisturbed', async () => {
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
		const count = await contextStore.getItem(context.installedAppId, 'count')
		const name = await contextStore.getItem(context.installedAppId, 'name')
		expect(count).toEqual(1)
		expect(name).toEqual('Fred')

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
