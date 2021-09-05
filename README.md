# babel-plugin-transform-options-to-compositions

[![CircleCI](https://circleci.com/gh/Jouryjc/babel-plugin-transform-options-to-compositions/tree/main.svg?style=shield)](https://circleci.com/gh/Jouryjc/babel-plugin-transform-options-to-compositions/tree/main)
[![codecov](https://codecov.io/gh/Jouryjc/babel-plugin-transform-options-to-compositions/branch/main/graph/badge.svg?token=SZ62L3N6PF)](https://codecov.io/gh/Jouryjc/babel-plugin-transform-options-to-compositions)

> 一个从 options api 到 composition api 的插件

### 🧱 安装

```js
// using npm
npm install @babel/plugin-transform-options-to-composition -D

// using yarn
yarn add @babel/plugin-transform-options-to-composition -D
```

### 🌟 使用

#### 📖 配置文件

```json
{
  "plugins": ["@babel/plugin-transform-options-to-composition"]
}
```

#### 🎞️ CLI

```js
babel --plugins @babel/plugin-transform-options-to-composition index.js
```

### 📄 TODOS

1. 处理代码中使用到的 this
2. 补充单元测试
3. provide&project
4. 生命周期函数

### 🔗 参考文档

[Composition API](https://v3.vuejs.org/api/composition-api.html#composition-api)
