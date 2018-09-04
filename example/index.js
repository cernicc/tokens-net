const { TokensNet } = require("../lib/index.js");

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
  // const balance = await tokens.balance("btc");
  // console.log(balance.body);

  // const allOpenOrders = await tokens.openOrdersAll();
  // console.log(allOpenOrders.body);

  // const openOrders = await tokens.openOrders("dtrbtc");
  // console.log(openOrders.body);

  // const order = await tokens.getOrder("f227f073-dcd2-4caf-968d-ca6360bf145e");
  // console.log(order.body);

  // const cancled = await tokens.cancelOrder("f227f073-dcd2-4caf-968d-ca6360bf145e");
  // console.log(cancled.body);

  // const opened = await tokens.placeOrder(30, 0.00003000, "dtreth", "buy");
  // console.log(opened.body);
})();
