const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

module.exports.createLocalClient = () => {
	return new DynamoDBClient(
		{
			region: 'local-env',
			credentials: {
				accessKeyId: 'xxxyyyzzz',
				secretAccessKey: 'aaabbbccc',
			},
			endpoint: 'http://localhost:8000',
			sslEnabled: false,
		}
	)
}

module.exports.waitForCreation = (timeout = 2000) => {
	return new Promise((resolve, _) => {
		// Simulating async behavior using setTimeout so that table is created before test finishes
		setTimeout(() => {
			resolve()
		}, timeout)
	})
}
