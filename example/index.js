import { transformSync } from '@babel/core'
import plugin from '@babel/plugin-transform-options-to-composition'

const code2 = transformSync(
  `
import HelloWorld from './components/HelloWorld.vue'

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
  
}`,
  {
    plugins: [plugin],
  }
).code

console.log(code2)
