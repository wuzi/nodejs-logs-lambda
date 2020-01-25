import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.getByOrigin = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  const { queryStringParameters } = event

  if (!queryStringParameters || !queryStringParameters.origin) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query string paramter "origin" is required'
      })
    }
    callback(null, response)
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    ExpressionAttributeValues: {
      ":origin": queryStringParameters.origin
    },
    FilterExpression: "origin = :origin"
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
