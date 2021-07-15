# SSR
SSR相关，主要分为两大块
- SSR相关理解和介绍
- SSR实现原理

## 渲染方式
随着前端技术栈和工具链的迭代成熟，前端工程化、模块化也已成为了当下的主流技术方案，在这波前端技术浪潮中，涌现了诸如 React、Vue、Angular 等基于**客户端渲染**的前端框架。这类框架所构建的应用称为单页应用（Single Page App, SPA）

### SPA
- 优点：
  - 具有用户体验好
  - 渲染性能好
  - 可维护性高等优点

- 缺点：
  - 首屏加载时间过长
  与传统服务端渲染直接获取服务端渲染好的 HTML 不同，单页应用使用 JavaScript 在客户端生成 HTML 来呈现内容，用户需要等待客户端 JS 解析执行完成才能看到页面，这就使得首屏加载时间变长，从而影响用户体验。
  - 不利于 SEO
  当搜索引擎爬取网站 HTML 文件时，单页应用的 HTML 没有内容，因为他它需要通过客户端 JavaScript解析执行才能生成网页内容，而目前的主流的搜索引擎对于这一部分内容的抓取还不是很好。

### 同构渲染
为了解决上述两个缺陷，业界借鉴了传统的服务端直出 HTML 方案，提出在服务器端执行前端框架（React/Vue/Angular）代码生成网页内容，然后将渲染好的网页内容返回给客户端，客户端只需要负责展示就可以了。

为了获得更好的用户体验，同时会在客户端将来自服务端渲染的内容激活为一个SPA应用，也就是说之后的页面内容交互都是通过客户端渲染处理。

这种方式简而言之就是：
- 通过服务端渲染首屏直出，解决首屏渲染慢以及不利于 SEO 问题
- 通过客户端渲染接管页面内容交互得到更好的用户体验

这种方式我们通常称之为**现代化的服务端渲染**，也叫**同构渲染**。所谓的同构指的就是服务端构建渲染 + 客户端构建渲染。同理，这种方式构建的应用称之为服务端渲染应用或者是同构应用。

## 传统SPA和SSR对比
### 什么是渲染
我们这里所说的渲染指的是把（数据 + 模板）拼接到一起的这个事儿。

例如对于我们前端开发者来说最常见的一种场景就是：请求后端接口数据，然后将数据通过模板绑定语 法绑定到页面中，最终呈现给用户。这个过程就是我们这里所指的渲染。
渲染本质其实就是字符串的解析替换，实现方式有很多种；但是我们这里要关注的并不是如何渲染，而 是在哪里渲染的问题？

### 传统的服务端渲染 SSR
最早期，Web页面渲染都是在服务端完成的，即服务端运行过程中将所需的数据结合页面模板渲染为HTML，响应给客户端浏览器。所以浏览器呈现出来的是直接包含内容的页面。

![Screen Shot 2021-06-26 at 18.17.23](/assets/Screen%20Shot%202021-06-26%20at%2018.17.23.png)

这种方式的代表性技术有：ASP、PHP、JSP，再到后来的一些相对高级一点的服务端框架配合一些模板引擎。

例子
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>传统的服务端渲染</title>
</head>
<body>
  <h1>传统的服务端渲染</h1>
  <h2>{{ title }}</h2>
  <ul>
    {{ each posts }}
    <li>{{ $value.title }}</li>
    {{ /each }}
  </ul>
</body>
</html>
```
```ts
// index.js
const express = require('express')
const fs = require('fs')
const template = require('art-template')

const app = express()

app.get('/', (req, res) => {
  // 1. 获取页面模板
  const templateStr = fs.readFileSync('./index.html', 'utf-8')

  // 2. 获取数据
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'))

  // 3. 渲染：数据 + 模板 = 最终结果
  const html = template.render(templateStr, data)

  // 4. 把渲染结果发送给客户端
  res.send(html)
})

app.get('/about', (req, res) => {
  res.end(fs.readFileSync('./about.html'))
})

