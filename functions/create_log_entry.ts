'use strict'

import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'
import { SQS } from 'aws-sdk'

const queue = new SQS()

module.exports.create = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  const body = JSON.parse(event.body)
  const params: SQS.SendMessageParams = {
    MessageBody: {
      ...body,
      timestamp: new Date().getTime()
    },
    QueueUrl: process.env.QUEUE_URL
  }

  queue.sendMessage(params, function (err, data) {
    if (err) {
      console.log(err)

      const response = {
        statusCode: 500,
        body: JSON.stringify({
          status: false
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
