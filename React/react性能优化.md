# React性能优化
React 组件性能优化的核心是减少渲染真实 DOM 节点的频率，减少 Virtual DOM 比对的频率。

## 组件卸载前进行清理操作
在组件中为 window 注册的全局事件, 以及定时器, 在组件卸载前要清理掉, 防止组件卸载后继续执行影响应用性能.

```tsx
const App = () => {
  useEffect(() => {
    let timer = setInterval(() => {
      // ...
    }, 1000);

    return () => clearInterval(timer);    // 清理！
  }, [])
  return (
    <button onClick={
      () => ReactDOM.unmountComponentAtNode(document.getElementById("root"))
    }>
      unmount!!
    </button>
  )
}
```

## PureComponent纯组件
**什么是纯组件**
纯组件会对组件输入数据进行浅层比较，如果当前输入数据和上次输入数据相同，组件不会重新渲染。

**什么是浅层比较**
比较引用数据类型在内存中的引用地址是否相同，比较基本数据类型的值是否相同。

**如何实现纯组件**
类组件继承 PureComponent 类，函数组件使用 memo 方法

**为什么不直接进行 diff 操作, 而是要先进行浅层比较，浅层比较难道没有性能消耗吗？**
和进行 diff 比较操作相比，浅层比较将消耗更少的性能。diff 操作会重新遍历整颗 virtualDOM 树, 而浅层比较只操作当前组件的 state 和 props。

```tsx
// 类组件
class PureChildComponent extends React.PureComponent {
  render() {
    return (<div>{ this.props.name }</div>);
  }
}

// 函数组件
const ChildComponent = ({ name }) => (<div>{ this.props.name }</div>);
const PureChildComponent = React.memo(ChildComponent);
```

### 自定义比较逻辑
纯组件只能进行浅层比较，要进行更复杂的对比逻辑来决定是否重新渲染，可以用shouldComponentUpdate（类组件）或者给memo传第二个参数（函数组件）。

```tsx
// 类组件
class App extends React.Component {
  // ...

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.name !== nextState.name);
  }

  render() {}
}

// 函数组件
const ShowPersonMemo = memo(ShowPerson, comparePerson)

function comparePerson(prevProps, nextProps) {
  // 这里是跟类组件相反的，返回true就不重新渲染
  return (prevProps.name === nextProps.name);
}
```


## 组件懒加载
使用组件懒加载可以减少 bundle 文件大小, 加快组件呈递速度.

### 路由组件懒加载
```tsx
import React, { lazy, Suspense } from "react"
import { BrowserRouter, Link, Route, Switch } from "react-router-dom"

const Home = lazy(() => import(/* webpackChunkName: "Home" */ "./Home"))
const List = lazy(() => import(/* webpackChunkName: "List" */ "./List"))

const App = () => (
  <BrowserRouter>
    <Link to="/">Home</Link>
    <Link to="/list">List</Link>

    <Switch>
      <Suspense fallback={ <div>Loading</div> }>
        <Route path="/" component={ Home } exact />
        <Route path="/list" component={ List } />
      </Suspense>
    </Switch>
  </BrowserRouter>
);
```

### 根据条件进行组件懒加载
适用于组件不会随条件频繁切换的情况

```tsx
const App = () => {
  let LazyComponent = null
  if (xxx) {
    LazyComponent = lazy(() => import(/* webpackChunkName: "Home" */ "./Home"))
  } else {
    LazyComponent = lazy(() => import(/* webpackChunkName: "List" */ "./List"))
  }
  return (
    <Suspense fallback={ <div>Loading</div> }>
      <LazyComponent />
    </Suspense>
  )
}

export default App
```

## 使用 Fragment 避免额外标记
React 组件中返回的 jsx 如果有多个同级元素, 多个同级元素必须要有一个共同的父级.

为了满足这个条件我们通常都会在最外层添加一个div, 但是这样的话就会多出一个无意义的标记, 如果每个组件都多出这样的一个无意义标记的话, 浏览器渲染引擎的负担就会加剧. 

