# Vuex
Vue 最核心的两个功能：**数据驱动**和**组件化**。
组件化开发给我们带来了 
- 更快的开发效率
- 更好的可维护性

状态管理包含以下几个部分 
- **state** 驱动应用的数据源 
- **view** 以声明方式将 state 映射到视图
- **actions** 响应在 view 上的用户输入导致的状态变化。

```ts
new Vue({
  // state
  data () {
    return { count: 0 }
  },

  // view
  template: `<div>{{ count }}</div>`,

  // actions
  methods: {
    increment () { this.count++ }
  }
})
```

![状态](/assets/状态.jpg)

## 组件通信
三种方式
- 父传子: props down
- 子传父: event up
- 非父子: event bus
![组件通信](/assets/组件通信.jpg)


### 父传子: props down
```ts
// 子组件
Vue.component('blog-post', {
  props: ['title'],   // 父组件可以传title下来
  template: '<h3>{{ title }}</h3>'
})
```

```html
<!-- 父组件 -->
<blog-post title="My journey with Vue"></blog-post>
```

### 子传父: event up
子组件使用`$emit`发布一个事件，父组件会通过`v-on`监听
```html
<!-- 子组件 -->
<button v-on:click="$emit('enlargeText', 0.1)">
  Enlarge text
</button>

<!-- 父组件 -->
<blog-post v-on:enlargeText="hFontSize += $event"></blog-post>
```

### 非父子: event bus
用一个共享的`eventbus`来传递数据，eventbus其实就是一个Vue实例
在需要通信的两端：
- 使用`$on`订阅
- 使用`$emit`发布
```ts
const bus = new Vue()   // 实操上可以extract到eventbus.js

// 订阅端
bus.$on('eventName', data => { ... })

// 发布端
bus.$emit('eventName', data);
```

### 其它方法（不推介）：父直接访问子组件，通过ref获取子组件
`ref`有两个作用 
- 如果作用到普HTML标签上, 则获取到的是 DOM
- 如果作用到组件标签上，则获取到的是组件实例

例子
```html
<!-- base-input组件 -->
<template>
  <input ref="input">
</template>
<script>
export default {
  methods: {
    focus: function () {
      this.$refs.input.focus()
    }
  }
}
</script>
```
父组件使用`base-input`的时候
```html
<base-input ref="usernameInput"></base-input>
```
父组件渲染完以后，可以用`this.$refs.usernameInput`拿到子组件`base-input`,`base-input`的`focus()`又会通过`refs`操作自己的`input`，
```ts
mounted () {
  this.$refs.usernameInput.focus()
}
```

`$refs` 只会在组件渲染完成之后生效 并且它们不是响应式的。 仅作为一个用于直接操作子组件的“逃生舱”，应该尽量避免使用。

### 问题
当遇到复杂的状态管理，比如多个组件需要共享状态的时候，以上解决方案就出现问题
- read：**多个视图依赖同一个状态**。这一般会导致多层组件嵌套，而且兄弟组件之间状态传递也非常不方便。
- write：**来自不同视图的行为需要更新同一个状态**。我们经常会采用父子组件直接引用，或通过事件变更和同步状态的多份拷贝。

以上的这些解决模式都非常脆弱，通常会导致太复杂和无法维护的代码。

### 解决办法
把组件的共享状态抽取出来，以一个全局单例模式管理。

我们可以把多个组件的状态，甚至整个程序的状态放到一个集中的位置存储。任何组件都能获取状态或触发行为，并且可以检测到数据的变更。

接着我们继续延伸约定，组件不允许直接更改store里面的state，而是需要通过action来分发(dispatch)事件通知store去更新state。这样做的好处：
- 我们能够记录所有store里面的state变更以及事件，这样能实现保存状态快照，历史回滚/时光机等先进调试工具
- 每次state更新都是一个reduce，reducer更方便测试，保证state update的稳定性，正确性。

## Vuex
