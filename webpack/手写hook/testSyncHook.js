const SyncHook = require('./AsyncParallelHook.js')

// AsyncParallelHook是SyncHook的超集，大部分地方都一样
// 主要的不一样就是调用codefactory产生call的时候，参数不一样

let hook = new SyncHook(['name', 'age'])

hook.tap('fn1', function (name, age) {
  console.log('fn1-->', name, age)
})

hook.tap('fn2', function (name, age) {
  console.log('fn2-->', name, age)
})

hook.call('Goku', 999)

/* ==>
  fn1--> Goku 999
  fn2--> Goku 999
*/
