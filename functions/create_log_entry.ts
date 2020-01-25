'use strict'

import { SQS } from 'aws-sdk'

const queue = new SQS()

module.exports.create = (
  event: any,
  context: any,
  callback: (arg0: any, arg1: any) => void
) => {
  const params: SQS.SendMessageParams = {
    MessageBody: event.body,
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
