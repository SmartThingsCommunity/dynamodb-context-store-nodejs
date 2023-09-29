module.exports = {
	tables: [
		{
			TableName: 'context-store-test-1',
			KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}],
			AttributeDefinitions: [{AttributeName: 'id', AttributeType: 'S'}],
			ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
		},
		{
			TableName: 'context-store-test-2',
			KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}, {AttributeName: 'sk', KeyType: 'RANGE'}],
			AttributeDefinitions: [{AttributeName: 'id', AttributeType: 'S'}, {AttributeName: 'sk', AttributeType: 'S'}],
			ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
		},
	],
	port: 8000
}
