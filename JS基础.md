
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [JS基础](#js基础)
  - [Symbol 类型](#symbol-类型)
  - [数组的方法](#数组的方法)
  - [Iterable object（可迭代对象）](#iterable-object可迭代对象)
  - [Map and Set（映射和集合）](#map-and-set映射和集合)
    - [Map —— 是一个带键的数据项的集合。](#map--是一个带键的数据项的集合)
    - [Set —— 是一组唯一值的集合。](#set--是一组唯一值的集合)
    - [WeakMap and WeakSet（弱映射和弱集合）](#weakmap-and-weakset弱映射和弱集合)
  - [Object](#object)
    - [可枚举属性](#可枚举属性)
      - [5种遍历的方式](#5种遍历的方式)
      - [遍历的顺序](#遍历的顺序)
  - [class](#class)
  - [Promise](#promise)
  - [references](#references)

<!-- /code_chunk_output -->


# JS基础
## Symbol 类型
Symbol 是唯一标识符的基本类型，Symbol 总是不同的值，即使它们有相同的名字。

如果我们希望同名的 Symbol 相等，那么我们应该使用全局注册表：Symbol.for(key) 返回或创建一个以 key 作为名字的全局 Symbol。使用 Symbol.for 多次调用 key 相同的 Symbol 时，返回的就是同一个Symbol。

Symbol 有两个主要的使用场景：
- “隐藏” 对象属性。

我们可以创建一个 Symbol 并使用它作为属性的键，Symbol属性不会出现在 for..in 中，因此它不会意外地被与其他属性一起处理。并且，它不会被直接访问，因为另一个脚本没有我们的 symbol。因此，该属性将受到保护，防止被意外使用或重写。因此我们可以使用 Symbol 属性“秘密地”将一些东西隐藏到我们需要的对象中，但其他地方看不到它。

从技术上说，Symbol 不是 100% 隐藏的。有一个内置方法 Object.getOwnPropertySymbols(obj) 允许我们获取所有的 Symbol。还有一个名为 Reflect.ownKeys(obj)的方法可以返回一个对象的所有键，包括 Symbol。所以它们并不是真正的隐藏。但是大多数库、内置方法和语法结构都没有使用这些方法。

- JavaScript 使用了许多系统 Symbol，这些 Symbol 可以作为 Symbol.X 访问。我们可以使用它们来改变一些内置行为。例如，Symbol.iterator 来进行迭代操作。

## 数组的方法
- `push(...items)` 在末端添加 items 项。
- `pop()` 从末端移除并返回该元素。
- `unshift(...items)` 从首端添加 items 项。
- `shift()` 从首端移除并返回该元素。
- `splice(pos, deleteCount, ...items)` 从 pos 开始删除 deleteCount 个元素，并插入 items。
- `slice(start, end)` 创建一个新数组，将从索引 start 到索引 end（但不包括 end）的元素复制进去。
```ts
// 注意这三个是相等的，都是深拷贝整个数组的第一层
const copy = arr.slice()
const copy = arr.slice(0)
const copy = arr.slice(0, arr.length)
```
- `concat(...items)` 返回一个新数组：复制当前数组的所有元素，并向其中添加items。如果 items中的任意一项是一个数组，那么就拍平取其元素。

遍历：
- `for (let i = 0; i < arr.length; i++)` — 运行得最快，可兼容旧版本浏览器。
- `for (let item of arr)` — 现代语法，会被编译成iterator
- `for (let i in arr)` — 永远不要用这个

转换数组：
- `map(fn)` 根据对每个元素调用 fn 的结果创建一个新数组。
- `sort(fn)` 对数组进行原位（in-place）排序，然后返回它。
- `reverse()` 原位（in-place）反转数组，然后返回它。
- `split/join` 将字符串转换为数组并返回。
- `reduce/reduceRight(fn, initial)` 通过对每个元素调用 fn 计算数组上的单个值，并在调用之间传递中间结果。

其他：
- `Array.isArray(arr)` 检查 arr 是否是一个数组。
- `some(fn)` 
- `every(fn)` 

注意，sort，reverse 和 splice 方法修改的是数组本身。

## Iterable object（可迭代对象）
可以应用 for..of 的对象被称为 可迭代的。

技术上来说，可迭代对象必须实现 Symbol.iterator 方法。

`obj[Symbol.iterator]()` 的结果被称为 迭代器（iterator）。由它处理进一步的迭代过程。

一个迭代器必须有 next() 方法，它返回一个 {done: Boolean, value: any} 对象，这里 done:true 表明迭代结束，否则 value 就是下一个值。

Symbol.iterator 方法会被 for..of 自动调用，但我们也可以直接调用它。

内置的可迭代对象例如字符串和数组，都实现了 Symbol.iterator。

有索引属性和 length 属性的对象被称为类数组（伪数组）对象。这种对象可能还具有其他属性和方法，但是没有数组的内建方法。大多数内建方法都假设它们需要处理的是可迭代对象或者类数组对象，而不是“真正的”数组，因为这样抽象度更高。

Array.from(obj[, mapFn, thisArg]) 将可迭代对象或类数组对象 obj 转化为真正的数组 Array，然后我们就可以对它应用数组的方法。可选参数 mapFn 和 thisArg 允许我们将函数应用到每个元素。

## Map and Set（映射和集合）
### Map —— 是一个带键的数据项的集合。
- `new Map([iterable])` 创建 map，可选择带有 `[key,value]` 对的 iterable（例如数组）来进行初始化。
- `map.set(key, value)` 根据键存储值。
- `map.get(key)` 根据键来返回值，如果 map 中不存在对应的 key，则返回 undefined。
- `map.has(key)` 如果 key 存在则返回 true，否则返回 false。
- `map.delete(key)` 删除指定键的值。
- `map.clear()` 清空 map 。
- `map.size` 返回当前元素个数。

与普通对象 Object 的不同点：
任何键、对象都可以作为键。有其他的便捷方法，如 size 属性。

### Set —— 是一组唯一值的集合。
- `new Set([iterable])` 创建 set，可选择带有 iterable（例如数组）来进行初始化。
- `set.add(value)` 添加一个值（如果 value 存在则不做任何修改），返回 set 本身。
- `set.delete(value)` 删除值，如果 value 在这个方法调用的时候存在则返回 true ，否则返回 false。
- `set.has(value)` 如果 value 在 set 中，返回 true，否则返回 false。
- `set.clear()` 清空 set。
- `set.size` 元素的个数。

在 Map 和 Set 中迭代总是按照值插入的顺序进行的，所以我们不能说这些集合是无序的，但是我们不能对元素进行重新排序，也不能直接按其编号来获取元素。

### WeakMap and WeakSet（弱映射和弱集合）
- WeakSet 的成员只能是对象（数组也算），而不能是其他类型的值。
- WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用。
如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存，不考虑该对象还存在于 WeakSet 之中。这是因为垃圾回收机制根据对象的可达性（reachability）来判断回收，如果对象还能被访问到，垃圾回收机制就不会释放这块内存。结束使用该值之后，有时会忘记取消引用，导致内存无法释放，进而可能会引发内存泄漏。WeakSet 里面的引用，都不计入垃圾回收机制，所以就不存在这个问题。因此，WeakSet 适合临时存放一组对象，以及存放跟对象绑定的信息。只要这些对象在外部消失，它在 WeakSet 里面的引用就会自动消失。

- WeakSet 不可遍历，没有size属性。
由于上面这个特点，WeakSet 的成员是不适合引用的，因为它会随时消失。另外，由于 WeakSet 内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此 ES6 规定 。

WeakMap同理

例子：如何保证Foo的实例方法，只能在Foo的实例上调用。
```ts
// 这里使用 WeakSet 的好处是，foos对实例的引用，不会被计入内存回收机制，所以删除实例的时候，不用考虑foos，也不会出现内存泄漏。
const foos = new WeakSet()
class Foo {
  constructor() {
    foos.add(this)
  }
  method () {
    if (!foos.has(this)) {
      throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！');
    }
  }
}
```

例子：在网页的 DOM 元素上添加数据。当该 DOM 元素被清除，其所对应的WeakMap记录就会自动被移除。
```ts
const wm = new WeakMap();
const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element) // "some information"
```

**注意:**WeakMap 弱引用的只是键名，而不是键值。键值依然是正常引用。
```ts
const wm = new WeakMap();
let key = {};
let obj = { foo: 1 };
wm.set(key, obj);

obj = null;
wm.get(key) // Object { foo: 1 }

wm.has(key);    // true
key = null;
wm.has(key);    // false
```

ES2021提供了WeakRef 对象，用于直接创建对象的弱引用。
```ts
let target = {};
let wr = new WeakRef(target);

let obj = wr.deref();   // 如果已经被清除，返回undefined
if (obj) { // target 未被垃圾回收机制清除
  // ...
}
```

例子：缓存
```ts
// 弱引用对象作为缓存，未被清除时可以从缓存取值，一旦清除缓存就自动失效。
function makeWeakCached(f) {
  const cache = new Map();
  return key => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const fresh = f(key);
    cache.set(key, new WeakRef(fresh));
    return fresh;
  };
}

const getImageCached = makeWeakCached(getImage);
```

## Object
- `Object.keys(obj)` / `Object.values(obj)` / `Object.entries(obj)` 返回一个可枚举的由自身的字符串属性名/值/键值对组成的数组。
- `Object.getOwnPropertySymbols(obj)` 返回一个由自身所有的 symbol 类型的键组成的数组。
- `Object.getOwnPropertyNames(obj)` 返回一个由自身所有的字符串键组成的数组。
- `Reflect.ownKeys(obj)` 返回一个由自身所有键组成的数组。
- `obj.hasOwnProperty(key)` obj 拥有名为 key 的自身的属性（非继承而来的），则返回 true。

### 可枚举属性
有四个操作会忽略enumerable为false的属性。
- `for...in`循环：只遍历对象自身的和继承的可枚举的属性。
- `Object.keys()`：返回对象自身的所有可枚举的属性的键名。
- `JSON.stringify()`：只串行化对象自身的可枚举的属性。
- `Object.assign()`： 忽略enumerable为false的属性，只拷贝对象自身的可枚举的属性。

#### 5种遍历的方式
- `for...in`:遍历自身 + 继承的可枚举属性（不含 Symbol 属性）。
- `Object.keys(obj)`: 返回对象自身的（不含继承）所有可枚举属性（不含 Symbol 属性）的键名。
- `Object.getOwnPropertyNames(obj)`: 返回对象自身的（不含继承）所有可枚举 + 不可枚举属性（不含 Symbol）的键名。
- `Object.getOwnPropertySymbols(obj)`: 返回对象自身的所有 Symbol 属性的键名。
- `Reflect.ownKeys(obj)`: 返回对象自身的（不含继承）所有可枚举 + 不可枚举属性（含 Symbol）的键名。

#### 遍历的顺序
- 首先遍历所有数值键，按照数值升序排列。
- 其次遍历所有字符串键，按照加入时间升序排列。
- 最后遍历所有 Symbol 键，按照加入时间升序排列。

```ts
Reflect.ownKeys({ [Symbol()]:0, b:0, 10:0, 2:0, a:0 })
// ['2', '10', 'b', 'a', Symbol()]
```


```ts
obj = new Object();
obj.show = 'showed value';
Object.prototype.protooo = 'protooo';

Object.defineProperty(obj, 'hide', {
    value: 'hidden value',
    enumerable: false,
})

obj.hasOwnProperty('show');        // true,本身的可枚举属性
obj.hasOwnProperty('hide');        // true, 本身的不可枚举属性
obj.hasOwnProperty('toString');    // false, 继承自Object.prototype.toString

Object.getOwnPropertyNames(obj);   //  ["show", "hide"]   所有自身属性
Object.keys(obj);                  //  ["show"]           自身可枚举属性

for (let key in obj) {
  console.log(key);                // show proto      所有可枚举属性，包括原型链上的
}
```

## class
```ts
class MyClass {
  prop = value;           // 属性

  constructor(...) {}     // 构造器

  method(...) {}          // method

  get something(...) {}   // getter 方法
  set something(...) {}   // setter 方法

  [Symbol.iterator]() {}  // 有计算名称（computed name）的方法（此处为 symbol）
  // ...
}
```

## Promise
Promise 类有 5 种静态方法：

- `Promise.all(promises)` 等待所有 promise 都 resolve 时，返回存放它们结果的数组。如果给定的任意一个 promise 为 reject，那么它就会变成 Promise.all 的 error，所有其他 promise 的结果都会被忽略。

- `Promise.allSettled(promises)`（ES2020 新增方法）等待所有 promise 都 settle 时，并以包含以下内容的对象数组的形式返回它们的结果：

status: "fulfilled" 或 "rejected"
value（如果 fulfilled）或 reason（如果 rejected）。

- `Promise.race(promises)` 等待第一个 settle 的 promise，并将其 result/error 作为结果。

- `Promise.resolve(value)` 使用给定 value 创建一个 resolved 的 promise。

- `Promise.reject(error)` 使用给定 error 创建一个 rejected 的 promise。

## references
- https://mp.weixin.qq.com/s/zVCB0Gj_yq_xNuRPW8a2iQ
- https://segmentfault.com/a/1190000010731448