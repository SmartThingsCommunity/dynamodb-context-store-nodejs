import { DynamoDBClient, DynamoDBClientConfig, KeySchemaElement } from '@aws-sdk/client-dynamodb'

export interface ContextObject {
	installedAppId: string
	locationId: string
	locale: string
	authToken: string
	refreshToken: string
	config: any
	state: any
}

export interface DynamoDBContextStore {
	get(installedAppId: string): Promise<ContextObject>
	put(installedAppId: string, context: ContextObject): Promise<void>
	update(installedAppId: string, context: Partial<ContextObject>): Promise<void>
	delete(installedAppId: string): Promise<void>
}

export interface ExtendedKeySchemaElement extends KeySchemaElement {
	/**
	 * The type of the attribute. This value is used only for creating the table when autoCreate is true.
	 */
	AttributeType?: string

	/**
	 * The value used for the sort key when inserting records into the table. All context store values have the same
	 * sort key value, since there is only one record per partition key.
	 */
	AttributeValue: any
}

export interface TableOptions {
	/**
	 * The name of the table to create or use.
	 */
	name: string

	/**
	 * The attribute name of the partition key of the table. Defaults to 'id' if not specified.
	 */
	hashKey?: string

	/**
	 * The sort key of the table. This can be a string or an extended KeySchemaElement object. If it is a string it is assumed
	 * to be a RANGE key with a string attribute type. If it is an object and autoCreate is true, then the AttributeType
	 * property must be supplied. If autoCreate is false, then it can be omitted.
	 */
	sortKey?: string | ExtendedKeySchemaElement

	/**
	 * The prefix prepended to the installedAppId when constructing the partition key. Defaults to 'ctx:' if not specified.
	 */
	prefix?: string

	/**
	 * The billing mode of the table. Defaults to PAY_PER_REQUEST if not specified.
	 */
	billingMode?: 'PAY_PER_REQUEST' | 'PROVISIONED'

	/**
	 * The number of write capability units used when creating the table. Only used if autoCreate is true.
	 * Defaults to 1 if not specified.
	 */
	writeCapacityUnits?: number

	/**
	 * The number of read capability units used when creating the table. Only used if autoCreate is true.
	 * Defaults to 1 if not specified.
	 */
	readCapacityUnits?: number
}

export interface DynamoDBContextStoreOptions {
	table: TableOptions
	config: DynamoDBClientConfig
	autoCreate?: boolean
	client?: DynamoDBClient
}
