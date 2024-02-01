/* eslint-disable import/no-extraneous-dependencies */
import { AxiosResponse } from 'axios'
import { isBoolean, isNumber } from 'lodash'
import jsonPath from 'jsonpath'
import web3 from 'web3'

/**
 * Collection of helper functions for asserting on RPC responses
 * Complex asserts to still be done in expect statements
 */
export default class RpcAssert {
  response: AxiosResponse | any

  constructor(response?: AxiosResponse | any) {
    this.response = response
  }

  /**
   * Create a new instance
   */
  public static setResponse(response: AxiosResponse): RpcAssert {
    return new RpcAssert(response)
  }

  // Indirection needed to support websocket rcp response
  private responseData() {
    if (this.response.data) return this.response.data
    return this.response
  }

  // Indirection needed to support websocket rcp response
  private responseResult() {
    if (this.response.data && this.response.data.result !== undefined) return this.response.data.result
    return this.response.result
  }

  /**
   * Asserts the response is valid RPC (non error) response
   */
  public assertValidRPC(message?: string): RpcAssert {
    if (this.response.status) expect(this.response.status, message).toBe(200)
    if (this.responseData() instanceof Array) {
      expect(this.responseData()[0], message).toHaveProperty('id')
      expect(this.responseData()[0], message).toHaveProperty('jsonrpc')
      expect(this.responseData()[0], message).toHaveProperty('result')
      expect(this.responseData()[0], message).not.toHaveProperty('error')
    } else {
      expect(this.responseData(), message).toHaveProperty('jsonrpc')
      expect(this.responseData(), message).toHaveProperty('id')
      expect(this.responseData(), message).toHaveProperty('result')
      expect(this.responseData(), message).not.toHaveProperty('error')
    }
    return this
  }

  /**
   * Asserts the response has a specific error code
   */
  public assertRPCErrorCode(errorCode: number): RpcAssert {
    expect(this.response.status).toBe(errorCode)
    return this
  }

  /**
   * Assert that response is an error RPC response
   */
  public assertErrorRPC(): RpcAssert {
    expect(this.responseData()).toHaveProperty('jsonrpc')
    expect(this.responseData()).toHaveProperty('error')
    return this
  }

  /**
   * Asserts that the error message contains expected string
   * @param expected Expected error message
   */
  public assertErrorMessageContains(expected: string): RpcAssert {
    expect(this.response.data.error.message).toContain(expected)
    return this
  }

  /**
   * Asserts the response has specified json property
   * @param name Property name
   */
  public assertHasProperty(name: string): RpcAssert {
    expect(this.responseData()).toHaveProperty(name)
    return this
  }

  /**
   * Asserts that the RPC result is a number >= 0
   */
  public assertResultIsANumber(): RpcAssert {
    const result = parseInt(this.responseResult(), 16)
    expect(result).toBeGreaterThanOrEqual(0)
    return this
  }

  /**
   * Asserts that the RPC result is an array
   */
  public assertResultIsAnArray(): RpcAssert {
    const { result } = this.responseData()
    expect(Array.isArray(result)).toBe(true)
    return this
  }

  /**
   * Asserts that the RPC result is equal to expected
   * Note expected can be a number, string, boolean
   * @param expected Expected value
   */
  public assertResultIsEqualTo(expected: any): RpcAssert {
    if (isNumber(expected)) {
      const actual = parseInt(this.responseResult(), 16)
      expect(actual).toBe(expected)
    } else if (isBoolean(expected)) {
      const actual = this.responseResult()
      expect(actual).toBe(expected)
    } else {
      expect(this.responseResult()).toBe(expected)
    }
    return this
  }

  /**
   * Asserts the RPC result array has length greater than expected
   * @param expected Expected minimum result length
   */
  public assertResultArrayLengthGreaterThan(expected: number): RpcAssert {
    const { result } = this.responseData()
    expect(result.length).toBeGreaterThan(expected)
    return this
  }

  /**
   * Asserts the RPC result array has length greater than or equal to expected
   * @param expected Expected minimum result length
   */
  public assertResultArrayLengthGreaterThanOrEqual(expected: number): RpcAssert {
    const { result } = this.responseData()
    expect(result.length).toBeGreaterThanOrEqual(expected)
    return this
  }

  /**
   * Asserts the RPC result array has exact length
   * @param expected Expected exact length
   */
  public assertResultArrayLength(expected: number): RpcAssert {
    const { result } = this.responseData()
    expect(result.length).toBe(expected)
    return this
  }

