
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [tapable](#tapable)
  - [tapable工作流程](#tapable工作流程)
  - [Hook](#hook)
  - [手写synchook和asynchook](#手写synchook和asynchook)
- [打包过后的代码基本结构](#打包过后的代码基本结构)
  - [懒加载的代码结构](#懒加载的代码结构)
- [webpack源码工作流程](#webpack源码工作流程)
  - [webpack 入口](#webpack-入口)
    - [compiler 实例化操作](#compiler-实例化操作)
    - [run 方法执行](#run-方法执行)
    - [addEntry过程](#addentry过程)
    - [总结](#总结)
  - [手写mini webpack](#手写mini-webpack)
- [其它](#其它)
  - [Loader和Plugin的区别](#loader和plugin的区别)
    - [Loader](#loader)
    - [Plugin](#plugin)
    - [区别](#区别)
  - [总结](#总结-1)
- [References](#references)

<!-- /code_chunk_output -->

# tapable
webpack编译流程：
- 配置初始化
- 内容编译
- 输出编译后内容

这种流程叫做`事件驱动型事件流工作机制`

核心是 （都是tapable提供的）：
- 负责编译的`compiler`
- 负责创建bundles的`compilation`

## tapable工作流程
- 实例化hook注册事件监听
- 通过hook触发事件监听
- 执行懒编译生成的可执行代码

## Hook
Hook本质是tapable实例对象

Hook可分为同步和异步两种，异步又可以分为串行和并行两种。

种类：
- Hook：普通钩子，监听器之间互相独立不干扰
- BailHook：熔断钩子：某个监听返回非undefined时后续不执行
- WaterfallHook：瀑布钩子：上一个监听的返回值可传递至下一个
- LoopHook：循环钩子：如果当前未返回false则一直执行 (webpack中不常见)

同步钩子：
- SyncHook
- SyncBailHook
- SyncWaterfallHook
- SyncLoopHook

异步串行钩子：
- AsyncSeriesHook
- AsyncSeriesBailHook
- AsyncSeriesWaterfallHook

异步并行钩子：
- AsyncParalleHook
- AsyncParalleBailHook

## 手写synchook和asynchook
大概思路：
- 实例化hook: 定义hook._x = [f1, f2, ...]; hook.taps = [{}, {}];
- 实例调用tap: taps = [{}, {}]
- HookCodeFactory里setup()，create() => 产生的一个可执行的call()
- call()

详见“手写hook”文件夹

# 打包过后的代码基本结构
webpack打包过后主要是用到`__webpack_require__`去代替`import`还有`require`,从而能够兼容不同的语法（cjs和esm）。整个的入口是一个IIFE，参数`modules`就是一个obj，key是模块的路径，value是包裹过后的这个模块的代码。不同的语法会有不同的包裹方法，如果是cjs基本就不用怎么包裹。

当一个模块引入另一个模块，就会递归调用`__webpack_require__`。

`__webpack_require__`还有很多单个字母的function，用于处理各种细节。

```ts
/* ---------- index.js ---------- */
import name, { age } from './login.js'

console.log(name)
console.log(price)

/* ---------- bitcoin.js ---------- */
export default 'bitcoin gogogo'
export const price = 400000

/* ---------- bundle.js ---------- */
// 把modules参数单独放出来，让结构更清晰。
var modules = {
  "./src/index.js":
    (function (module, __webpack_exports__, __webpack_require__) {
      // 这里面就是经过包装的index.js的内容
      "use strict";
      __webpack_require__.r(__webpack_exports__);   // 标记当前模块是es6
      var _login_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bitcoin.js */ "./src/bitcoin.js");   // 递归 加载bitcoin.js的内容
      console.log(_login_js__WEBPACK_IMPORTED_MODULE_0__["default"])
      console.log(_login_js__WEBPACK_IMPORTED_MODULE_0__["name"])
    }),
  "./src/bitcoin.js":
    (function (module, __webpack_exports__, __webpack_require__) {
      // 这里面就是经过包装的bitcoin.js的内容
      "use strict";
      __webpack_require__.r(__webpack_exports__);   // 标记当前模块是es6
      __webpack_require__.d(__webpack_exports__, "price", function () { return price; });
      __webpack_exports__["default"] = ('bitcoin gogogo');
      const price = 400000 // TODO: 这里为什么不是const先定义在上面
    })
};

// 主函数IIFE
(function (modules) {
  // 01 缓存被加载过的模块
  let installedModules = {}

  // 02 定义一个 __webpack_require__ 方法来替换 import require 加载操作
  function __webpack_require__(moduleId) {
    // 2-1 判断当前缓存中是否存在要被加载的模块内容，如果存在则直接返回
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    // 2-2 如果当前缓存中不存在则需要我们自己定义{} 执行被导入的模块内容加载
    let module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    }

    // 2-3 调用当前 moduleId 对应的函数，然后完成内容的加载
    // 这个f是关键，会call模块里面的代码
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)

    // 2-4 当上述的方法调用完成之后，我们就可以修改 l 的值用于表示当前模块内容已经加载完成了
    module.l = true

    // 2-5 加载工作完成之后，要将拿回来的内容返回至调用的位置 
    return module.exports
  }

  // 03 定义 m 属性用于保存 modules 
  __webpack_require__.m = modules

  // 04 定义 c 属性用于保存 cache 
  __webpack_require__.c = installedModules

  // 05 定义 o 方法用于判断对象的身上是否存在指定的属性
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty(object, property)
  }

  // 06 定义 d 方法用于在对象的身上添加指定的属性，同时给该属性提供一个 getter 
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter })
    }
  }

  // 07 定义 r 方法用于标识当前模块是 es6 类型
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      // TODO: 这两个Object.defineProperty为什么不能直接exports[Symbol.toStringTag] = { value: "Module" }
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    }
    Object.defineProperty(exports, '__esModule', { value: true })
  }

  // 08 定义 n 方法，用于设置具体的 getter 
  __webpack_require__.n = function (module) {
    let getter = module && module.__esModule ?
      function getDefault() { return module['default'] } :
      function getModuleExports() { return module }

    __webpack_require__.d(getter, 'a', getter)

    return getter
  }

  // 09 定义 P 属性，用于保存资源访问路径
  __webpack_require__.p = ""

  // 10 调用 __webpack_require__ 方法执行模块导入与加载操作
  return __webpack_require__(__webpack_require__.s = './src/index.js')
})(modules)
```

## 懒加载的代码结构
主要是用到三个新函数：
- webpackJsonpCallback合并modules
- __webpack_require__.e创建html tag和利用promise异步加载，结果给t
- `t`函数来懒加载模块。

```ts
/* ----- login.built.js ----- */
// 注意这里的push被修改过，变成webpackJsonpCallback
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["login"], {
  "./src/login.js":
    (function (module, exports) {
      module.exports = "懒加载导出内容"
    })
}]);

/* ----- index.js ----- */
let oBtn = document.getElementById('btn')
oBtn.addEventListener('click', function () {
  import(/*webpackChunkName: "login"*/'./login.js').then((login) => {
    console.log(login)
  })
})

/* ----- bundle.js ----- */
// 现在一开始只有一个主入口modules，之后懒加载login.js会被webpackJsonpCallback合并进来
var modules = {
  "./src/index.js": (function (module, exports, __webpack_require__) {
    let oBtn = document.getElementById('btn')
    oBtn.addEventListener('click', function () {
      __webpack_require__.e(/*! import() | login */ "login").then(__webpack_require__.t.bind(null, /*! ./login.js */ "./src/login.js", 7)).then((login) => {
        console.log(login)
      })
    })
  })
}

(function (modules) {
  // object to store loaded and loading chunks
  // undefined = chunk not loaded, null = chunk preloaded/prefetched
  // Promise = chunk loading, 0 = chunk loaded
  var installedChunks = {
    "main": 0
  };

  // 主要作用：1）合并模块定义 2）改变promise状态执行后续行为
  function webpackJsonpCallback(data) {
    var chunkIds = data[0];     // 需要被动态加载的模块id
    var moreModules = data[1];  // 需要被动态加载的模块的依赖关系
    var moduleId, chunkId, i = 0, resolves = [];

    // 判断chunkId里对应的模块是否已经完成了加载
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;   // 更新当前chunk状态
    }

    // 1）合并模块定义： 把需要加载的模块内容放进modules里面，之后__webpack_require__就可以用到
    for (moduleId in moreModules) {
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }

    // 2）改变promise状态
    while (resolves.length) {
      resolves.shift()();
    }
  };

  // 用jsonp加载内容，利用promise来实现异步加载
  __webpack_require__.e = function requireEnsure(chunkId) {
    var promises = [];
    // 判断对应的chunk是否已经完成加载
    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) {   // 0 means "already installed".
      if (installedChunkData) {
        promises.push(installedChunkData[2]);
      } else {
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });
        promises.push(installedChunkData[2] = promise); // installedChunkData现在的形状是[resolve, reject, promise]

        // 创建一个src的tag
        var script = document.createElement('script');
        script.src = jsonpScriptSrc(chunkId);   
        document.head.appendChild(script);
      }
    }

    return Promise.all(promises);
  };

  let installedModules = {}                        // 1) 定义对象用于将来缓存被加载过的模块
  function __webpack_require__(moduleId) { ... }   // 2) 定义一个 __webpack_require__ 方法来替换 import require 加载操作
  __webpack_require__.m = modules                  // 3) 定义 m 属性用于保存 modules 
  __webpack_require__.c = installedModules         // 4) 定义 c 属性用于保存 cache 
  __webpack_require__.o = function (object, property) { ... }        // 5) 定义 o 方法用于判断对象的身上是否存在指定的属性
  __webpack_require__.d = function (exports, name, getter) { ... }   // 6) 定义 d 方法用于在对象的身上添加指定的属性，同时给该属性提供一个 getter 
  __webpack_require__.r = function (exports) { ... }                 // 7) 定义 r 方法用于标识当前模块是 es6 类型
  __webpack_require__.n = function (module) { ... }                  // 8) 定义 n 方法，用于设置具体的 getter 

  // 11) 定义 t 方法，用于加载指定 value 的模块内容，之后对内容进行处理再返回
  __webpack_require__.t = function (value, mode) {
    // 01 加载 value 对应的模块内容（ value 一般就是模块 id ）
    // 加载之后的内容又重新赋值给 value 变量
    if (mode & 1) {
      value = __webpack_require__(value)
    }

    if (mode & 8) {  // 加载了可以直接返回使用的内容，说明加载了cjs
      return value
    }

    // 加载es module
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) {
      return value
    }

    // 如果 8 和 4 都没有成立, 说明是另外的module，则需要自定义 ns 来通过 default 属性返回内容
    let ns = Object.create(null)

    __webpack_require__.r(ns)

    Object.defineProperty(ns, 'default', { enumerable: true, value: value })

    if (mode & 2 && typeof value !== 'string') {
      // 给每一个key都加一个getter
      for (var key in value) {
        __webpack_require__.d(ns, key, function (key) {
          return value[key]
        }.bind(null, key))
      }
    }

    return ns
  }

  // 09 定义 P 属性，用于保存资源访问路径
  __webpack_require__.p = ""

  // 10 调用 __webpack_require__ 方法执行模块导入与加载操作
  return __webpack_require__(__webpack_require__.s = './src/index.js')

})(modules)
```

# webpack源码工作流程
## webpack 入口
**两个主要步骤**
`npx webpack`
=> call一个executable文件(核心的作用就组装了`node xxx/webpack/bin/webpack.js`)
=> 核心操作就是require了`node_modules/webpack-cli/bin/cli.js`
=> `cli.js`一般有二个操作，处理参数`options`，将参数交给不同的逻辑（分发业务）

总结起来就是
- 实例化 compiler 对象（ 它会贯穿整个webpack工作的过程 ）
- 由 compiler 调用 run 方法
```ts
let complier = webpack(options)
complier.run(function (err, stats) { ... })
```

### compiler 实例化操作
- compiler继承 tapable ，因此它具备钩子的操作能力（监听事件，触发事件，webpack是一个事件流）
- 在实例化了 compiler 对象之后就往它的身上挂载很多属性，其中 NodeEnvironmentPlugin 这个操作就让它具备了文件读写的能力（我们的模拟时采用的是 node 自带的 fs )
- 具备了 fs 操作能力之后又将 plugins 中的插件都挂载到了 compiler 对象身上  
- 将内部默认的插件与 compiler 建立关系，其中 EntryOptionPlugin 处理了入口模块的 id 
- 在实例化 compiler 的时候只是监听了 make 钩子（SingleEntryPlugin)
  - 在 SingleEntryPlugin 模块的 apply 方法中有二个钩子监听
  - 其中 compilation 钩子就是让 compilation 具备了利用 normalModuleFactory 工厂创建一个普通模块的能力, 因为它就是利用一个自己创建的模块来加载需要被打包的模块 
  - 其中 make 钩子 在 compiler.run 的时候会被触发，走到这里就意味着某个模块执行打包之前的所有准备工作就完成了
  - addEntry 方法调用（）

### run 方法执行
- run 方法里就是一堆钩子按着顺序触发（beforeRun, run, compile）
- compile方法执行
  - 准备参数(其中 normalModuleFactory 是我们后续用于创建模块的)
  - 触发beforeCompile
  - 将第一步的参数传给一个函数，开始创建一个 compilation （newCompilation）
  - 在调用 newCompilation 的内部
      - 调用了 createCompilation 
      - 触发了 this.compilation 钩子 和 compilation 钩子的监听
  - 当创建了 compilation 对象之后就触发了 make 钩子
  - 当我们触发 make 钩子监听的时候，将 compilation 对象传递了过去 
### addEntry过程
- make 钩子在被触发的时候，接收到了 compilation 对象实现，它的身上挂载了很多内容
- 从 compilation 当中解构了三个值 
  entry : 当前需要被打包的模块的相对路径（./src/index.js)
  name: main 
  context: 当前项目的根路径 
- dep 是对当前的入口模块中的依赖关系进行处理 
- 调用了 addEntry 方法 
- 在 compilation实例的身上有一个 addEntry 方法，然后内部调用了 _addModuleChain 方法，去处理依赖
- 在 compilation 当中我们可以通过 NormalModuleFactory 工厂来创建一个普通的模块对象  
- 在 webpack 内部默认启了一个 100 并发量的打包操作，当前我们看到的是 normalModule.create()
- 在 beforeResolve 里面会触发一个 factory 钩子监听(这个部分的操作其实是处理 loader)
- 上述操作完成之后获取到了一个函数被存在 factory 里，然后对它进行了调用  
- 在这个函数调用里又触发了一个叫 resolver 的钩子（ 处理 loader的，拿到了 resolver方法就意味着所有的Loader 处理完毕 ）
- 调用 resolver() 方法之后，就会进入到  afterResolve 这个钩子里，然后就会触发  new NormalModule 
- 在完成上述操作之后就将module 进行了保存和一些其它属性的添加  
- 调用 buildModule 方法开始编译：调用 build => doBuild。build里面就会读取代码，用AST转换variables,代码变形替换等 (比如require => __webpack_require__ )，最后返回打包好的module

03 实现递归的操作 ，所以要将依赖的模块信息保存好，方例交给下一次 create 

### 总结 
- 实例化 compiler  
- 调用 compile 方法
- newCompilation 
- 实例化了一个compilation 对象（它和 compiler 是有关系）
- 触发 make 监听 
- addEntry 方法（这个时候就带着 context name entry  一堆的东西） 就奔着编译去了.....

## 手写mini webpack
参见手写webpack文件夹

# 其它
## Loader和Plugin的区别
### Loader
**Loader用于对模块的源代码进行转换**，可以在加载模块时预处理文件。loader可以将文件从不同的语言（如 TypeScript）转换为 JavaScript，或将内联图像转换为 data URL。

因为 webpack只能处理 JavaScript，如果要处理其他类型的文件，就需要使用 loader 进行转换，loader 本身就是一个函数，接受源文件为参数，返回转换的结果。

loader一般是输入源码，输出源码或者ast之类的对于源码的处理。比如开发一个js的parse就可以用到babylon，`parse.parse(source) => AST`

### Plugin
**Plugin是用来扩展Webpack功能的**。使用plugin丰富的自定义功能扩展以及生命周期事件，可以控制打包流程的每个环节。通过plugin，webpack可以实现loader所不能完成的复杂功能。作用于整个构建周期，实现对 webpack 的自定义功能扩展。

Plugin一般的调用方法是`new xxxPlugin().apply(compiler)`, 可以往compiler身上挂属性。比如`NodeEnvironmentPlugin`在apply的时候就是往compiler身上挂上文件读写能力（比如fs）

### 区别
loader是一个转换器，将a文件进行编译输出b文件，这里是操作文件，单纯的文件转换。
plugin是一个扩展器，它丰富了webpack本身，针对是loader结束后，webpack打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听webpack打包过程中的某些节点，执行任务

## 总结
webpack是事件驱动型事件流工作机制。主要有两个步骤：创建compiler实例和run
```ts
let complier = webpack(options)
complier.run(function (err, stats) { ... })
```

- compiler继承了tapable，因此它具备钩子的操作能力。在实例化了 compiler 对象之后就往它的身上挂载很多属性，每次调用`new Plugin().apply(compiler)`的时候
  - 就可以往compiler身上挂属性，比如NodeEnvironmentPlugin 这个操作就让它具备了文件读写的能力:`complier.inputFileSystem = fs`
  - 或者在挂钩子的cb：`compiler.hooks.entryOption.tap(...)`
- run阶段，在不同时候调用不同的钩子cb：`this.hooks.xxx.callAsync(...)`
  - 确定入口：根据配置中的 entry 找出所有的入口文件；
  - 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
  - 完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
  - 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
  - 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。


# References
拉钩教育的webpack课程
https://www.jianshu.com/p/407a82b7631b