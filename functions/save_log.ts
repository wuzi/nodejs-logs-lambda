'use strict'

import { Callback, Context, SQSEvent } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.save = (
  event: SQSEvent,
  context: Context,
  callback: Callback
) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body)

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: record.messageId,
        ...body
      }
    }

    dynamoDb.put(params, (error, result) => {
      if (error) {
        console.error(error)
      }

      context.done(null, '')
    })
  }
}
