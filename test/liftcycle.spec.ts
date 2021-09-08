import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('lifecycle', () => {
  test('lifecycle', () => {
    const { code } = transformSync(
      `
      export default {
        beforeUnmount () {
          console.log('before unmount!')
        }
      }
    `,
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
            },
          ],
        ],
        plugins: [plugin],
      }
    )

    expect(code).toMatchSnapshot('beforeUnmount')
  })
})
