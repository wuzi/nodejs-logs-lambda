'use strict'

module.exports.create = (
  event: any,
  context: any,
  callback: (arg0: any, arg1: any) => void
) => {
  const response = {
    statusCode: 200
  }
  callback(null, response)
}
