const AsyncParallelHook = require('./AsyncParallelHook.js')
// const { AsyncParallelHook } = require('tapable')

let hook = new AsyncParallelHook(['name', 'age'])

hook.tapAsync('fn1', function (name, age, callback) {
  console.log('fn1-->', name, age)
  callback()
})

hook.tapAsync('fn2', function (name, age, callback) {
  console.log('fn2-->', name, age)
  callback()
})

hook.callAsync('Goku', 999, function () {
  console.log('end----')
})

/* ==>
  fn1--> Goku 999
  fn2--> Goku 999
  end----
*/