为了解决这个问题, React 推出了 fragment 占位符标记. 使用占位符标记既满足了拥有共同父级的要求又不会多出额外的无意义标记.

```tsx
// 不要用div！
const App = () => (
  <>
    <div>message a</div>
    <div>message b</div>
  </>
)

```

## 不要使用内联函数
内联函数就是给event handler定义一个anonymous的箭头函数。
在使用内联函数后, render 方法每次运行时都会创建该函数的新实例, 导致 React 在进行 Virtual DOM 比对时, 新旧函数比对不相等，导致 React 总是为元素绑定新的函数实例, 而旧的函数实例又要交给垃圾回收器处理. 

```tsx
<input
  value={ this.state.inputValue }
  onChange={ e => this.setState({ inputValue: e.target.value }) }
/>
```

正确的做法是在组件中单独定义函数, 将函数绑定给事件.有三种方式：
- 定义箭头函数
- 定义function函数，并且内联调用bind(this)
- 定义function函数，并且在constructor中bind(this)

```tsx
...
// 方式一：用箭头函数自动绑定this，但是会有小问题，接下来会聊到
setInputValue = e => {
  this.setState({ inputValue: e.target.value })
}
render() {
  return (
    <input
      value={ this.state.inputValue }
      onChange={ this.setInputValue }
    />
  )
}
```

在类组件中如果使用 fn() {} 这种方式定义函数, 函数 this 默认指向 undefined. 也就是说函数内部的 this 指向需要被更正.可以在构造函数中对函数的 this 进行更正, 也可以在行内进行更正, 两者看起来没有太大区别, 但是对性能的影响是不同的.

```tsx
class App extends React.Component {
   constructor() {
    super()
     // 方式二：构造函数只执行一次, 所以函数 this 指向更正的代码也只执行一次.
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    console.log(this)
  }

  render() {
    // 方式三： render 方法每次执行时都会调用 bind 方法生成新的函数实例.
    return <button onClick={ this.handleClick.bind(this) }>按钮</button>
  }
}
```

### 类组件中的箭头函数问题
在类组件中使用箭头函数不会存在 this 指向问题, 因为箭头函数会自动绑定this。
```tsx
class App extends React.Component {
  handleClick = () => console.log(this)
  render() {
    return <button onClick={ this.handleClick }>按钮</button>
  }
}
```

箭头函数在 this 指向问题上占据优势, 但是同时也有不利的一面.

当使用箭头函数时, 该函数被添加为类的实例对象属性（这也是为什么自动绑定了this）, 而不是原型对象属性. 如果组件被多次重用, 每个组件实例对象中都将会有一个相同的函数实例, 降低了函数实例的可重用性造成了资源浪费.

```ts
class Test {
  arrow = () => console.log(this)

  fn() { console.log(this); }
}

const t = new Test();

t.hasOwnProperty('arrow')   // true
t.hasOwnProperty('fn')      // false
t.fn === t.__proto__.fn     // true
```

综上所述, **更正函数内部 this 指向的最佳做法仍是在构造函数中使用 bind 方法进行绑定**。

## 避免使用内联样式属性
当使用内联 style 为元素添加样式时, 内联 style 会被编译为 JavaScript 代码, 通过 JavaScript 代码将样式规则映射到元素的身上, 浏览器就会花费更多的时间执行脚本和渲染 UI, 从而增加了组件的渲染时间.

```tsx
function App() {
  return <div style={{ backgroundColor: "skyblue" }}>App works</div>
}
```

在上面的组件中, 为元素附加了内联样式, 添加的内联样式为 JavaScript 对象, backgroundColor 需要被转换为等效的 CSS 样式规则, 然后将其应用到元素, 这样涉及到脚本的执行.

更好的办法是将 CSS 文件导入样式组件. **能通过 CSS 直接做的事情就不要通过 JavaScript 去做**，因为 JavaScript 操作 DOM 非常慢.

