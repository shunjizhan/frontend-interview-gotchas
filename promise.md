# promise
promise相关知识

## 手写promise
```ts
const PENDING = 'pending'; // 等待
const FULFILLED = 'fulfilled'; // 成功
const REJECTED = 'rejected'; // 失败

class MyPromise {
  constructor (executor) {
    try {
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e);
    }
  }

  status = PENDING;
  value = undefined;
  reason = undefined;
  successCallback = [];
  failCallback = [];

  resolve = value => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;

    // flush所有存起来的then()里面的cb
    while(this.successCallback.length) this.successCallback.shift()()
  }

  reject = reason => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;

    // flush所有存起来的then()里面的cb
    while(this.failCallback.length) this.failCallback.shift()()
  }

  then (successCallback, failCallback) {
    successCallback = successCallback ? successCallback : value => value;
    failCallback = failCallback ? failCallback: reason => { throw reason };

    let promsie2 = new MyPromise((resolve, reject) => {
      // 判断状态
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = successCallback(this.value);
            resolvePromise(promsie2, x, resolve, reject)
          }catch (e) {
            reject(e);
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = failCallback(this.reason);
            resolvePromise(promsie2, x, resolve, reject)
          } catch (e) {
            reject(e);
          }
        }, 0)
      } else {
        // 等待状态
        // 将成功回调和失败回调存储起来
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              resolvePromise(promsie2, x, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0)
        });

        this.failCallback.push(() => {
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              resolvePromise(promsie2, x, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0)
        });
      }
    });

    return promsie2;
  }

  finally (callback) {
    return this.then(value => {
      return MyPromise.resolve(callback()).then(() => value);
    }, reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason })
    })
  }

  catch (failCallback) {
    return this.then(undefined, failCallback)
  }

  static all (array) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addData (key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }

      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          current.then(
            value => addData(i, value),
            reason => reject(reason)
          );
        } else {
          addData(i, array[i]);
        }
      }
    })
  }

  static resolve (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }
}

// 判断 x 的值是普通值还是promise对象
// 如果是普通值 直接调用resolve 
// 如果是promise对象 查看promsie对象返回的结果 
// 再根据promise对象返回的结果 决定调用resolve 还是调用reject
function resolvePromise (promsie2, x, resolve, reject) {
  if (promsie2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (x instanceof MyPromise) {
    // promise 对象
    // x.then(value => resolve(value), reason => reject(reason));
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}


```