import * as request from 'request';
import * as querystring from 'querystring';
import * as Debug from 'debug';

const debug = Debug('tokens-net:client');

import { Signature } from './signature';

enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
}

interface ResponseObject {
  status: number;
  headers: any;
  body: any;
}

class TokensNet {
  private base: string;

  private signature: Signature;

  constructor(opts = {}, base = 'https://api.tokens.net') {
    this.base = base;

    const {
      key,
      secret,
    }: any = opts;

    this.signature = new Signature(key, secret);
  }

  public call(endpoint: string, method: string = 'GET', body: any = null, sign: boolean = false): Promise<ResponseObject> {
    return new Promise((resolve, reject) => {
      const options = this._getOptions(endpoint, body, method, sign);
      request(options, (error: any, response: any, body: any) => {

        // The HTTP request did not succeed.
        // e.g. ESOCKETTIMEDOUT
        if (error) {
          return reject(error);
        }

        // The HTTP request worked but returned an error code.
        // e.g. 401 unauthorized
        if (response.statusCode < 200 || response.statusCode > 299) {
          if (!body) {
            return reject(new Error('No body can be provided.'));
          }

          return reject(new Error('With body: ' + body));
        }

        debug('result', options.url, response.statusCode);
        try {
          body = JSON.parse(body);
        } catch (error) {
          return reject(error);
        }

        // There was an API request error.
        // e.g. Insufficient funds in case of withdrawal.
        if (body.status === 'error') {
          return reject(new Error(body.reason));
        }

        // Typically this happens when the request's statuscode
        // is not 2xx but we check here just in case.
        if (body.error) {
          return reject(new Error(body.error));
        }

        resolve({
          status: response.statusCode,
          headers: response.headers,
          body,
        });
      });
    });
  }

  public ticker(pair: string): Promise<ResponseObject> {
    const ep = `public/ticker`;
    return this.call(this._resolveEP(ep, pair), HTTP_METHOD.GET, null, false);
  }

  public tickerHour(pair: string): Promise<ResponseObject> {
    const ep = `public/ticker/hour`;
    return this.call(this._resolveEP(ep, pair), HTTP_METHOD.GET, null, false);
  }

  public trades(pair: string, time: 'minute' | 'hour' | 'day' = 'hour'): Promise<ResponseObject> {
    const ep = `public/trades/${time}`;
    return this.call(this._resolveEP(ep, pair), HTTP_METHOD.GET, null, false);
  }

  public pairs(): Promise<ResponseObject> {
    const ep = `public/trading-pairs/get/all`;
    return this.call(this._resolveEP(ep), HTTP_METHOD.GET, null, false);
  }

  public orderBook(pair: string): Promise<ResponseObject> {
    const ep = `public/order-book`;
    return this.call(this._resolveEP(ep, pair), HTTP_METHOD.GET, null, false);
  }

  public balance(currency: string): Promise<ResponseObject> {
    const ep = `private/balance`;
    return this.call(this._resolveEP(ep, currency), HTTP_METHOD.GET, {}, true);
  }

  public openOrdersAll(): Promise<ResponseObject> {
    const ep = `private/orders/get/all`;
    return this.call(this._resolveEP(ep), HTTP_METHOD.GET, {}, true);
  }

  public openOrders(pair: string): Promise<ResponseObject> {
    const ep = `private/orders/get`;
    return this.call(this._resolveEP(ep, pair), HTTP_METHOD.GET, {}, true);
  }

  public getOrder(uuid: string): Promise<ResponseObject> {
    const ep = `private/orders/get`;
    return this.call(this._resolveEP(ep, uuid), HTTP_METHOD.GET, {}, true);
  }

  public cancelOrder(uuid: string): Promise<ResponseObject> {
    const ep = 'private/orders/cancel';
    return this.call(this._resolveEP(ep, uuid), HTTP_METHOD.POST, {}, true);
  }

  public placeOrder(amount: number, price: number, pair: string, side: 'buy' | 'sell', takeProfit?: number, expireDate?: number): Promise<ResponseObject> {
    const ep = 'private/orders/add/limit';
    const body = {
      side,
      amount,
      price,
      tradingPair: pair,
      takeProfit,
      expireDate,
    };
    return this.call(this._resolveEP(ep), HTTP_METHOD.POST, body, true);
  }

  private _getUrl(endpoint = ''): string {
    return `${this.base}/${endpoint}`;
  }

  private _getOptions(endpoint: string = '', body: any = null, method: string = 'GET', sign: boolean = false): any {
    let headers = {
      'Content-type': 'application/x-www-form-urlencoded',
    };

    if (sign) {
      headers = this.signature.signHeaders(headers);
    }

    if (body) {
      body = querystring.stringify(body);
    }

    const options: any = {
      method,
      url: this._getUrl(endpoint),
      headers,
      body,
    };

    debug('calling', options.url, '..');

    return options;
  }

  private _resolveEP(endpoint: string, data?: string): string {
    if (!data) {
      return `${endpoint}/`;
    } else {
      return `${endpoint}/${data}/`;
    }
  }
}

export {
    TokensNet,
};
