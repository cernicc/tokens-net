# tokens-net

[TokensNet](https://www.tokens.net/) REST client

## README Overview

* [Install](#install)
* [Example](#example)
* [Debug Info](#debug-info)
* [A word on parallel requests](#a-word-on-parallel-requests)
* [Inspiration](#inspiration)
* [License](#license)

## Install

Install with `npm i tokens-net`

## Example

You can find a runnable example [here](example/index.js), run via `npm run example`

```javascript
// import { TokensNet } from "tokens-net";
const { TokensNet } = require("tokens-net");

// Secrets
const key = "XXX";
const secret = "XXX";

const tokens = new TokensNet({
  key,
  secret
});

(async () => {
  /*
      The promise only rejects on network errors or timeouts.
      A successfull promise always resolves in an object containing status, headers and body.
      status is the http status code as number, headers is an object of http response headers
      and body is the parsed JSON response body of the api, you dont need to parse the results
      yourself you can simply continue by accessing the object.
  */

  /* PUBLIC */
  const ticker = await tokens.ticker("dtrbtc");
  console.log(ticker.body);

  const tickerHour = await tokens.tickerHour("dtrbtc");
  console.log(tickerHour.body);

  const trades = await tokens.trades("dtrbtc", "hour");
  console.log(trades.body);

  const pairs = await tokens.pairs();
  console.log(pairs.body);

  const orderbook = await tokens.orderBook("dtrbtc");
  console.log(orderbook.body);

  /* PRIVATE */
  const balance = await tokens.balance("btc");
  console.log(balance.body);

  const allOpenOrders = await tokens.openOrdersAll();
  console.log(allOpenOrders.body);

  const openOrders = await tokens.openOrders("dtrbtc");
  console.log(openOrders.body);

  const order = await tokens.getOrder("f227f073-dcd2-4caf-968d-ca6360bf145e");
  console.log(order.body);

  const cancled = await tokens.cancelOrder("f227f073-dcd2-4caf-968d-ca6360bf145e");
  console.log(cancled.body);

  const opened = await tokens.placeOrder(30, 0.00003000, "dtreth", "buy");
  console.log(opened.body);
})();
```

## Debug Info

`DEBUG=tokens-net:* npm start`

## A word on parallel requests

* The client will never generate the same nonce for two requests.
* But a new request must always contain a higher nonce, than the last request before.
* When you make multiple calls in parallel (pretty easy in node..) there is a chance
    that the later calls reach the bitstamp api earlier than the first, causing the first
    requests to fail with an `invalid nonce` error.
* To prevent this you should make these calls sequentially.

## Inspiration
https://github.com/krystianity/node-bitstamp

## License

MIT
