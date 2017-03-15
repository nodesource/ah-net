## Multi Connection Late Subscribe Scenario

- one server that ends each connection immediately and closes itself after the 3rd one
- three clients that open a connection
- server processes data when it closed
- client processes no data
- the async-hook subscription is set up _after_ the server is listening in order to see that we can still detect the
  connection operations when we miss the listen step

## Data Files

- server network only data saved to `./test/tmp/multi-connection-late-subscribe.server.json`
- server all activity data saved to `./test/tmp/multi-connection-late-subscribe.server.all.json`

Run via `./run`
