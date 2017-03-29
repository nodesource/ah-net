const lastEls = require('../util/last-els')
const spok = require('spok')
const userFunctions = [
    { path: lastEls([ '_httpMessage', '_events', 'connect' ])
    , key: 'connect'
    , level: spok.ge(2)
    , info: {
          file: spok.test(/http-one-connection.+\.js$/)
        , line: spok.gtz
        , column: spok.gtz
        , inferredName: ''
        , name: 'onconnect' }
    , id: spok.gtz
    , arguments: null }
  , { path: lastEls([ '_httpMessage', '_events', 'error' ])
    , key: 'error'
    , level: spok.ge(2)
    , info: {
          file: spok.test(/http-one-connection.+\.js$/)
        , line: spok.gtz
        , column: spok.gtz
        , inferredName: ''
        , name: 'onerror' }
    , id: spok.gtz
    , arguments: null }
  , { path: lastEls([ '_httpMessage', '_events', 'response' ])
      , key: 'response'
      , level: spok.ge(2)
      , info: {
            file: spok.test(/http-one-connection.+\.js$/)
          , line: spok.gtz
          , column: spok.gtz
          , inferredName: ''
          , name: 'onresponse' }
      , id: spok.gtz
      , arguments: null } ]
userFunctions.$topic = 'user functions'

module.exports = userFunctions
