# Vue Route
## hash route和history route的区别
`xxx.com/#/playlist?id=123`
- hash模式是基于锚点，以及onhashchange事件 （不需要服务器支持）

`xxx.com/playlist/123`
- history模式是基于html5中的History API (需要服务器支持)
  - history.pushState()
  - history.replaceState()

hash兼容性更好，history不兼容ie<9

## 手写route
```ts
let _Vue = null
class VueRouter {
  static install(Vue) {
    //1 判断当前插件是否被安装
    if (VueRouter.install.installed) {
      return;
    }
    VueRouter.install.installed = true

    //2 把Vue的构造函数记录在全局
    _Vue = Vue

    //3 把创建Vue的实例传入的router对象注入到Vue实例
    // _Vue.prototype.$router = this.$options.router
    _Vue.mixin({
      beforeCreate() {
        // 如果是组件就不执行，是vue实例就执行
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
        }
      }
    })
  }

  constructor(options) {
    this.options = options
    this.routeMap = {}
    this.data = _Vue.observable({
      current: "/"
    })
    this.init()
  }

  init() {
    this.createRouteMap()
    this.initComponent(_Vue)
    this.initEvent()
  }

  createRouteMap() {
    //遍历所有的路由规则 吧路由规则解析成键值对的形式存储到routeMap中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    });
  }

  initComponent(Vue) {
    Vue.component("router-link", {
      props: {
        to: String
      },
      render(h) {
        return h("a", {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickhandler
          }
        }, [this.$slots.default])
      },
      methods: {
        // this是router-link的实例，也是一个vue的实例，
        // 之前在mixin挂载了$router
        clickhandler(e) {
          history.pushState({}, "", this.to)
          this.$router.data.current = this.to     // 响应式更新当然组件
          e.preventDefault()                      // 不要向服务器发送请求
        }
      }
      // template:"<a :href='to'><slot></slot><>"
    })

    const self = this
    Vue.component("router-view", {
      render(h) {
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  initEvent() {
    // 浏览器前进后退功能，点击前进后退会触发popstate
    window.addEventListener("popstate", () => {
      // 箭头函数 => 不会改变this，绑定的是initEvent的this => VueRouter的this
      this.data.current = window.location.pathname
    })
  }
}
```