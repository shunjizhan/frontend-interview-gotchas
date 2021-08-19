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
WeakMap 是类似于 Map 的集合，它仅允许对象作为键，并且一旦通过其他方式无法访问它们，便会将它们与其关联值一同删除。

WeakSet 是类似于 Set 的集合，它仅存储对象，并且一旦通过其他方式无法访问它们，便会将其删除。

它们都不支持引用所有键或其计数的方法和属性。仅允许单个操作。

WeakMap 和 WeakSet 被用作“主要”对象存储之外的“辅助”数据结构。一旦将对象从主存储器中删除，如果该对象仅被用作 WeakMap 或 WeakSet 的键，那么它将被自动清除。

## Object
- `Object.keys(obj)` / `Object.values(obj)` / `Object.entries(obj)` 返回一个可枚举的由自身的字符串属性名/值/键值对组成的数组。
- `Object.getOwnPropertySymbols(obj)` 返回一个由自身所有的 symbol 类型的键组成的数组。
- `Object.getOwnPropertyNames(obj)` 返回一个由自身所有的字符串键组成的数组。
- `Reflect.ownKeys(obj)` 返回一个由自身所有键组成的数组。
- `obj.hasOwnProperty(key)` obj 拥有名为 key 的自身的属性（非继承而来的），则返回 true。

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