import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { SQS } from 'aws-sdk'
import Log from '../models/log'

const queue = new SQS()

/**
 * This functions writes a new log in the SQS Queue
 * 
 * @param {APIGatewayProxyEvent} event Data received from the lambda
 * @param {Context} context Current context of the function
 * @param {Callback} callback Callback to return response or error
 */
module.exports.create = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  // Check if body is present
  if (!event.body) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: '"body" is required'
      })
    }
    callback(null, response)
    return
  }

  const body = JSON.parse(event.body)
  const { error } = Log.validate(body)

  // Check if log is valid
  if (error) {
    const response = {
      statusCode: 400,
      body: JSON.stringify(error.details)
    }
    callback(null, response)
    return
  }

  // Create message to send to SQS
  const params: SQS.SendMessageParams = {
    MessageBody: JSON.stringify({
      ...body,
      timestamp: new Date().getTime()
    }),
    QueueUrl: process.env.QUEUE_URL
  }

  // Send message to SQS
  queue.sendMessage(params, function (err, data) {
    if (err) {
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          status: false,
          message: err.message
        })
      }
      callback(null, response)
    } else {
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          status: true
        })
      }
      callback(null, response)
    }
  })
}
