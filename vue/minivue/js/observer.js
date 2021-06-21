class Observer {
  constructor (data) {
    this.walk(data)
  }

  walk (data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        this.defineReactive(data, key, data[key])
      })
    }
  }

  defineReactive (obj, key, val) {
    let dep = new Dep()   // 负责收集依赖，并发送通知
    this.walk(val)        // 如果val是对象，把val内部的属性转换成响应式数据

    let that = this
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,

      get () {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)

        // 这里不能直接return obj[key],不然又会递归调用get()造成无限循环
        return val
      },

      set (newValue) {
        if (newValue === val) { return }

        val = newValue
        that.walk(newValue)

        dep.notify()      // 发送通知
      }
    })
  }
}