app.listen(3000, () => console.log('running...'))
```

这也就是最早的网页渲染方式，也就是动态网站的核心工作步骤。在这样的一个工作过程中，因为页面中的内容不是固定的，它有一些动态的内容。

在网页应用并不复杂的情况下，这种方式也是可取的。但是在当下网页越来越复杂的情况下，这种渲染模式是不合理或者说不先进的，存在很多明显的不足：
- 应用的前后端部分完全耦合在一起，在前后端协同开发方面会有非常大的阻力
- 前端没有足够的发挥空间，无法充分利用现在前端生态下的一些更优秀的方案
- 由于内容都是在服务端动态生成的，所以服务端的压力较大
- 相比目前流行的 SPA 应用来说，渲染性能差，用户体验一般

### 客户端渲染 SPA
传统的服务端渲染有很多问题，但是这些问题随着客户端 Ajax 技术的普及得到了有效的解决，Ajax 技术可以使得客户端动态获取数据变为可能，也就是说原本服务端渲染这件事儿也可以拿到客户端做了。

下面是基于客户端渲染的 SPA 应用的基本工作流程。
![Screen Shot 2021-06-26 at 18.18.14](/assets/Screen%20Shot%202021-06-26%20at%2018.18.14.png)

通过SPA可以把**数据处理**和**页面渲染**这两件事儿分开了，也就是后端负责数据处理，前端负责页面渲染，这种分离模式极大的提高了开发效率和可维护性。这样一来，前端更为独立，也不再受限制于后端，它可以选择任意的技术方案或框架来处理页面渲染。

但是这种模式下，也会存在一些明显的不足，首先看看流程对比：
- **客户端渲染流程**（需要请求多次服务端，拿很多数据）
  - ajax一个html，基本是个空界面，里面有script
  - script请求各种bundle.js
  - bundle.js里面会继续ajax数据
  - 利用数据进行渲染

- **服务端渲染流程**（页面直出）
  - 直接ajax渲染后的html

从以上流程我们可以看出SPA问题所在：
- **首屏渲染慢**：因为 HTML 中没有内容，必须等到 JavaScript 加载并执行完成才能呈现页面内容。还需要ajax拿到完整的data，网速慢的话这一步也会拖进度，而且实际渲染的时候，不一定整个data都需要用到。
- **SEO 问题**：同样因为 HTML 中没有内容，所以对于目前的搜索引擎爬虫来说，页面中没有任何有用的信息，自然无法提取关键词，进行索引了。(爬虫不会去继续ajax数据等网页动态更新)


## 现代化的服务端渲染
**isomorphic web apps（同构应用）**：基于 react、vue 框架，客户端渲染和服务器端渲染的结合：
- 在服务器端执行一次，用于实现服务器端渲染（首屏直出）
- 在客户端再执行一次，用于接管页面交互，核心解决 SEO 和首屏渲染慢的问题。

![Screen Shot 2021-06-26 at 18.18.23](/assets/Screen%20Shot%202021-06-26%20at%2018.18.23.png)

#### 优缺点
- 优点（基本上就是解决了SPA的两个问题）：
  - 首屏渲染速度快
  - 有利于 SEO

- 缺点：
  - 开发成本高
  - 涉及构建设置和部署的更多要求。与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。
  - 更多的服务器端负载。在Node.js中渲染完整的应用程序，显然会比仅仅提供静态文件的server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境(high traffic) 下使用，请准备相应的服务器负载，并明智地采用缓存策略
  - 开发条件所限。浏览器特定的代码，只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些外部扩展库 (external library) 可能需要特殊处理，才能在服务器渲染应用程序中运行。

#### 大致原理
- 运行前端框架的时候，会生成虚拟DOM。在服务端运行时，虚拟DOM直接会转换成HTML，在前端运行时转换成真实DOM。
- 从服务端返回的HTML中，会包含一些额外的js脚本，在客户端将app转换成SPA

#### 相关技术
- React 生态中的 Next.js
- Vue 生态中的 Nuxt.js
- Angular 生态中的 Angular Universal


![](同构应用.jpg)

#### 需要SSR吗
这主要取决于内容到达时间(time-to-content)对应用程序的重要程度。

例如，如果你正在构建一个内部仪表盘，初始加载时的额外几百毫秒并不重要，这种情况下去使用服务器端渲染 (SSR) 将是一个小题大作之举。

如果内容到达时间 (time-to-content) 要求是绝对关键的指标，在这种情况下，服务器端渲染(SSR) 可以帮助你实现最佳的初始加载性能。

事实上，很多网站是出于效益的考虑才启用服务端渲染，性能倒是在其次。 假设 A 网站页面中有一个关键字叫“前端性能优化”，这个关键字是 JS 代码跑过一遍后添加到 HTML 页面中的。那么客户端渲染模式下，我们在搜索引擎搜索这个关键字，是找不到 A 网站的——搜索引擎只会查找现成的内容，不会帮你跑 JS 代码。A 网站的运营方见此情形，感到很头大：搜索引擎搜不出来，用户找不到我们，谁还会用我的网站呢？为了把“现成的内容”拿给搜索引擎看，A 网站不得不启用服务端渲染。 但性能在其次，不代表性能不重要。

# SSR同构应用实现原理
完整代码参见vue-ssr/
## 实现流程
**思路：** 客户端和服务端需要不同的js，源码中我们需要提供server entry和client entry，然后用webpack打包后生成`server.bundle.js`和`client.bundle.js`,服务端只是发送html过来，然后event handler之类的需要在客户端用`client.bundle.js`里面`“激活 (hydration)”`成为SPA。

![同构渲染](/assets/同构渲染.jpg)

接下来会用到Vue的官方解决方案Vue SSR和nuxt.js为例，讨论同构渲染是如何实现的。

## 服务端渲染html
首先我们了解一下SSR的一个基础流程：从服务端渲染并且返回html，是如何实现的：
#### 模板渲染
就是如何在服务端使用 Vue 的方式解析替换字符串。
```ts
// 第 1 步：创建一个 Vue 实例
const Vue = require("vue");
const app = new Vue({
  template: `<div>{{ message }}</div>`, data: {
    message: "Hello  World",
  },
});

// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

// 第 3 步：将 Vue 实例渲染为 HTML 
renderer.renderToString(app, (err, html) => {
  if (err) throw err; 
  console.log(html);    //  =>  <div  data-server-rendered="true">Hello  World</div>
});
```

#### 与服务器集成
```ts
const Vue = require("vue");
const server = require("express")();
const renderer = require("vue-server-renderer").createRenderer();

server.get("*", (req, res) => {
  const app = new Vue({
    data: {
      url: req.url,
    },
    template: `<div>  的 URL 是  {{ url }}</div>`,
  });

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <title>Hello</title>
      <meta charset="UTF-8">
      </head>
      <body>${html}</body>
      </html>
    `);
  });
});

server.listen(8080);
```

## 文件结构
目录大致结构
```
index.template.html     # 服务端渲染的出口
src
├── components
│ ├── Foo.vue
│ ├── Bar.vue
│ └── Baz.vue
├── App.vue             # 客户端渲染的入口
├── app.js              # 通用 entry (universal entry)
├── entry-client.js     # 仅运行于浏览器
└── entry-server.js     # 仅运行于服务器
```

### 通用入口
通用入口导出的工厂函数客户端和服务端都会用到。
```ts
// app.js
import Vue from 'vue'
import App from './App.vue'

// 导出一个工厂函数 用于创建新的app、router 和 store 实例
export function createApp() {
  const app = new Vue({
    render: h => h(App)
  })
  return { app }
}
```

### 客户端入口
客户端entry只需要创建应用程序，并且将其挂载到DOM中
```ts
// entry-client.js
import { createApp } from './app'
const { app } = createApp()
app.$mount('#app')
```

### 服务端入口
服务器 entry 导出一个可以用到context的函数，并在每次渲染时调用此函数。除了创建和返回
应用程序实例之外，这里还可以执行服务器端路由匹配 (server-side route matching) 和数据预取(data pre-fetching logic)。
```ts
// entry-server.js
import { createApp } from './app'
export default context => {
  const { app } = createApp()
  return app
}
```

### 客户端渲染的入口
```html
<template >
  <!-- 客户端渲染的入口 -->
  <div id="app"></div>
</template >
<script>
export default {
  name: 'App'
}
</script>
<style></style>
```

### 服务端渲染出口
nuxt.js需要一个html模板，服务端渲染内容会放到这个出口`index.template.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>xxx</title>
  </head>
  <body>
    <!-- 服务端渲染的内容出口 -->
    <!--vue-ssr-outlet-->
  </body>
</html>
```

## 打包
### 打包配置
我们需要对client和server分别打包,需要的主要工具是`VueSSRClientPlugin`插件
```ts
// webpack.client.config.js
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
...
plugins: [
  // 在输出目录中生成 `vue-ssr-client-manifest.json`
  new VueSSRClientPlugin()
]
```

```ts
// webpack.server.config.js
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
...
plugins: [
  // 将服务器的整个输出构建为单个 JSON 文件的插件。
  // 默认文件名为 `vue-ssr-server-bundle.json`
  new VueSSRServerPlugin()
]
```

### 打包运行
```ts
"scripts": {
  "build:client": "cross-env NODE_ENV=production webpack --config
  webpack.client.config.js",
  "build:server": "cross-env NODE_ENV=production webpack --config
  webpack.server.config.js",
  "build": "rimraf dist && npm run build:client && npm run build:server"
},
```

`yarn build`,会分别生成
- 服务端的`dist/vue-ssr-server-bundle.json`
  - 通过`server.entry.js`构建出来的专门用于Vue SSR的特殊文件
  - 包含：
    - entry：入口
    - files：所有构建结果资源列表，包括打包过后的`server-bundle.js`
    - maps：源代码的 source map 信息
- 客户端的`dist/vue-ssr-client-manifest.json`
  - publicPath：静态资源的根相对路径（就是webpack 配置中的 publicPath） 
  - all：打包后的所有静态资源文件路径
  - initial： 页面初始化时需要加载的文件，会在页面加载时配置到 preload 中
  - async: 页面跳转时需要加载的文件，会在页面加载时配置到 prefetch 中
  - modules: 项目的各个模块包含的文件的序号和其它信息，有点类似一个search index，用于查找文件
- 很多真正可以运行的js文件，上面两个file就是会创建很多index指向这些js，比如客户端的initial就会指向最开始hydration需要运行的js文件。

## 启动
### 直接启动
打包过后的文件结构是nuxt规定的，不是static page，所以不能直接打开，需要用nuxt服务来serve。
```
nuxt        # development
nuxt start  # production
```
### 自行启动
我们也可以深入到nuxt的启动原理，自己用express来写一个启动服务。基本原理就是用到vue-server-renderer提供的createBundleRenderer，用template，server bundle和client bundle作为参数，产生一个renderer。
```ts
const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')

const template = fs.readFileSync('./index.template.html', 'utf-8')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
})

const server = express()

server.use('/dist', express.static('./dist'))   // 让外部可以访问dist/里面的文件
server.get('/', (req, res) => {
  renderer.renderToString({
    title: 'Bitcoin',
  }, (err, html) => {
    if (err) {
      return res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf8')
    res.end(html)
  })
})

server.listen(3000, () => {
  console.log('server running at port 3000.')
})
```

#### 热更新
**流程**
源码改变
=> 重新打包，生成client bundle和server bundle
=> 用client bundle + server bundle + template生成新的渲染器
=> 热更新plugin会重新出发渲染

```ts
// server.js
let renderer

if (isProd) {
  // prod的话跟上面一样
  const template = fs.readFileSync(templatePath, 'utf-8')
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createBundleRenderer(serverBundle, {
    template, 
    clientManifest,
  })
} else {
  // 开发模式, 需要各种优化和监听
  // setupDevServer会返回一个promise，resolve了以后表示新的renderer已经生成了
  // 里面主要功能是监听和更新bundle,template
  onReady = setupDevServer(
    app,
    templatePath,
    (serverBundle, options) => {
      // 回调函数：每当生成新的 template / 客户端 bundle / 服务端 bundle ，会生成新的渲染器
      renderer = createBundleRenderer(serverBundle, { ...options })
    }
  )
}

async function render (req, res) {
  const context = { url: req.url }
  try {
    const html = await renderer.renderToString(context)
    res.send(html)
  } catch (err) {
    res.status(500).end(err.message)
  }
}

app.get('*', isProd
  ? render                  // 生产模式 使用构建好的包直接渲染
  : async (req, res) => {   // 开发模式 等第一次构建好再渲染
    await onReady
    render(req, res)
  })
```

更新template
```ts
template = fs.readFileSync(templatePath, 'utf-8')
chokidar.watch(templatePath).on('change', () => {
  template = fs.readFileSync(templatePath, 'utf-8')
  update()  // 通知setupDevServer内部更新
})
```

更新服务端
```ts
const serverConfig = require('./webpack.server.config')
const serverCompiler = webpack(serverConfig)
serverCompiler.watch({}, (err, stats) => {
  serverBundle = JSON.parse(fs.readFileSync('./dist/vue-ssr-server-bundle.json',
'utf-8'))
  update()  // 通知setupDevServer内部更新
}) 
```

更新客户端
```ts
const hotMiddleware = require('webpack-hot-middleware')
const clientConfig = require('./webpack.client.config')

// ====================== 热更新配置 ============================
clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
clientConfig.entry.app = [
'webpack-hot-middleware/client?reload=true&noInfo=true',
clientConfig.entry.app
]
clientConfig.output.filename = '[name].js'
// ============================================================

const clientCompiler = webpack(clientConfig)
clientDevMiddleware = webpackDevMiddleware(clientCompiler, {
  publicPath: clientConfig.output.publicPath,
})

// 主要是通过一个钩子触发更新
clientCompiler.hooks.done.tap('client', () => {
  clientManifest = JSON.parse(
    clientCompiler.outputFileSystem.readFileSync(resolve('../dist/vue-ssrclient-manifest.json'), 'utf-8')
  )
  update()  // 通知setupDevServer内部更新
})

server.use(clientDevMiddleware)
server.use(hotMiddleware(clientCompiler, { log: false }))
```

**优化**：在热更新的打包中，没必要直接对磁盘IO，可以把输出的文件存在内存中，这样速度更快。实现方式：
- 使用webpack-dev-middleware：以监听模式启动 webpack 将编译结果输出到内存中 然后将内存文件输出到 Express 服务中
- 或者用memfs取代fs作为文件读写系统，自己写一个IO。

## 通用代码
编写SSR和客户端通用的代码时的注意事项
### 响应式
将数据进行响应式的过程在服 务器上是多余的，所以默认情况下禁用。禁用响应式数据，还可以避免将「数据」转换为「响应式对象」的性能开销。

### 生命周期
由于没有动态更新，所有的生命周期钩子函数中，只有beforeCreate和created会在服务器端渲染(SSR) 过程中被调用。这就是说任何其他生命周期钩子函数中的代码（例如beforeMount或mounted），只会在客户端执行。

此外还需要注意的是，你应该避免在beforeCreate和created生命周期时产生全局副作用的代码，例如在其中使用  setInterval  设置 timer。在纯客户端 (client-side only) 的代码中，我们可以设置一个 timer，然后在beforeDestroy	或destroyed生命周期时将其销毁。但是，由于在 SSR 期间并不会调用销毁钩子函数，所以timer将永远保留下来。为了避免这种情况，请将副作用代码移动到beforeMount或mounted生命周期中。

### 访问特定平台(Platform-Specific) API 
通用代码不可接受特定平台的API，因此如果你的代码中，直接使用了像window或document这种仅浏览器可用的全局变量，则会在 Node.js 中执行时抛出错误，反之也是如此。 

对于共享于服务器和客户端，但用于不同平台 API 的任务(task)，建议将平台特定实现包含在通用 API 中，或者使用为你执行此操作的 library。例如，axios  是一个 HTTP  客户端，可以向服务器和客户端都暴露相同的 API。

对于仅浏览器可用的 API，通常方式是，在「纯客户端 (client-only)」的生命周期钩子函数中惰性访问(lazily access) 它们。

请注意，考虑到如果第三方 library 不是以上面的通用用法编写，则将其集成到服务器渲染的应用程序中，可能会很棘手。你可能要通过模拟 (mock) 一些全局变量来使其正常运行，但这只是 hack 的做 法，并且可能会干扰到其他 library 的环境检测代码

### 自定义指令
大多数自定义指令直接操作 DOM，因此会在服务器端渲染 (SSR) 过程中导致错误。有两种方法可以解决这个问题：
1.	推荐使用组件作为抽象机制，并运行在「虚拟 DOM 层级(Virtual-DOM level)」（例如，使用渲染函数(render function)）。
2.	如果你有一个自定义指令，但是不是很容易替换为组件，则可以在创建服务器 renderer 时，使用选项所提供"服务器端版本(server-side version)"。

## 路由和代码分割
SSR的路由必须要基于history，不能用hash。相反的，static page(例如部署在ipfs上)的必须基于用hash.

```ts
首先设置路由
{
  path:  '/about',
  name:  'about',
  component:  ()  =>  import('@/pages/About')
},
```
然后稍微修改server-entry.js,server.js等，主要是要把req.url传来穿去并且存起来，还有在app.js要有一个路由组件出口`<router-view>`

### 分割的优点
在路由中配置的异步组件（也叫路由懒加载）非常有意义，它们会被分割为独立的chunk（也就是单独的文件），只有在需要的时候才会进行加载。这样就能够避免在初始渲染的时候客 户端加载的脚本过大导致激活速度变慢的问题。

我们还会发现除了 app 主资源外，其它的资源也被下载下来了，你是不是要想说：不是应该在需要的时候才加载吗？为什么一上来就加载了。原因是在页面的头部中的带有 preload 和 prefetch 的 link 标签。

我们期望客户端 JavaScript 脚本尽快加载尽早的接管服务端渲染的内容，让其拥有动态交互能力，如果script 标签在上面的话，浏览器会去下载它，然后执行里面的代码（同步），这个过程会阻塞页面的渲染。

所以我们用到proload，这只是告诉浏览器可以去预加载这个资源，但是不要执行里面的代码，也不要影响网页的正常渲染，直到遇到真正的 script 标签加载该资源的时候才会去执行里面的代码。这个时候可能已经预加载好了，直接使用就可以了，如果没有加载好，也不会造成重复加载，所以不用担心这个问题。

而 prefetch 资源是加载下一个页面可能用到的资源，浏览器会在空闲的时候对其进行加载，所以它并不一定会把资源加载出来，而 preload 一定会预加载。所以你可以看到当我们去访问 about 页面的时候，它的资源是通过 prefetch 预取过来的，提高了客户端页面导航的响应速度。

## 数据预取和状态
跟客户端相比，SSR的问题：
- 只支持 beforeCreate 和 created
- 不会等待 beforeCreate 和 created 中的异步操作
- 不支持响应式数据
```ts
// 不可行
async created () {
  const { data } = await axios({    // 不会等待！！
    method: 'GET',
    url: 'https://cnodejs.org/api/v1/topics'
  })
  this.posts = data.data
}
```

解决办法：
创建vuex容器，在组件中使用serverPrefetch触发容器的action
```ts
export default {
  serverPrefetch () {
    return this.getPosts()
  },
  methods: {
    ...mapActions(['getPosts'])   // vuex 中可以异步操作等待数据加载
  }
}
```
接下来我们还要把在服务端渲染期间所获取填充到容器中的数据同步到客户端容器中，从而避免两个端状态不一致导致客户端重新渲染的问题。
- 生成代码：`window.__INITIAL__STATE = 容器状态` 插入模板页面中
- 客户端通过 `window.__INITIAL__STATE` 获取该数据

## SSR优化：缓存
可以用`mirco-caching`（比如LRU）缓存用户无关的动态资源：任何用户访问该资源都会得到相同的内容，但该内容可能在任意时间发生变化，如博客文章。