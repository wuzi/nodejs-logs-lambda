import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

/**
 * This functions fetches all logs by origin from DynamoDB
 * 
 * @param {APIGatewayProxyEvent} event Data received from the lambda
 * @param {Context} context Current context of the function
 * @param {Callback} callback Callback to return response or error
 */
module.exports.getByOrigin = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  const dynamoDb = new DynamoDB.DocumentClient() // needs to be initialised inside the function in order for the SDK method to be mocked

  const { queryStringParameters } = event

  // Checks if origin is present in query string parameters
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

  // Create dynamoDB scan param
  const params = {
    TableName: process.env.DYNAMODB_TABLE as string,
    ExpressionAttributeValues: {
      ":origin": queryStringParameters.origin
    },
    FilterExpression: "origin = :origin"
  }

  // Fetch dynamodb for data
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
