import { declare } from '@babel/helper-plugin-utils'

export default declare((api) => {
  api.assertVersion(7)
  const { types, template } = api

  const bodyContent = []
  const importIdentifierMap = {}

  // 用于缓存当前属性是挂在哪个父级之上（props、data、computed、watch、methods）
  const thisExpressionMap = {}

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

    const returnStatement = property.value.body.body.filter((node) =>
      types.isReturnStatement(node)
    )
    reactiveDataAST.declarations[0].init.arguments.push(
      returnStatement[0].argument
    )

    return reactiveDataAST

    // TODO data 中 return 之前的逻辑未处理
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
          watcherAST.expression.arguments.push(
            types.objectExpression([
              types.objectProperty(
                types.identifier('deep'),
                types.booleanLiteral(true)
              ),
            ])
          )
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

  function hasImportIndentifier(item) {
    return ['props', 'data', 'computed', 'watch', 'beforeUnmount'].includes(
      item
    )
  }

  function genImportDeclaration(map) {
    const importSpecifiers = []
    const importMap = {
      props: 'defineProps',
      data: 'reactive',
      computed: 'computed',
      watch: 'watch',
      beforeUnmount: 'onBeforeUnmount',
    }

    Object.keys(map).forEach((item) => {
      const importIdentifier = hasImportIndentifier(item) ? importMap[item] : ''

      if (importIdentifier) {
        importSpecifiers.push(importIdentifier)
      }
    })
    return template.ast(`import {${importSpecifiers.join(',')}} from 'vue'`)
  }

  return {
    name: 'transform-options-to-composition',

    visitor: {
      ObjectProperty: {
        enter(path) {
          const keyName = path.node.key.name
          if (['props', 'computed', 'methods'].includes(keyName)) {
            path.node.value.properties.map((property) => {
              thisExpressionMap[property.key.name] = keyName
            })
          }

          if (keyName === 'data') {
            const returnStatement = path.node.value.body.body.filter((node) =>
              types.isReturnStatement(node)
            )
            returnStatement[0].argument.properties.map((property) => {
              thisExpressionMap[property.key.name] = 'state'
            })
          }
        },
      },
      Program: {
        exit(path) {
          path.traverse({
            ThisExpression(p) {
              const propertyName = p.parent.property.name
              if (thisExpressionMap[propertyName]) {
                p.parent.object = types.identifier(
                  thisExpressionMap[propertyName]
                )
              }
            },
          })

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
            const keyName = property.key.name
            let newNode = GEN_MAP?.[keyName]?.(property)

            if (newNode) {
              importIdentifierMap[keyName] = true

              Array.isArray(newNode)
                ? bodyContent.push(...newNode)
                : bodyContent.push(newNode)
            }
          })

          // 根据引入了哪些函数，去生成 import 声明语句
          bodyContent.unshift(genImportDeclaration(importIdentifierMap))

          path.node.body = bodyContent
        },
      },
    },
  }
})
