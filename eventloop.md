# eventloop
## 什么是event loop
`Javascript runtime` refers to where javascript code is executed, such as google chrome, in which case the `Javascript engine` is `v8`. All JavaScript engines implement specification of the language provide by ECMAScript, such engine works inside a `JS Runtime`， which provides **additional features** to our scripts. For example, V8 does not have `WebAPIs`, which are given by runtime. In chrome browser JS runtime, browser provides `WebAPIs`, while in `Node` runtime, `WebAPIs` are given by C++ libraries. Other broswer JS runtime features are `AJAX`, and the `DOM tree` (node runtime doesn't have them).

Javascript code is executed in **single thread**, but JS runtime is not: thread pool exists in JS runtime.

JS code is first converted to machine code by the JS engine. `memory heap` (in JS engine) stores all the variables and `call stack` (in JS engine) stores the actionable item such as function calls. `call stack` executes single-threaded with LIFO order, and when it sees a web api call, such as event listeners, HTTP/AJAX requests, or timing functionsit, it sends it to the `web api container` and pops it of from the stack. After a task in web api container is finished, it could put callbacks into the `callback queue`. The `event loop` will keep running and whenever the call stack is empty, it will pop callbacks from the callback queue (FIFO) and added it to the call stack.

Javascript can only execute one function at a time, whatever is at top of the stack, it is a `synchronous` language. But because of the JS running task scheduling, it has the ability to run in an `aync` manner, yet still being a `sync` language, this is very cool!
A huge advantage is that JS is an `non-blocking language`, since most blocking executions (such as I/O) is performed via events and callbacks, and is mostly handled in JS run time, so won't block the main thread (call stack). If anything goes wrong, such as the server never respond, JS running will just never put a callback into the call back queue, and the main thread won't care about it.

Note that in a `setTimeout` call which waits for x seconds, the callback is put to the callback queue after x seconds, but won't execuete until the call stack is empty.
```js
setTimeout(() => console.log('!!!'), 0);  // will never console log!
while (true) {}
```

ES6 also introdeced `job queue`, which is reserved for `promise` (and `async/await`). Job queue has high priority in executing callbacks, compared to callback queue, so `thenable` callbacks will be excuted prior to other callbacks.

```js
console.log('start');

setTimeout(() => console.log('timeout'), 0);
Promise
  .resolve('promise')
  .then(console.log)

console.log('end');

/* ==>
  start
  end
  promise
  timeout   // 在chrome console里面打不出来timeout奇怪了
*/
```

comparison of microtask and callbacks (TODO: still need more understanding)
```js
// 不会让浏览器卡死
function foo() {
  setTimeout(foo, 0);
}
foo();

// 会让浏览器卡死
function foo() {
  return Promise.resolve().then(foo);
}
foo();
```

### 中文简洁版
JS引擎（比如V8）在JS运行时（比如node和浏览器）中运行，运行时主要提供额外的WebAPI和DOM API（比如event listeners, DOM tree， HTTP/AJAX）。
- JS引擎是单线程运行的，但JS运行时是多线程的。
- JS引擎里的call stack存着所有的function call，JS引擎里memory heap存着变量。
- 当call stack遇到web api的调用时，就会丢给web api container去处理，web api container在另外的线程中处理完以后，会把结果存在callback queue里面。event loop就是指每当call stack空了以后，就会检查callback queue，如果有回调函数，就拿出来装到call stack里面处理。
- cb任务也分优先级，其中微任务比宏任务有更高的优先级。
- JS是同步的语言，只有一个call stack，只能执行call stack顶部的函数。但event loop的存在让JS能以类似异步的方式执行，这是非常酷的事情。这样一个很大的优势就是，JS里面很多的blocking executions阻塞任务（比如I/O）都会通过web api用异步的方式执行，通过事件和回调的方式与JS主线程交互，这样就避免了阻碍主线程的call stack。如果阻塞的任务出错了，就永远不会回到callback queue（比如server永远不回应），也不会对主线程产生任何影响。

## event loop的执行顺序
- 首先执行 script 宏任务
- 执行同步任务，遇见微任务进入微任务队列，遇见宏任务进入宏任务队列
- 当前宏任务执行完出队（一般一开始就是整个script），检查微任务列表，有则依次执行，直到全部执行完
- 执行浏览器 UI 线程的渲染工作
- 检查是否有Web Worker任务，有则执行
- 执行下一个宏任务，回到第二步，依此循环，直到宏任务和微任务队列都为空

微任务包括：
- MutationObserver
- Promise.then()或catch()
- Promise为基础开发的其它技术，比如fetch API
- V8的垃圾回收过程
- Node独有的process.nextTick
- Object.observe（已废弃；Proxy 对象替代）

宏任务包括：
- script
- setTimeout
- setInterval
- setImmediate
- I/O
- UI rendering
- postMessage 
- MessageChannel

几个需要注意的点：
- Promise 构造函数是同步执行的， then 方法是异步执行的
- `.then` 或者 `.catch` 的参数期望是函数，传入非函数则会发生值透传
- Promise的状态一经改变就不能再改变，构造函数中的 resolve 或 reject 只有第一次执行有效，多次调用没有任何作用
- `.then`方法是能接收两个参数的，第一个是处理成功的函数，第二个是处理失败的函数，再某些时候你可以认为catch是.then第二个参数的简便写法
- 当遇到 `promise.then` 时， 如果当前的 Promise 还处于 pending 状态，我们并不能确定调用 resolved 还是 rejected ，只有等待 promise 的状态确定后，再做处理，所以我们需要把我们的两种情况的处理逻辑做成 callback 放入 promise 的回调数组内，当 promise 状态翻转为 resolved 时，才将之前的 promise.then 推入微任务队列

### 题目
```ts
var date = new Date() 

console.log(1, new Date() - date) 

setTimeout(() => {
    console.log(4, new Date() - date)
}, 500) 

Promise.resolve().then(() => console.log(3, new Date() - date)) 

while(new Date() - date < 1000) {} 

console.log(2, new Date() - date)

/*
1 0 （同步任务）
等一秒以后……
2 1000（同步任务）
3 1000（微任务）
4 1011（宏任务）
*/
```

```ts
var promise = new Promise((resolve, reject) => {
  console.log(1)
  resolve()
  console.log(2)
})
promise.then(()=>{
  console.log(3)
})
console.log(4)

/*
  1 （同步）
  2 （同步）
  4 （同步）
  3 （微）

executor是同步执行的，所以先1，2
然后遇到then，保存回调成一个微任务
执行4的同步任务
宏任务执行完毕，执行微任务3
*/
```

```ts
var promise = new Promise((resolve, reject) => {
    console.log(1)
})
promise.then(()=>{
    console.log(2)
})
console.log(3)

/*
  1
  3

注意这里2不会打印因为promise根本没有resolve
*/
```

```ts
var promise = new Promise((resolve, reject) => {
    console.log(1)
})
promise.then(console.log(2))
console.log(3)
/*
  1
  2
  3

then里面如果不是传入一个函数，会自动默认成val => val，如果传入的不是一个回调函数，而是函数调用，会直接执行，所以console.log会直接执行。这点跟react里面如果event handler是直接函数调用，是类似的效果。
*/
```

```ts
Promise.resolve(1) 
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)

/*
  1

  第一行promise已经resolve了，后面两行没有返回结果，所以直接把resolve的结果穿透到最下面.
*/

// 如果中途的then函数中return了结果，就会把这个结果传递下去，取代之前的结果。
Promise.resolve(1) 
  .then(() => 2)
  .then(Promise.resolve(3))
  .then(console.log)    // 2

Promise.resolve(1) 
  .then(() => 2)
  .then(() => Promise.resolve(3))
  .then(console.log)    // 3
```

```ts
var promise = new Promise((resolve, reject) => {
    console.log(1)
    resolve()
    reject()
})
promise.then(()=>{
    console.log(3)
}).catch(()=>{
    console.log(4)
})
console.log(2)

/*
  1
  2
  3   // 已经resolve的promise状态不可再改变，所有reject 4没用。
*/
```

```ts
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });

/*
  1
  2
*/
```

```ts
setTimeout(() => {
  console.log(1)
})
Promise.resolve().then(() => {
  console.log(2)
})
console.log(3)

/*
  3 （同步）
  2 （微）
  1 （宏）
*/
```

```ts
var promise = new Promise((resolve, reject) => {
  console.log(1)
  setTimeout(() => {
    console.log(2)
    resolve()
  }, 1000)
})

promise.then(() => {
  console.log(3)
})
promise.then(() => {
  console.log(4)
})
console.log(5)

/*
  1（同步）
  5（同步）
  等一秒……
  2（宏）
  3（第二级任务）
  4（第二级任务）

展开解释一下3和4：当遇到 promise.then 时，如果当前的 Promise 还处于 pending 状态，我们并不能确定调用 resolved 还是 rejected ，只有等待 promise 的状态确定后，再做处理，所以我们需要把我们的两种情况的处理逻辑做成 callback 放入 promise 的回调数组内，当 promise 状态翻转为 resolved 时，才将之前的 promise.then 推入微任务队列

*/
```

```ts
/*

*/
```

## references
- https://mp.weixin.qq.com/s/9zQ5nEsk4SQuzc2reUPasg