## 优化条件渲染
频繁的挂载和卸载组件是一项耗性能的操作, 为了确保应用程序的性能, 应该减少组件挂载和卸载的次数.
```tsx
function App() {
  if (true) {
    return (
      <>
        <AdminHeader />
        <Header />
        <Content />
      </>
    )
  } else {
    return (
      <>
        <Header />
        <Content />
      </>
    )
  }
}
```

在上面的代码中, 当渲染条件发生变化时, React 内部在做 Virtual DOM 比对时发现, 刚刚第一个组件是 AdminHeader, 现在第一个组件是 Header, 刚刚第二个组件是 Header, 现在第二个组件是 Content, 组件发生了变化, React 就会卸载 AdminHeader、Header、Content, 重新挂载 Header 和 Content, 这种挂载和卸载就是没有必要的.

正确做法：这样Header和Content都不会被无效重复的渲染
```tsx
function App() {
  return (
    <>
      { true && <AdminHeader /> }
      <Header />
      <Content />
    </>
  )
}
```

## 为组件创建错误边界
默认情况下, 组件渲染错误会导致整个应用程序中断, 创建错误边界可确保在特定组件发生错误时应用程序不会中断.错误边界是一个 React 组件, 可以捕获子级组件在渲染时发生的错误, 当错误发生时, 可以将错误记录下来, 可以显示备用 UI 界面.

错误边界涉及到两个生命周期函数, 分别为 getDerivedStateFromError 和 componentDidCatch.
- getDerivedStateFromError 为静态方法, 方法中需要返回一个对象, 该对象会和state对象进行合并, 用于更改应用程序状态.
- componentDidCatch 方法用于记录应用程序错误信息. 该方法的参数就是错误对象.

```tsx
class ErrorBoundaries extends React.Component {
  constructor() {
    super()
    this.state = {
      hasError: false
    }
  }

  componentDidCatch(error) {
    console.log("componentDidCatch")
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>发生了错误</div>
    }

    // App里面发生的错误是可以捕获到的
    return <App />
  }
}
```

**注意**: 错误边界不能捕获异步错误, 比如点击按钮时发生的错误.

## 为`<li>`加上key
这个是本来就该做的，不然会报警告，但是也算是一种优化。

这样在DOM diff的时候就会更高效，不需要一个一个对比，可以通过key找到存不存在老的相对应的node。

## 依赖优化
在应用程序中经常会依赖第三方包, 但我们不想引用包中的所有代码, 我们只想用到哪些代码就包含哪些代码. 此时可以使用插件对依赖项进行优化. [优化资源](https://github.com/GoogleChromeLabs/webpack-libs-optimizations)

当前我们就使用 lodash 举例子. 应用基于 create-react-app 脚手架创建。

1. react-app-rewired: 覆盖 create-react-app 的默认配置
```ts
module.exports = function (oldConfig) {
  return newConfig
}
// 参数中的 oldConfig 就是默认的 webpack config
```

2. customize-cra: 导出了一些辅助方法, 可以让以上写法更加简洁
```ts
const { override, useBabelRc } = require("customize-cra")

module.exports = override(
  (oldConfig) => newConfig,
)
```
override：可以接收多个参数, 每个参数都是一个配置函数, 函数接收 oldConfig, 返回 newConfig
useBabelRc: 允许使用 .babelrc 文件进行 babel配置

3. 安装babel-plugin-lodash: 对应用中的 lodash 进行精简

4. 在项目的根目录下新建 `config-overrides.js` 并加入配置代码
```ts
const { override, useBabelRc } = require("customize-cra")

module.exports = override(useBabelRc())
```

5. 修改 `package.json` 文件中的构建命令
```ts
"scripts": {
  "start": "react-app-rewired start",
  "build": "react-app-rewired build",
}
```

6. 创建 `.babelrc` 文件并加入配置
```ts
{
  "plugins": ["lodash"]
}
```

7. 生产环境下的三种 JS 文件
- `main.[hash].chunk.js`: 这是你的应用程序代码, App.js 等.
- `1.[hash].chunk.js`: 这是第三方库的代码, 包含你在 node_modules 中导入的模块
- `runtime~main.[hash].js`: webpack运行时代码

