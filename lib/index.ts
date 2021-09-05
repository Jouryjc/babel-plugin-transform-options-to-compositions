import { declare } from '@babel/helper-plugin-utils'

export default declare((api) => {
  api.assertVersion(7)
  const { types, template } = api
  const bodyContent = []

  const propertyMap = {
    props: {},
    state: {},
  }

  function genDefineProps(property) {
    return types.variableDeclaration('const', [
      types.variableDeclarator(
        types.identifier('props'),
        types.callExpression(types.identifier('defineProps'), [property.value])
      ),
    ])
  }

  function genReactiveData(property) {
    const reactiveDataAST = template.ast(`const state = reactive();`)

    reactiveDataAST.declarations[0].init.arguments.push(
      property.value.body.body[0].argument
    )

    return reactiveDataAST
  }

  function genComputed(property) {
    const properties = property.value.properties
    const computedArr = []

    properties.forEach((item) => {
      const fnName = item.key.name

      let computedAST = null

      if (types.isObjectMethod(item)) {
        computedAST = template.ast(`const ${fnName} = computed(() => {})`)
        computedAST.declarations[0].init.arguments[0].body = item.value.body
      } else if (types.isObjectProperty(item)) {
        computedAST = template.ast(`const ${fnName} = computed()`)
        computedAST.declarations[0].init.arguments.push(item.value)
      }

      computedArr.push(computedAST)
    })

    return computedArr
  }

  function genWatcher(property) {
    const properties = property.value.properties
    const watcherArr = []

    properties.forEach((item) => {
      const fnName = item.key.name

      let watcherAST = null
      watcherAST = template.ast(`watch('${fnName}', () => {})`)

      // {deep: true, handler (new, old) {}, immediate: true}
      if (types.isObjectExpression(item?.value)) {
        const params = item.value.properties

        const methodObject = params.filter((param) =>
          types.isFunctionExpression(param.value)
        )
        watcherAST.expression.arguments[1].params = methodObject[0].value.params
        watcherAST.expression.arguments[1].body = methodObject[0].value.body

        const isDeep = params.filter((param) => param.key.name === 'deep')
        if (isDeep?.length) {
          watcherAST.expression.arguments.push(template.ast(`{deep: true}`))
        }
      } else {
        // 判断watcher是个函数

        watcherAST.expression.arguments[1].params = item.value.params
        watcherAST.expression.arguments[1].body = item.value.body
      }

      watcherArr.push(watcherAST)
    })

    return watcherArr
  }

  function genMethods(property) {
    const properties = property.value.properties
    const methodArr = []

    properties.forEach((item) => {
      const fnName = item.key.name

      let ast = null

      if (types.isObjectProperty(item)) {
        ast = template.ast(`const ${fnName} = () => {}`)
        ast.declarations[0].init.params = item.value.params
        ast.declarations[0].init.body = item.value.body
      }

      methodArr.push(ast)
    })

    return methodArr
  }

  function genBeforeUnmount(property) {
    const fnName = property.key.name
    let unmountAST = null

    unmountAST = template.ast(
      `on${fnName.replace(/^[a-z]/, (match) => match.toUpperCase())}(() => {})`
    )
    unmountAST.expression.arguments[0].body = property.value.body

    return unmountAST
  }

  return {
    name: 'transform-options-to-composition',

    visitor: {
      // ObjectProperty (path) {
      //     console.log(path)
      // },
      // ThisExpression: {
      //     enter (path) {
      //         const computed = path.findParent(path => {
      //             return path.isObjectProperty() && path.node?.key?.name === 'computed'
      //         })
      //     }
      // },
      Program: {
        exit(path) {
          const exportDefaultDeclaration = path.node.body.filter((item) =>
            types.isExportDefaultDeclaration(item)
          )
          const properties = exportDefaultDeclaration[0].declaration.properties

          // key 是 options api 中的配置项
          const GEN_MAP = {
            props: genDefineProps,
            data: genReactiveData,
            computed: genComputed,
            watch: genWatcher,
            methods: genMethods,
            beforeUnmount: genBeforeUnmount,
          }

          properties.forEach((property) => {
            let newNode = GEN_MAP?.[property.key.name]?.(property)

            if (newNode) {
              Array.isArray(newNode)
                ? bodyContent.push(...newNode)
                : bodyContent.push(newNode)
            }
          })

          path.node.body = bodyContent
        },
      },
    },
  }
})
