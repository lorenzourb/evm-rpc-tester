/**
 * @param fn function that examines if condition is met (must return boolean)
 * @param timeout
 * @param delay
 * @param condition texttual description of the condition
 */
export default async function wait(
  // eslint-disable-next-line no-unused-vars
  fn: (...args) => Promise<boolean>,
  timeout = 30000,
  delay = 200,
  condition = ''
): Promise<any> {
  const startTime = Number(new Date())
  const endTime: number = startTime + timeout

  const test = (resolve, reject) => {
    const result: Promise<boolean> = fn()

    result
      .then((res) => {
        if (res) {
          // eslint-disable-next-line no-console
          // console.log(
          //   `SUCCESS: condition met after ${Number(new Date()) - startTime} ms! ${condition}`,
          // )
          resolve(res)
        } else if (Number(new Date()) < endTime) setTimeout(test, delay, resolve, reject)
        else {
          reject(
            new Error(
              `Wait: timed out after ${timeout}. Failed to validate: ${
                condition || 'condition description not provided'
              }`
            )
          )
        }
      })
      .catch((err) => {
        if (Number(new Date()) < endTime) setTimeout(test, delay, resolve, reject)
        else {
          reject(
            new Error(
              `Wait: timed out after ${timeout}. Failed to validate ${
                condition || 'condition description not provided'
              }\nError: ${err}`
            )
          )
        }
      })
  }

  return new Promise(test)
}

const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND

// minutes wait (use this for timeouts on test level)
export const WAIT_TIMEOUT_30_MIN: number = 30 * ONE_MINUTE
export const WAIT_TIMEOUT_10_MIN: number = 10 * ONE_MINUTE

// seconds waits (timeouts)
export const WAIT_TIMEOUT_240_SEC: number = 240 * ONE_SECOND
export const WAIT_TIMEOUT_180_SEC: number = 180 * ONE_SECOND
export const WAIT_TIMEOUT_150_SEC: number = 150 * ONE_SECOND
export const WAIT_TIMEOUT_120_SEC: number = 120 * ONE_SECOND
export const WAIT_TIMEOUT_90_SEC: number = 90 * ONE_SECOND
export const WAIT_TIMEOUT_60_SEC: number = 60 * ONE_SECOND
export const WAIT_TIMEOUT_45_SEC: number = 45 * ONE_SECOND
export const WAIT_TIMEOUT_30_SEC: number = 30 * ONE_SECOND
export const WAIT_TIMEOUT_20_SEC: number = 20 * ONE_SECOND
export const WAIT_TIMEOUT_15_SEC: number = 15 * ONE_SECOND
// DO NOT USE FOR UI TEST AS PAGE LOADING MIGHT BE LONGER!
export const WAIT_TIMEOUT_10_SEC: number = 10 * ONE_SECOND
export const WAIT_TIMEOUT_5_SEC: number = 5 * ONE_SECOND
export const WAIT_TIMEOUT_3_SEC: number = 3 * ONE_SECOND
export const WAIT_TIMEOUT_1_SEC: number = 1 * ONE_SECOND

// milliseconds waits
export const WAIT_DELAY_500_MSEC = 500
export const WAIT_DELAY_200_MSEC = 200
export const WAIT_DELAY_100_MSEC = 100

// propagation delay
export const WAIT_TIMEOUT_PROPAGATION_DELAY = WAIT_TIMEOUT_240_SEC
export const WAIT_DELAY_PROPAGATION_DELAY = WAIT_TIMEOUT_3_SEC
