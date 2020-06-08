import { expect } from 'chai'
import sanitizeQueryValues from './index'

// params with forbidden characters: & < > " ' /
const params = {
  ampersand: 'calvin&hobbes',
  quotesAndDoubleQuotes: `"HR sent me a 'gentle' reminder"`,
  forwardSlash: 'stylist/emails',
  tags:
    '<%2fscript><script>alert(String.fromCharCode(81,67,12 1,98,101,114,95,88,83,83))<%2fscript>eeno3'
}

// the same params after sanitizing
const expectedParams = {
  ampersand: 'calvin&amp;hobbes',
  quotesAndDoubleQuotes: `&quot;HR sent me a &#x27;gentle&#x27; reminder&quot;`,
  forwardSlash: 'stylist&#x2F;emails',
  // this one is an actual attack
  tags:
    '&lt;%2fscript&gt;&lt;script&gt;alert(String.fromCharCode(81,67,12 1,98,101,114,95,88,83,83))&lt;%2fscript&gt;eeno3'
}

describe('Sanitize Query Params', () => {
  it('should return an empty object when no queries are present', () => {
    const sanitizedParams = sanitizeQueryValues({})
    expect(sanitizedParams).to.be.empty
  })

  it('should return the same query param keys passed in', () => {
    const sanitizedParams = sanitizeQueryValues(params)
    expect(sanitizedParams).to.have.key(Object.keys(params))
  })

  it('should replace dangerous characters with their escaped counterparts', () => {
    const sanitizedParams = sanitizeQueryValues(params)
    for (let key in sanitizedParams) {
      expect(sanitizedParams[key]).to.equal(expectedParams[key])
    }
  })
})