  /**
   * Asserts the RPC result contains a specified string
   * @param expected Expected string to be contained
   */
  public assertResultContains(expected: string): RpcAssert {
    const json = JSON.stringify(this.responseData())
    expect(json).toContain(expected)
    return this
  }

  /**
   * Assert that RPC result is of specified type
   * @param expectedType Expected type (e.g. 'string', 'boolean')
   */
  public assertTypeOfResult(expectedType: string): RpcAssert {
    const type = typeof this.responseResult()
    expect(type).toBe(expectedType)
    return this
  }

  /**
   * Asserts that the RPC result number, is greated than expected
   * Note: result is assumed to be an number
   * @param expected Expected minimum value
   */
  public assertResultGreaterThan(expected: number): RpcAssert {
    const result = parseInt(this.responseResult(), 16)
    expect(result).toBeGreaterThan(expected)
    return this
  }

  /**
   * Assert that the RPC result number is greater than or equal to expected
   * Note: result is assumed to be an number
   * @param expected Expected number
   */
  public assertResultGreaterThanOrEqual(expected: number): RpcAssert {
    const result = parseInt(this.responseResult(), 16)
    expect(result).toBeGreaterThanOrEqual(expected)
    return this
  }

  /**
   * Asserts that the RPC result arrays first element is equal to the value specified
   * @param expected The value expected
   * @param property Optional property on the first element to get as actual value
   */
  public assertResultArrayFirstElementEqualTo(expected: string, property?: string): RpcAssert {
    let actual: any
    if (property === undefined) {
      // eslint-disable-next-line prefer-destructuring
      actual = this.responseResult()[0]
    } else {
      actual = this.responseResult()[0][property]
    }
    expect(actual.toLowerCase()).toEqual(expected.toLowerCase())
    return this
  }

  /**
   * Asserts the entire response data is equal to specified object
   * @param expected Expected json response object
   */
  public assertJsonEqualTo(expected: object): RpcAssert {
    expect(this.responseData()).toEqual(expected)
    return this
  }

  /**
   * Asserts that RPC result object property has expected value
   * @param expected Expected value of property
   * @param property Name of property
   */
  public assertResultPropertyEqualTo(expected: string, property: string): RpcAssert {
    expect(this.responseResult()[property]?.toLowerCase()).toBe(expected?.toLowerCase())
    return this
  }

  /**
   * Asserts that Json path returns exactly one value with expected value
   * @param path Json path, should return one value
   * @param expected Expected value
   */
  public assertJsonPathEqualTo(path: string, expected: any): RpcAssert {
    const actual = jsonPath.query(this.responseData(), path)[0]
    expect(actual.toLowerCase()).toBe(expected.toLowerCase())
    return this
  }

  /**
   * Asserts that Json path return contains an expected value
   * @param path Json path, should return one value
   * @param expected Expected value
   */
  public assertJsonPathContains(path: string, expected: any): RpcAssert {
    const actual = jsonPath.query(this.responseData(), path)[0]
    expect(actual).toContain(expected)
    return this
  }

  /**
   * Asserts that Json path number of items returned is expected
   * @param path Json path returning multiple items
   * @param expectedCount Expect number of items
   * @returns
   */
  public assertJsonPathCount(path: string, expectedCount: any): RpcAssert {
    const actual = jsonPath.query(this.responseData(), path)
    expect(actual.length).toBe(expectedCount)
    return this
  }

  /**
   * Asserts that the number of elements found by json path is > 0
   * @param path Json path
   */
  public assertJsonPathExists(path: string): RpcAssert {
    const elements = jsonPath.query(this.responseData(), path)
    expect(elements.length).toBeGreaterThan(0)
    return this
  }

  /**
   * Asserts first value returned from json path is hex value
   * @param path Json path
   */
  public assertJsonPathValueIsHex(path: string): RpcAssert {
    const elements = jsonPath.query(this.responseData(), path)
    expect(web3.utils.isHex(elements[0])).toBe(true)
    return this
  }

  /**
   * Asserts that RPC result is a non empty string
   */
  public assertResultNonEmptyString(): RpcAssert {
    expect(typeof this.responseResult()).toBe('string')
    expect(this.responseResult().length).toBeGreaterThan(0)
    return this
  }

  /**
   * Asserts that the RPC result is null
   */
  public assertResultIsNull(): RpcAssert {
    expect(this.responseResult()).toBeNull()
    return this
  }

  /**
   * Asserts that the RPC result is not null
   */
  public assertResultIsNotNull(): RpcAssert {
    expect(this.responseResult()).not.toBeNull()
    return this
  }
}
