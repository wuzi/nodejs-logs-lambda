import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.getByType = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  const { queryStringParameters } = event

  if (!queryStringParameters || !queryStringParameters.type) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query string paramter "type" is required'
      })
    }
    callback(null, response)
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    ExpressionAttributeValues: {
      ":logType": queryStringParameters.type
    },
    ExpressionAttributeNames: {
      "#logType": "type"
    },
    FilterExpression: "#logType = :logType"
  }

  dynamoDb.scan(params, function (err, data) {
    if (err) {
      const response = {
        statusCode: 500,
        body: JSON.stringify(err)
      }
      callback(null, response)
    } else {
      const response = {
        statusCode: 200,
        body: JSON.stringify(data)
      }
      callback(null, response)
    }
  })
}
