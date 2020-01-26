import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { PutItemInput } from 'aws-sdk/clients/dynamodb'
const log = require('./save_log.ts')

const putMock = jest.fn((_params) => ({ pk: 'foo', sk: 'bar' }))
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE

beforeAll(async (done) => {
  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: PutItemInput, callback: Function) => {
    callback(null, putMock(params))
  })

  process.env.DYNAMODB_TABLE = ''
  done()
})

afterAll(async (done) => {
  AWSMock.restore('DynamoDB.DocumentClient')

  process.env.DYNAMODB_TABLE = DYNAMODB_TABLE
  done()
})

beforeEach(async (done) => {
  putMock.mockClear()

  done()
})

describe('save log to dynamodb', () => {
  it('should mock inserting document using DocumentClient', async () => {
    const input: PutItemInput = { TableName: '', Item: {} }
    const dynamoDB = new AWS.DynamoDB.DocumentClient()
    expect(await dynamoDB.put(input).promise()).toStrictEqual({ pk: 'foo', sk: 'bar' })
  })

  it('should not call dynamoDB put if there are no new records', async () => {
    const event = { Records: [] }
    const context = { done: jest.fn() }
    const callback = jest.fn()

    log.save(event, context, callback)
    expect(putMock).not.toBeCalled()
  })

  it('should insert new records in dynamoDB received by SQS event', async () => {
    const record = {
      messageId: '4d11ee4c-ac35-48c4-8631-1add5f4daaf6',
      body: JSON.stringify({
        origin: 'login',
        type: 'log',
        message: 'user has logged in the system'
      })
    }

    const event = { Records: [record] }
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const params = {
      TableName: process.env.DYNAMODB_TABLE as string,
      Item: {
        id: record.messageId,
        ...JSON.parse(record.body)
      }
    }

    log.save(event, context, callback)
    expect(putMock).toBeCalledWith(params)
  })
})
