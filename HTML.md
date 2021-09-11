# HTML
HTML相关知识
## DOM
给定一个DOM node，有以下常用方法访问其它节点

对于所有节点：
- `node.parentNode`
- `node.childNodes`
- `node.firstChild`
- `node.lastChild`
- `node.previousSibling`
- `node.nextSibling`

仅对于元素节点：
- `node.parentElement`
- `node.children`
- `node.firstElementChild`
- `node.lastElementChild`
- `node.previousElementSibling`
- `node.nextElementSibling`

某些类型的 DOM 元素，例如 table，提供了用于访问其内容的其他属性和集合。

从document搜索节点有以下方法：
- `document.querySelector`
- `document.querySelectorAll`
- `document.getElementById`
- `document.getElementsByName`
- `document.getElementsByTagName`
- `document.getElementsByClassName`

## 事件捕获和冒泡
捕获和冒泡都会被执行，区别在于fn在哪个过程会被执行:
`div.addEventListener('click', fn, bool=false)` 如果bool为默认值,则让fn走冒泡，否则走捕获。

### target和currentTarget
当用户点击文字的时候:
```html
<div>                 // e.currentTarget就是div,程序员监听的元素(不推介用)
  <span>文字</span>    // e.target就是span,用户操作的元素
</div>
```

## 添加事件绑定
```ts
element.onclick = function(e) {};     // 只会在事件冒泡中运行；一个元素一次只能绑定一个事件处理函数，新绑定的事件处理函数会覆盖旧的事件处理函数
element.addEventListener('click', function(e) {}, false);     // 可以用removeEventListener取消
```

- 取消事件绑定：`element.removeEventListener('click', function(e) {}, false);`
- 阻止冒泡：`e.stopPropagation`(捕获不可以被取消，冒泡可以被取消)

## 事件委托
在JavaScript中，添加到页面上的事件处理程序数量将直接关系到页面的整体运行性能。导致这一问题的原因是多方面的。首先
- 每个函数都是对象，都会占用内存；内存中的对象越多，性能就越差。
- 必须事先指定所有事件处理程序而导致的DOM访问次数，会延迟整个页面的交互就绪时间。

对事件处理程序过多问题的解决方案就是事件委托。事件委托利用了事件冒泡，只指定一个事件处理程序，就可以管理某一类型的所有事件。例如，click事件会一直冒泡到document层次。也就是说，我们可以为整个页面指定一个onclick事件处理程序，而不必给每个可单击的元素分别添加事件处理程序.

优点：方便统一管理，提高页面性能，可以监听动态元素

例子：给100个li添加事件监听
```html
// html代码
<div id="div1">
 <button data-id="1">1</button>
 <button data-id="2">2</button>
 <!-- ... -->
</div>

<script>
div1.addEventListener('click', e => {
  const t = e.target;
  if(t.tagName.toLowerCase() === 'button') {
      console.log('button'被点击了)
      console.log('button'内容是 + t.textContext)      // 获取被点击元素的文本内容
      console.log('button 的data-id是:'+ t.dataset.id) // 获取被点击元素的dataset.id
  }
})
</script>
```

注意：以上讲的是DOM的事件，JS只是调用了DOM提供的addEventListener方法，其实JS不支持事件，除非开发者手写一个事件系统。
## references
- https://mp.weixin.qq.com/s/zVCB0Gj_yq_xNuRPW8a2iQ
- https://juejin.cn/post/6844904194629959693