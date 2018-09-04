import * as crypto from 'crypto';
import * as Debug from 'debug';

const debug = Debug('tokens-net:signature');

class Signature {
  private key: string;
  private secret: string;

  private nonceIncr: number;
  private last: number;

  constructor(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
  }

  public signHeaders(headers: object = {}): any {
    if (typeof headers !== 'object') {
      throw new Error('Headers have to be a key/value object.');
    }

    const { signature, nonce } = this._createSignature();
    const args = Object.assign({}, headers, {
      key: this.key,
      signature,
      nonce,
    });

    return this._compactObject(args);
  }

  private _generateNonce(): string {
    const now = Date.now();

    if (now !== this.last) {
      this.nonceIncr = -1;
    }

    this.last = now;
    this.nonceIncr++;

    const padding = this.nonceIncr < 10 ? '000' :
      this.nonceIncr < 100 ? '00' :
      this.nonceIncr < 1000 ?  '0' : '';

    const nonce = now + padding + this.nonceIncr;
    debug('nonce', nonce);

    return nonce;
  }

  /*
      Signature is a HMAC-SHA256 encoded message containing nonce and API key.
      The HMAC-SHA256 code must be generated using a secret key that was generated with your
      API key. This code must be converted to it's hexadecimal representation
      (64 uppercase characters).
  */
  private _createSignature(): { signature: string, nonce: string } {
    const nonce = this._generateNonce();
    const message = nonce + this.key;
    const signer = crypto.createHmac('sha256', Buffer.from(this.secret, 'utf8'));
    const signature = signer.update(message).digest('hex').toUpperCase();
    return { signature, nonce };
  }

  private _compactObject(object: any = {}): any {
    const clone = Object.assign({}, object);
    Object.keys(object).forEach((key) => {
      if (typeof object[key] === 'undefined' || object[key] === null) {
        delete clone[key];
      }
    });

    return clone;
  }
}

export {
  Signature,
};
