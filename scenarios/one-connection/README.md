## One Connection Scenario

- one server that ends the first connection immediately and closes itself
- one client that opens a connection
- server processes data when it closed
- client processes data when the process exits

## Data Files

- server network only data saved to `./test/tmp/one-connection.server.json`
- server all activity data saved to `./test/tmp/one-connection.server.all.json`
- client network only data saved to `./test/tmp/one-connection.client.json`
- client all activity data saved to `./test/tmp/one-connection.client.all.json`

Run via `./run`
