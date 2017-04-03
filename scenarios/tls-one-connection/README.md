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
