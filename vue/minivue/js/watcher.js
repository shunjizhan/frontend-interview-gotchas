class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm
    this.key = key            // data中的属性名称
    this.cb = cb              // 回调函数负责更新视图

    Dep.target = this         // 把watcher对象记录到Dep类的静态属性target
    this.oldValue = vm[key]   // 触发get方法，在get方法中会调用addSub
    Dep.target = null
  }

  // 当数据发生变化的时候更新视图
  update () {
    let newValue = this.vm[this.key]
    if (this.oldValue !== newValue) {
      this.cb(newValue)
    }
  }
}