import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('watch -> watch', () => {
  test('watch', () => {
    const { code } = transformSync(
      `
      export default {
        watch: {
          name: {
            deep: true,
            handler (cur, prev) {
              console.log(cur, prev)
            }
          }
        },
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

    expect(code).toMatchSnapshot('watch')
  })
})
