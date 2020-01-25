'use strict'

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.save = (
  event: any,
  context: any,
  callback: (arg0: any, arg1: any) => void
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
