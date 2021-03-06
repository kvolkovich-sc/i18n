import { assert } from 'chai';

import DateConverter from './DateConverter';
import ParseError from './ParseError';

describe('DateConverter', () => {
  it('should convert null to empty string', () => {
    let dc = new DateConverter('MM/dd/yyyy');
    assert.strictEqual(dc.valueToString(null), '');
  });

  it('should convert empty or null or undefined string to null', () => {
    let dc = new DateConverter('MM/dd/yyyy');
    assert.strictEqual(dc.stringToValue(null), null);
    assert.strictEqual(dc.stringToValue(''), null);
    assert.strictEqual(dc.stringToValue(undefined), null);
  });

  it('should convert date to string', () => {
    let dc = new DateConverter('MM/dd/yyyy');

    const date = new Date(2001, 0, 15);
    const dateAsString = dc.valueToString(date);

    assert.equal(dateAsString, '01/15/2001');

    const stringAsDate = dc.stringToValue(dateAsString);
    assert.equal(stringAsDate.toString(), date.toString());

    dc = new DateConverter('dd/MM/yy');
    assert.strictEqual(dc.valueToString(date), '15/01/01');

    assert.throws(() => {
      assert.isNull(dc.stringToValue('aaaa'));
    }, ParseError, 'invalid parsed value [aaaa]');

    assert.throws(() => {
      assert.isNull(dc.stringToValue('11111'));
    }, ParseError, 'invalid parsed value [11111]');
  });

  it('should not throw error if no `format` argument specified', () => {
    assert.doesNotThrow(() => {
      let dc = new DateConverter(); // eslint-disable-line no-unused-vars
    });
  });
});
