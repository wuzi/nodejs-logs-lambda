import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { SendMessageRequest } from 'aws-sdk/clients/sqs'
import Log from '../models/log'
const log = require('./create_log_entry.ts')

const sendMessageMock = jest.fn((_params) => ([{ pk: 'foo', sk: 'bar' }]))
const QUEUE_URL = process.env.QUEUE_URL

jest.mock('../models/log')

beforeAll(async (done) => {
  AWSMock.setSDKInstance(AWS)
  AWSMock.mock('SQS', 'sendMessage', (params: SendMessageRequest, callback: Function) => {
    callback(null, sendMessageMock(params))
  })

  process.env.QUEUE_URL = ''
  done()
})

afterAll(async (done) => {
  AWSMock.restore('SQS')

  process.env.QUEUE_URL = QUEUE_URL
  done()
})

beforeEach(async (done) => {
  sendMessageMock.mockClear()

  done()
})

describe('insert new log in SQS queue', () => {
  it('should mock SQS sendMessage', async () => {
    const input: SendMessageRequest = {
      MessageBody: JSON.stringify({
        timestamp: new Date().getTime()
      }),
      QueueUrl: ''
    }
    const sqs = new AWS.SQS()
    expect(await sqs.sendMessage(input).promise()).toStrictEqual([{ pk: 'foo', sk: 'bar' }])
  })

  it('should return 400 if body is missing', async () => {
    const event = {}
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: '"body" is required'
      })
    }

    log.create(event, context, callback)
    expect(callback).toBeCalledWith(null, response)
  })

  it('should return 400 if body is invalid', async () => {
    const event = { body: '{}' }
    const context = { done: jest.fn() }
    const callback = jest.fn()

    const mockLogValidate = jest.spyOn(Log, 'validate') as jest.Mock
    mockLogValidate.mockImplementation(() => ({ error: { details: { message: 'invalid format' } } }))

    log.create(event, context, callback)
    expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({ statusCode: 400 }))
  })

  // it('should return 200 if message was sent to SQS', async () => {
  //   const event = { body: '{}' }
  //   const context = { done: jest.fn() }
  //   const callback = jest.fn()

  //   const mockLogValidate = jest.spyOn(Log, 'validate') as jest.Mock
  //   mockLogValidate.mockImplementation(() => ({ value: {} }))

  //   log.create(event, context, callback)
  //   expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({ statusCode: 200 }))
  // })
})
