import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('props -> defineProps', () => {
  test('defineProps', () => {
    const { code } = transformSync(
      `
      export default {
        props: {
          foo: {
            type: String,
            default: 'foo',
          },
          bar: Number,
        },
      }
    `,
      {
        plugins: [plugin],
      }
    )

    expect(code).toMatchSnapshot('props')
  })
})
