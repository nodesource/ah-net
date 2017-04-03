## One TLS Connection Scenario

- one tls server that ends the first connection immediately and closes itself
- one tls client that opens a connection
- server processes data when it closed
- client processes data when the process exits

## Data Files

- server network only data saved to `./test/tmp/one-connection.tls.server.json`
- server all activity data saved to `./test/tmp/one-connection.tls.server.all.json`
- client network only data saved to `./test/tmp/one-connection.tls.client.json`
- client all activity data saved to `./test/tmp/one-connection.tls.client.all.json`

## Ensure localhost resolves to `::1`

Run `./check-localhost` and if it prints `OK`, you're good to go

Then run via `./run`

## Data Unique to TLS Server

### TCPWRAP Socket

The below are attached to the `TCPWRAP` representing the socket connection as well
as the one representing the listening server. In the latter it is attached as 
`resource.owner` while in the former case it is attached to `resource.owner.server`.

- `_contexts` Object
- `_sharedCreds` Object
- `requestCert` Boolean
- `rejectUnauthorized` Boolean
- `ciphers` String
- `honorCipherOrder` Boolean
- `sessionIdContext` String

### TLSWRAP

The below are attached to the `TLSWRAP` of the connection.
They are attached to `resource.owner` which is a `TLSSOCKET`.

- `_tlsOptions` Object
- `_secureEstablished` Boolean
- `_securePending` Boolean
- `_newSessionPending` Boolean
- `_controlReleased` Boolean
- `authorized` Boolean
- `encrypted` Boolean
- `servername`
- `npnProtocol`
- `alpnProtocol`
- `authorizationError`

The `resource.owner._handle` which is a `TLSWrap` has a lot of callbacks related
to the TLS protocol as well as few properties that may be interesting.

- `lastHandshakeTime` Number
- `handshakes` Number
- `ssl` Object is the TLSWrap which is the same as the `_handle` so we don't capture it
- `_requestCert` Boolean
- `_rejectUnauthorized` Boolean

It also has a reference to the server, which is the same as the one found as part
of the `TCPWRAP` resouce.
