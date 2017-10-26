# ah-net [![build status](https://secure.travis-ci.org/nodesource/ah-net.svg?branch=master)](http://travis-ci.org/nodesource/ah-net)

Tracks async hook events related to network operations.

## Installation

    npm install ah-net

## [API](https://nodesource.github.io/ah-net)

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### NetworkActivityCollector

Instantiates a NetworkActivityCollector.

Most of the actual processing of resources is performed by th @see
NetworkResourceProcessor.

Extends [ActivityCollector](https://github.com/nodesource/ah-collector) and thus
exposes the same [public
API](https://github.com/nodesource/ah-collector#api) with added
functionality.

**Parameters**

-   `$0.start` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)>** the start time of the process, i.e. the result of `process.hrtime()`
-   `$0.stackCapturer` **StackCapturer?** [see ah-stack-capturer](https://github.com/nodesource/ah-stack-capturer) which
    configures how and when stacks traces are captured and processed.By default a StackCapturer is used that captures stacks for all events for
    file system related types: `FSREQWRAP`, `FSREQUESTWRAP` and some others like
    `TickObject`s that also are related, i.e. if they contain information related
    to streams. (optional, default `StackCapturer`)
-   `$0.bufferLength` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** determines how many elements of Buffers are
    captured. By default not Buffer data is captured. (optional, default `0`)
-   `$0.stringLength` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)?** determines how much of each string is
    captured. By default no string data is captured. (optional, default `0`)
-   `$0.captureArguments` **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** if `true` arguments of callbacks
    are captured when they are processed. (optional, default `false`)
-   `$0.captureSource` **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** if `true` the source code of callbacks
    is captured when they are processed. (optional, default `false`)

### NetworkResourceProcessor

**Extends ResourceProcessor**

The Network processor grabs information off the network socket itself,
the server if present.

In the case of an http request the HTTPPARSR resource is present.
It has a lot of useful properties attached to it, including incoming and
outgoing http messages.

Below is a condensed outline of the HTTPARSER properties that are most relevant:

```js
{
   socket: {
     _httpMessage {
           _header
         , statusMessage
         , statusCode
         , _headerSent
         , finished
           ...
      }
    , _handle: { fd, reading, _parent }
    , server: { _connectionKey }
  }
 , incoming {
     httpVersion*
   , headers: { host, connection }
   , upgrade
   , url
   , method
   , statusCode
   , statusMessage
  }
}
```

## License

MIT
