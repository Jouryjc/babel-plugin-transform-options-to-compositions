import plugin from '../lib/index'
import { transformSync } from '@babel/core'

describe('lifecycle', () => {
  test('lifecycle', () => {
    const { code } = transformSync(
      `
      export default {
        name: 'App',
      
        components: {
          HelloWorld
        },
      
        props: {
          firstName: {
            type: String,
            default: 'Jour'
          }
        },
      
        data () {
          const a = 1;
          return {
            lastName: 'Tom'
          }
        },
      
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
      
        watch: {
          name: {
            deep: true,
            handler (cur, prev) {
              console.log(cur, prev)
            }
          }
        },
      
        methods: {
          sayHello (aa) {
            console.log('say Hi')
            return aa
          }
        },
      
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

    expect(code).toMatchSnapshot('all')
  })
})
