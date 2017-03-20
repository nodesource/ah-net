## One Connection Scenario

- one http server that ends the connection and closes itself when it gets `/shutdown` request
- one client that requests `/shutdown` immediately
- server processes data when it closed
- client processes data when the process exits

## Data Files

- server network only data saved to `./test/tmp/http-one-connection.server.json`
- server all activity data saved to `./test/tmp/http-one-connection.server.all.json`
- client network only data saved to `./test/tmp/http-one-connection.client.json`
- client all activity data saved to `./test/tmp/http-one-connection.client.all.json`

Run via `./run`
