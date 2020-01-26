import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { ScanInput } from 'aws-sdk/clients/dynamodb'
const log = require('./get_logs_by_type.ts')

const scanMock = jest.fn((_params) => ([{ pk: 'foo', sk: 'bar' }]))
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE

beforeAll(async (done) => {
  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params: ScanInput, callback: Function) => {
    callback(null, scanMock(params))
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
  scanMock.mockClear()

  done()
})

describe('get logs by type from dynamodb', () => {
  it('should mock scanning documents using DocumentClient', async () => {
    const input: ScanInput = { TableName: '' }
    const dynamoDB = new AWS.DynamoDB.DocumentClient()
    expect(await dynamoDB.scan(input).promise()).toStrictEqual([{ pk: 'foo', sk: 'bar' }])
  })

  it('should return 400 if queryStringParameters is missing', async () => {
    const event = {}
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query string paramter "type" is required'
      })
    }

    await log.getByType(event, context, callback)
    expect(callback).toBeCalledWith(null, response)
  })

  it('should return 400 if queryStringParameters.type is missing', async () => {
    const event = { queryStringParameters: {} }
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Query string paramter "type" is required'
      })
    }

    await log.getByType(event, context, callback)
    expect(scanMock).not.toBeCalled()
    expect(callback).toBeCalledWith(null, response)
  })

  it('should return 200 after fetching records from dynamoDB', async () => {
    const event = { queryStringParameters: { type: 'log' } }
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const params = {
      TableName: '',
      ExpressionAttributeValues: {
        ':logType': event.queryStringParameters.type
      },
      ExpressionAttributeNames: {
        '#logType': 'type'
      },
      FilterExpression: '#logType = :logType'
    }

    await log.getByType(event, context, callback)
    expect(scanMock).toBeCalledWith(params)
    expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({ statusCode: 200 }))
  })
})
