import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('methods', () => {
  test('methods', () => {
    const { code } = transformSync(
      `
      export default {
        methods: {
          sayHello (aa) {
            console.log('say Hi')
            return aa
          }
        },
      }
    `,
      {
        plugins: [plugin],
      }
    )

    expect(code).toMatchSnapshot('methods')
  })
})
