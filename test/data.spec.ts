import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('data -> reactive', () => {
  test('data -> reactive', () => {
    const { code } = transformSync(
      `
      export default {
        data () {
          return {
            lastName: 'Tom'
          }
        }
      }
    `,
      {
        plugins: [plugin],
      }
    )

    expect(code).toMatchSnapshot('data')
  })
})
