import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('computed -> computed', () => {
  test('computed', () => {
    const { code } = transformSync(
      `
      export default {
        computed: {
          name () {
            return this.firstName + this.lastName
          },
      
          secondName: {
            get () {
              return this.lastName + this.firstName
            }
          } 
        },
      }
    `,
      {
        plugins: [plugin],
      }
    )

    expect(code).toMatchSnapshot('computed')
  })
})
