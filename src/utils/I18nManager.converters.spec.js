import { assert } from 'chai';
import I18nManager from './I18nManager';
import { DEFAULT_FORMAT_INFO } from './constants';

describe('I18nManager: converters', () => {
  let i18n;

  before('instantiate new intl manager', () => {
    const localeFormattingInfo = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
      },
    };

    i18n = new I18nManager({ locale: 'en-US', localeFormattingInfo }).register(
      'first component',
      {
        'en-US': {
          test: 'test',
          subcomponent: {
            hint: 'nested hint',
          }
        }
      }
    ).register(
      'second component',
      {
        'en-US': {
          component: {
            test: 'test component',
            format: 'min={min}, max={max}',
            subcomponent: {
              label: 'nested'
            }
          },
        },
      }
    );
  });

  it('should format and parse date', () => {
    const date = new Date(2001, 0, 10);
    const dateAsString = i18n.formatDate(date);
    assert.equal('10/01/2001', dateAsString);

    const dateAsObject = i18n.parseDate(dateAsString);
    assert.equal(date.toString(), dateAsObject.toString());
  });

  it('should format and parse date and time', () => {
    const date = new Date(2001, 0, 10);
    const dateTimeAsString = i18n.formatDateTime(date);
    assert.equal('10/01/2001 00:00:00', dateTimeAsString);
  });

  it('should format and parse numbers', () => {
    assert.equal('10,000', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000'));

    assert.equal('10,000.00', i18n.formatDecimalNumber(10000));
    assert.equal(10000, i18n.parseDecimalNumber('10,000.00'));

    assert.strictEqual(i18n.formatDecimalNumber(123456789.12), '123,456,789.12');
    assert.strictEqual(i18n.formatDecimalNumber(55454545.12), '55,454,545.12');
  });

  it('should format and parse numbers with numberDecimalSeparatorUseAlways=true (1)', () => {
    const localeFormattingInfo = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
        numberDecimalSeparatorUseAlways: true
      },
    };

    i18n = new I18nManager({ locale: 'en-US', localeFormattingInfo }).register(
      'first component',
      {
        'en-US': {
          test: 'test',
          subcomponent: {
            hint: 'nested hint',
          }
        }
      }
    ).register(
      'second component',
      {
        'en-US': {
          component: {
            test: 'test component',
            format: 'min={min}, max={max}',
            subcomponent: {
              label: 'nested'
            }
          },
        },
      }
    );

    assert.equal('10,000.', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000'));
  });

  it('should format and parse numbers with numberDecimalSeparatorUseAlways=true (2)', () => {
    const formatInfos = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0.00',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
        numberDecimalSeparatorUseAlways: true
      },
    };
    let i18n = new I18nManager('en-US', [{
      locales: ['en-US'],
      messages: {
        test: 'test',
        subcomponent: {
          hint: 'nested hint'
        }
      },
    }], formatInfos);
    i18n = i18n.register('component', [{
      locales: ['en-US'],
      messages: {
        component: {
          test: 'test component',
          format: 'min={min}, max={max}',
          subcomponent: {
            label: 'nested'
          }
        },
      },
    }]);

    assert.equal('10,000.00', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000.00'));
  });

  it('dateFormat returns configured date format', () => {
    const i18n = new I18nManager({
      locale: 'es',
      localeFormattingInfo: {
        'es': {
          datePattern: 'YY',
          dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
          integerPattern: '#,##0',
          numberPattern: '#,##0.00#######',
          numberDecimalSeparator: '.',
          numberGroupingSeparator: ',',
          numberGroupingSeparatorUse: true,
        }
      }
    });
    // configured date pattern
    assert.strictEqual(i18n.dateFormat, 'YY');
  });

  it('"dateFormat" returns default date format', () => {
    const i18n = new I18nManager({ locale: 'en' });
    // default date pattern
    assert.strictEqual(i18n.dateFormat, DEFAULT_FORMAT_INFO.datePattern);
  });

  it('"_findFormattingInfo" uses locale fallbak logic', () => {
    // no format for the 'fe-FR' -> fallback to default formats
    let i18n = new I18nManager(
      {
        locale: 'fr-FR',
        localeFormattingInfo: {}
      }
    );
    assert.strictEqual(i18n._findFormattingInfo(), DEFAULT_FORMAT_INFO);

    // no format for the 'fr-FR', but there is a format for fallbackLocale, e.g. 'de'
    const deFormattingInfo = {
      datePattern: 'YYYY'
    };
    i18n = new I18nManager(
      {
        locale: 'fr-FR',
        fallbackLocale: 'de',
        localeFormattingInfo: {
          'de': deFormattingInfo
        }
      }
    );
    assert.strictEqual(i18n._findFormattingInfo(), deFormattingInfo);

    // no format for the 'fr-FR', but there is a format for 'fr' locale
    const frFormattingInfo = {
      datePattern: 'DD'
    };
    i18n = new I18nManager(
      {
        locale: 'fr-FR',
        fallbackLocale: 'de',
        localeFormattingInfo: {
          'fr': frFormattingInfo,
          'de': deFormattingInfo
        }
      }
    );
    assert.strictEqual(i18n._findFormattingInfo(), frFormattingInfo);

    // no format for the 'fr-FR' and there is a format for 'fr-FR' locale
    const frFrFormattingInfo = {
      datePattern: 'MM'
    };
    i18n = new I18nManager(
      {
        locale: 'fr-FR',
        fallbackLocale: 'de',
        localeFormattingInfo: {
          'fr-FR': frFrFormattingInfo,
          'fr': frFormattingInfo,
          'de': deFormattingInfo
        }
      }
    );
    assert.strictEqual(i18n._findFormattingInfo(), frFrFormattingInfo);
  });
});
