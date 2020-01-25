import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { SQS } from 'aws-sdk'
import Log from '../models/log'

const queue = new SQS()

module.exports.create = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  if (!event.body) {
    const response = {
      statusCode: 400,
      message: 'Missing "body" of request'
    }
    callback(null, response)
    return
  }

  const { error } = Log.validate(event.body)
  if (error) {
    const response = {
      statusCode: 400,
      message: JSON.stringify(error.details)
    }
    callback(null, response)
    return
  }

  const body = JSON.parse(event.body)
  const params: SQS.SendMessageParams = {
    MessageBody: JSON.stringify({
      ...body,
      timestamp: new Date().getTime()
    }),
    QueueUrl: process.env.QUEUE_URL
  }

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
