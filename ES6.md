
@import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false}

<!-- code_chunk_output -->

- [ES6+ 相关知识](#es6-相关知识)
  - [Let Const Var](#let-const-var)
    - [块级作用域](#块级作用域)
      - [Why块级作用域](#why块级作用域)
      - [What块级作用域](#what块级作用域)
      - [块级作用域与函数声明](#块级作用域与函数声明)
      - [几个细节](#几个细节)
    - [不会有变量提升](#不会有变量提升)
    - [暂时性死区](#暂时性死区)
    - [const](#const)
  - [ES6几个特性](#es6几个特性)
    - [变量声明](#变量声明)
    - [顶层对象的属性](#顶层对象的属性)
      - [globalThis](#globalthis)
  - [箭头函数](#箭头函数)
  - [ES6新的一些API](#es6新的一些api)
    - [Array.prototype.includes()](#arrayprototypeincludes)
    - [Array.prototype.flat()](#arrayprototypeflat)
    - [Promise.prototype.finally()](#promiseprototypefinally)
    - [Object.values()，Object.entries()](#objectvaluesobjectentries)
    - [Object.fromEntries()](#objectfromentries)
    - [Function.prototype.toString()](#functionprototypetostring)
    - [for await of](#for-await-of)
    - [spread syntax](#spread-syntax)
    - [BigInt](#bigint)
  - [ES6模块化](#es6模块化)
    - [严格模式](#严格模式)
    - [一些性质](#一些性质)
    - [复合写法](#复合写法)
    - [动态加载](#动态加载)
    - [加载规则](#加载规则)
    - [ES6 模块与 CommonJS 模块的差异](#es6-模块与-commonjs-模块的差异)
  - [cjs和mjs](#cjs和mjs)
    - [cjs加载esm](#cjs加载esm)
    - [esm加载cjs](#esm加载cjs)
    - [同时支持两种格式的模块](#同时支持两种格式的模块)
    - [内部变量](#内部变量)
  - [总结](#总结)
  - [references](#references)

<!-- /code_chunk_output -->


# ES6+ 相关知识
## Let Const Var
### 块级作用域
#### Why块级作用域
ES5 只有全局作用域和函数作用域，没有块级作用域，这带来很多不合理的场景。 

- 变量提升导致内层的tmp变量覆盖了外层的tmp
```ts
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';    // 变量提升
  }
}

f(); // undefined
```

- 用来计数的循环变量泄露为全局变量,经典的bug场景
```ts
var s = 'hello';

// 变量i只想用来控制循环，但是循环结束后，它并没有消失，泄露成了全局变量。
for (var i = 0; i < s.length; i++) {
  console.log(s[i]);
}

console.log(i); // 5
```

#### What块级作用域
ES6新增了块级作用域，代码块不受内层代码块的影响。let和const所声明的变量，只在命令所在的代码块内有效。
```ts
{
  let a = 10;
  var b = 1;
}

a // ReferenceError: a is not defined.
b // 1

function f1() {
  let n = 5;
  if (true) {
    let n = 10;
  }
  console.log(n); // 5
}
```
所以就可以完美解决上面提到的问题
```ts
for (let i = 0; i < 10; i++) {}
console.log(i);   // ReferenceError: i is not defined, 完全不会污染外部作用域
```
另外，因为let只在自己的块级作用域里有效，可以用let做出类似闭包的解决方案：
```ts
// 经典bug，全局只有一个i，所以会互相污染。
var a = [];
for (var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 10

// 用let解决，每个循环里面的let都只在自己这个块里面有效，所以不会互相污染。
var a = [];
for (let i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i);
  };
}
a[6](); // 6
```
另外，for循环有一个特别之处，就是设置循环变量的那部分是一个父作用域，而循环体内部是一个单独的子作用域。
```ts
for (let i = 0; i < 3; i++) {
  let i = 'abc';    // 这里面是单独的作用域，不会影响到外层的i
  console.log(i);
}
// abc
// abc
// abc
```

块级作用域的出现，实际上使得获得广泛应用的匿名立即执行函数表达式（匿名 IIFE）不再必要了。
```ts
// IIFE 写法
(function () {
  var tmp = 1;
}());

// 块级作用域写法
{
  let tmp = 1;
}
```

#### 块级作用域与函数声明
ES5 规定，函数只能在顶层作用域和函数作用域之中声明，不能在块级作用域声明。

但是，浏览器没有遵守这个规定，为了兼容以前的旧代码，还是支持在块级作用域之中声明函数。

ES6 引入了块级作用域，明确允许在块级作用域之中声明函数。ES6 规定，块级作用域之中，函数声明语句的行为类似于let，在块级作用域之外不可引用。

但是，ES6又规定，浏览器的实现可以不遵守上面的规定，有自己的行为方式。

**所以结论是**：考虑到环境导致的行为差异太大，应该避免在块级作用域内声明函数。如果确实需要，也应该写成函数表达式，而不是函数声明语句。
```ts
// 块级作用域内部的函数声明语句，建议不要使用,因为不同的环境可能导致不同的行为（浏览器可以把f当做let也可以var，所以会不会变量提不提升呢？不知道）
{
  let a = 'secret';
  function f() {
    return a;
  }
}

// 块级作用域内部，优先使用函数表达式，这样确定了行为
{
  let a = 'secret';
  let f = function () {
    return a;
  };
}
```

#### 几个细节
let不允许在相同作用域内，重复声明同一个变量。
```ts
// 不报错
function func() {
  var a = 10;
  var a = 1;
}

function func() {
  let a = 10;
  var a = 1;    // SyntaxError: Identifier 'a' has already been declared
}

function func() {
  let a = 10;
  let a = 1;    // SyntaxError: Identifier 'a' has already been declared
}
```

因此，不能在函数内部第一层重新声明参数。
```ts
function func(arg) {
  let arg;    // SyntaxError: Identifier 'arg' has already been declared
}

// 不报错
function func(arg) {
  { let arg; }
}
func() 
```

ES6 的块级作用域必须有大括号，如果没有大括号，JavaScript 引擎就认为不存在块级作用域。
```ts
// SyntaxError: Lexical declaration cannot appear in a single-statement context
if (true) let x = 1;

// 正常写法，不报错
if (true) {
  let x = 1;
}
```

函数声明也是如此，严格模式下，函数只能声明在当前作用域的顶层。
```ts
// 不报错
'use strict';
if (true) {
  function f() {}
}

// SyntaxError: In strict mode code, functions can only be declared at top level or inside a block.
'use strict';
if (true)
  function f() {}
```

### 不会有变量提升
var命令会发生“变量提升”现象，即变量可以在声明之前使用，值为undefined。这种现象多多少少是有些奇怪的，按照一般的逻辑，变量应该在声明语句之后才可以使用。
为了纠正这种现象，let命令改变了语法行为，它所声明的变量一定要在声明后使用，否则报错。
```ts
console.log(foo); // undefined
var foo = 2;

// let 的情况
console.log(bar); // ReferenceError: bar is not defined
let bar = 2;
```

### 暂时性死区
只要块级作用域内存在let命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。
在块级作用域内，使用let命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”（temporal dead zone，简称 TDZ）。
```ts
var x = 123;
if (true) {
  x = 'abc';  // ReferenceError: Cannot access 'x' before initialization
  let x;
}
```

在没有let之前，typeof运算符是百分之百安全的，永远不会报错。“暂时性死区”也意味着typeof不再是一个百分之百安全的操作。
```ts
typeof y  // "undefined"

typeof x  // ReferenceError: x is not defined
let x
```
比较隐蔽的死区例子
```ts
function bar(x = y, y = 2) {
  return [x, y];
}

bar();  // ReferenceError: Cannot access 'y' before initialization

// 这样写就可以
function bar(x = 2, y = x) {
  return [x, y];
}
bar(); // [2, 2]
```

同样的，因为暂时性死区的概念，使用let声明变量时，只要变量在还没有声明完成前使用，就会报错。
```ts
var x = x;  // 不报错
let x = x;  // ReferenceError: x is not defined
```

### const
const声明一个只读的常量。一旦声明，常量的值就不能改变。这同时意味着，const一旦声明变量，就必须立即初始化，不能留到以后赋值。
```ts
const PI = 3.1415;
PI = 3;     // TypeError: Assignment to constant variable.

const foo;  // // SyntaxError: Missing initializer in const declaration
```
const和let在作用域上基本相同：
- 只在声明所在的块级作用域内有效。
- 不存在变量提升
- 存在暂时性死区

const实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动。对于简单类型的数据（数值、字符串、布尔值），值就保存在变量指向的那个内存地址，因此等同于常量。但对于复合类型的数据（主要是对象和数组），变量指向的内存地址，保存的只是一个指向实际数据的指针，const只能保证这个指针是固定的（即总是指向另一个固定的地址），至于它指向的数据结构是不是可变的，就完全不能控制了
```ts
const foo = {};

foo.prop = 123;
foo.prop // 123

foo = {}; // TypeError: "foo" is read-only
```

如果真的想将对象冻结，应该使用Object.freeze方法。
```ts
const foo = Object.freeze({});

// 常规模式时，下面一行不起作用(但不会报错)
// 严格模式时，该行会报错
foo.prop = 123;

// 除了将对象本身冻结，对象的属性也应该冻结
var constantize = obj => {
  Object.freeze(obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      constantize( obj[key] );
    }
  });
};
```

## ES6几个特性
### 变量声明
- ES5 只有两种声明变量的方法：var命令和function命令。
- ES6 除了添加let和const命令，另外两种声明变量的方法：import命令和class命令。所以，ES6 一共有 6 种声明变量的方法。

### 顶层对象的属性
顶层对象，在浏览器环境指的是window对象，在 Node 指的是global对象。ES5 之中，顶层对象的属性与全局变量是等价的。

顶层对象的属性与全局变量挂钩，其实是不太好的设计：
- 没法在编译时就报出变量未声明的错误，只有运行时才能知道（因为全局变量可能是顶层对象的属性创造的，而属性的创造是动态的）
- 程序员很容易不知不觉地就创建了全局变量（比如打字出错）
- 顶层对象的属性是到处可以读写的，这非常不利于模块化编程。
- window对象有实体含义，指的是浏览器的窗口对象，顶层对象是一个有实体含义的对象，也是不合适的。

ES6 为了改变这一点，一方面规定，为了保持兼容性，var命令和function命令声明的全局变量，依旧是顶层对象的属性；另一方面规定，let命令、const命令、class命令声明的全局变量，不属于顶层对象的属性。也就是说，从 ES6 开始，全局变量将逐步与顶层对象的属性脱钩。
```ts
var a = 1;
// 如果在 Node 的 REPL 环境，可以写成 global.a
// 或者采用通用方法，写成 this.a
window.a  // 1

let b = 1;
window.b  // undefined
```

#### globalThis
JavaScript 语言存在一个顶层对象，它提供全局环境（即全局作用域），所有代码都是在这个环境中运行。但是，顶层对象在各种实现里面是不统一的。
- 浏览器里面，顶层对象是window，但 Node 和 Web Worker 没有window。
- 浏览器和 Web Worker 里面，self也指向顶层对象，但是 Node 没有self。
- Node 里面，顶层对象是global，但其他环境都不支持。

同一段代码为了能够在各种环境，都能取到顶层对象，现在一般是使用this关键字，但是有局限性。
- 全局环境中，this会返回顶层对象。但是，Node.js 模块中this返回的是当前模块，ES6 模块中this返回的是undefined。
- 函数里面的this，如果函数不是作为对象的方法运行，而是单纯作为函数运行，this会指向顶层对象。但是，严格模式下，这时this会返回undefined。

很难找到一种方法，可以在所有情况下，都取到顶层对象。
```ts
// 勉强可以使用的方法
var getGlobal = function () {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};
```

ES2020 在语言标准的层面，引入`globalThis`作为顶层对象。也就是说，任何环境下，globalThis都是存在的，都可以从它拿到顶层对象，指向全局环境下的this。

垫片库global-this模拟了这个提案，可以在所有环境拿到globalThis。
## 箭头函数
具体用法略

几个注意点：
- 箭头函数没有自己的this对象（详见下文）。
- 不可以当作构造函数，也就是说，不可以对箭头函数使用new命令，否则会抛出一个错误。
- 不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
- 不可以使用yield命令，因此箭头函数不能用作 Generator 函数。

对于普通函数来说，内部的this指向函数运行时所在的对象，但是这一点对箭头函数不成立。它没有自己的this对象，内部的this就是定义时上层作用域中的this。也就是说，箭头函数内部的this指向是固定的，相比之下，普通函数的this指向是可变的。

```ts
function foo() {
  setTimeout(() => {
    console.log(this.id);     // this永远指向foo的this
  }, 100);

  setTimeout(function () {
    console.log(this.id); 
  }, 200);
}

var id = 1;
foo.call({ id: 2 });      // 2 1      { id: 2 }.foo()
foo();                    // 1 1      window.foo()
```
```ts
var s1 = 0
var s2 = 0
function Timer() {
  this.s1 = 0;
  this.s2 = 0;
  setInterval(() => this.s1++, 1000);   // 绑定定义时所在的作用域（Timer),this就是Timer的this
  setInterval(function () {   // 指向运行时所在的作用域（这个例子中即全局对象）,this就是window
    this.s2++;
  }, 1000);
}

const timer = new Timer();

setTimeout(() => {
  console.log(timer.s1);    // 3
  console.log(timer.s2);    // 0
  console.log(s1);          // 0
  console.log(s2);          // 3
}, 3100);
```

箭头函数实际上可以让this指向固定化，绑定this使得它不再可变，这种特性很有利于封装回调函数和事件处理。
```ts
var handler = {
  id: '123456',

  init: function() {
    document.addEventListener(
      'click',
      // 这里this永远绑定了上下文init()的this，因为是handler.init(),所以init()的this指向。handler
      // 这里如果用普通函数，那this就会指向document，因为会是document调用这个回调函数？
      event => this.doSth(event),   
      false,
    );
  },

  doSth: function(type) {
    console.log('Handling ' + type  + ' for ' + this.id);
  }
};
```

**为什么不能用作构造函数？**
箭头函数根本没有自己的this，导致内部的this就是外层代码块的this。正是因为它没有this，所以也就不能用作构造函数。当然，表面的原因是因为，箭头函数没有prototype,自然找不到constructor。
```

```

## ES6新的一些API
### Array.prototype.includes()
```js
const arr = [1, 3, 5, 2, '8', NaN, -0]
arr.includes(1)     // => true
arr.includes(1, 2)  // => false 该方法的第二个参数表示搜索的起始位置，默认为0
arr.includes('1')   // => false
arr.includes(NaN)   // => true
arr.includes(+0)    // => true

// before ES7 we can do
if (arr.indexOf(el) !== -1) {}
// problem: internally it uses ===, so won't find NaN
[NaN].indexOf(NaN)  // => -1
```

### Array.prototype.flat()
```js
newArray = arr.flat(depth)  // depth deault to 1 

const nums = [1, 2, [3, 4, [5, 6]]]
console.log(nums.flat())   // => [1, 2, 3, 4, [5, 6]]
console.log(nums.flat(2))  // => [1, 2, 3, 4, 5, 6]
```

### Promise.prototype.finally()
`.finally()` provides a way for code to be run whether the promise was fulfilled successfully or rejected once the Promise has been dealt with.

Previously in order to implement `finally()` logic, we need to repeat same code in both `then()` and `catch()`. 
```js
fetch('https://www.google.com')
  .then(response => {
    console.log(response.status);
  })
  .catch(error => { 
    console.log(error);
  })
  .finally(() => { 
    document.querySelector('#spinner').style.display = 'none';
  });
```
### Object.values()，Object.entries()
```js
const obj = { foo: 'bar', baz: 42 };
Object.values(obj)  // => ["bar", 42]

const obj = { 100: 'a', 2: 'b', 7: 'c' };
Object.values(obj)  // => ["b", "c", "a"]
// note from above that if key is a number, then the result order is from small key number to large

const obj = { foo: 'bar', baz: 42 };
Object.entries(obj) // => [ ["foo", "bar"], ["baz", 42] ]

const obj = { 10: 'xxx', 1: 'yyy', 3: 'zzz' };
Object.entries(obj);    // => [['1', 'yyy'], ['3', 'zzz'], ['10': 'xxx']]

/* ----- 数组也有这几个方法，虽然不太常用 ----- */
for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```

### Object.fromEntries()
```js
const object = { x: 23, y: 24 };
const entries = Object.entries(object);      // => [['x', 23], ['y', 24]]
const result = Object.fromEntries(entries);  // => { x: 23, y: 24 }
```

example: filter all pairs that has value > 21
```js
const obj = {
  a: 21,
  b: 22,
  c: 23
}
const res = Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => v > 21)
);
```

### Function.prototype.toString()
this is helpful in printing the whole function source code
```js
function sum(a, b) {
  return a + b;
}

console.log(sum.toString());
/* ==>
  function sum(a, b) {
    return a + b;
  }
*/

```

### for await of
suppose we have a wait function that will resolve after some given time.
```js
function wait(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(time)
    }, time)
  })
}
```

if we have 3 asnyc tasks, and want their results in order (as order as their index in the array), `for of` won't iterate them in the correct order. It will continue iterating regarless if the promise is resolved.
```js
(async function test() {
  let arr = [wait(2000), wait(100), wait(3000)]
  for (let item of arr) {
    console.log(Date.now(), item.then(console.log))
  }
})();
/* ==>
    1578088713192 Promise {<pending>}
    1578088713192 Promise {<pending>}
    1578088713192 Promise {<pending>}
    100
    2000
    3000
*/
```

`for await of` won't continue iterating until last promise changed state, which is what we want.
```js
(async function test() {
  let arr = [wait(2000), wait(100), wait(3000)]
  for await (let item of arr) {
    console.log(Date.now(), item)
  }
})();
/* ==>
    1578088826764 2000
    1578088826765 100
    1578088827765 3000
*/
```

### spread syntax
`ES6` features
```js
// copy
const arr1 = [10, 20, 30];
const copy = [...arr1];
console.log(copy);      // => [10, 20, 30]

// merge
const arr2 = [40, 50];
const merge = [...arr1, ...arr2];
console.log(merge);     // => [10, 20, 30, 40, 50]

// 拆解
console.log(Math.max(...arr));    // => 30
```

`ES9` features
```js
const input = {
  a: 1,
  b: 2,
  c: 1
}
const output = {
  ...input,
  c: 3               // if there is same key, last one will win
}
console.log(output)  // => { a: 1, b: 2, c: 3 }
```

spread operator is shallow copy
```js
const obj = { x: { y: 10 } };
const copy1 = { ...obj };    
const copy2 = { ...obj }; 
obj.x.y='xxx'
console.log(copy1, copy2) // => x: { y: "xxx" }   x: { y: "xxx" }
console.log(copy1.x === copy2.x);    // => true
```

"rest" spread operator can only be put at last
```js
const input = {
  a: 1,
  b: 2,
  c: 3
}
let { a, ...rest } = input
console.log(a, rest) // => 1  { b: 2, c: 3 }
```

### BigInt
JS can't preserve precision for n > 2^53
It also can't denote n > 2^1024, which will return `Infinity`
```js
Math.pow(2, 53) === Math.pow(2, 53) + 1   // => true
Math.pow(2, 1024)                         // => Infinity
```

`Bitint` can precisely denote any big int, just add 'n' to an int
```js
const aNumber = 111;
const aBigInt = BigInt(aNumber);
aBigInt === 111n            // => true
typeof aBigInt === 'bigint' // => true
typeof 111                  // => "number"
typeof 111n                 // => "bigint"
```

now there are 7 primitives type in JS
- `Boolean`
- `String`
- `Number`
- `Null` (no value)
- `Undefined` (a declared variable but hasn’t been given a value)
- `Symbol` (new in ES6, a unique value that's not equal to any other value)
- `BigInt` (new in ES10)

## ES6模块化
历史上，JavaScript 一直没有模块（module）体系，无法将一个大程序拆分成互相依赖的小文件，再用简单的方法拼装起来。其他语言都有这项功能，比如 Ruby 的require、Python 的import，甚至就连 CSS 都有@import，但是 JavaScript 任何这方面的支持都没有，这对开发大型的、复杂的项目形成了巨大障碍。

在 ES6 之前，社区制定了一些模块加载方案，最主要的有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。
```ts
// CommonJS模块 实质是整体加载fs模块（即加载fs的所有方法），生成一个对象（_fs），然后再从这个对象上面读取 3 个方法。这种加载称为“运行时加载”，因为只有运行时才能得到这个对象，导致完全没办法在编译时做“静态优化”。
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

ES6 模块不是对象，而是通过export命令显式指定输出的代码，再通过import命令输入。
```ts
import { stat, exists, readFile } from 'fs';
```

上面代码的实质是从fs模块加载 3 个方法，其他方法不加载。这种加载称为“编译时加载”或者静态加载，即 ES6 可以在编译时就完成模块加载，效率要比 CommonJS 模块的加载方式高。当然，这也导致了没法引用 ES6 模块本身，因为它不是对象。

ES6 模块编译时加载的好处：
- 静态分析:能进一步拓宽 JavaScript 的语法，比如引入宏（macro）和类型检验（type system）这些只能靠静态分析实现的功能。
- 不再需要UMD模块格式了，将来服务器和浏览器都会支持 ES6 模块格式。目前，通过各种工具库，其实已经做到了这一点。
- 将来浏览器的新 API 就能用模块格式提供，不再必须做成全局变量或者navigator对象的属性。
- 不再需要对象作为命名空间（比如Math对象），未来这些功能可以通过模块提供。

### 严格模式
ES6 的模块自动采用严格模式，不管你有没有在模块头部加上"use strict";。

严格模式主要有以下限制。
- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能使用with语句
- 不能对只读属性赋值，否则报错
- 不能使用前缀 0 表示八进制数，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量delete prop，会报错，只能删除属性delete global[prop]
- eval不会在它的外层作用域引入变量
- eval和arguments不能被重新赋值
- arguments不会自动反映函数参数的变化
- 不能使用arguments.callee
- 不能使用arguments.caller
- 禁止this指向全局对象
- 不能使用fn.caller和fn.arguments获取函数调用的堆栈
- 增加了保留字（比如protected、static和interface）

尤其需要注意this的限制。ES6 模块之中，顶层的this指向undefined，即不应该在顶层代码使用this。

利用顶层的this等于undefined这个语法点，可以侦测当前代码是否在 ES6 模块之中。
```ts
const isEs6 = this === undefined;
```

### 一些性质
**动态绑定**  
export语句输出的接口，与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值。这一点与 CommonJS 规范完全不同。CommonJS 模块输出的是值的缓存，不存在动态更新
```ts
// 输出变量foo，值为bar，500 毫秒之后变成baz
export var foo = 'bar';
setTimeout(() => foo = 'baz', 500);
```

**只读**  
import命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口。
```ts
import { a } from './xxx.js'
a = {}; // Syntax Error : 'a' is read-only;

// 如果a是一个对象，改写a的属性是允许的,并没有改变接口
a.foo = 'hello'; // 合法操作
```

**变量提升**  
import命令具有提升效果，会提升到整个模块的头部，首先执行。这种行为的本质是，import命令是编译阶段执行的，在代码运行之前。
```ts
// 不会报错
foo();
import { foo } from 'my_module';
```

**不能用import的场景**    
由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。
```ts
import { 'f' + 'oo' } from 'my_module';   // 报错

let module = 'my_module';
import { foo } from module;       // 报错

// 报错
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
```

**执行所加载的模块**  
import语句会执行所加载的模块，因此可以import但是不赋值。
```ts
// 仅仅执行lodash模块，但是不输入任何值。
import 'lodash';

// 如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。
import 'lodash';
import 'lodash';
```

**default**  
本质上，export default就是输出一个叫做default的变量或方法，然后系统允许你为它取任意名字。所以，下面的写法是有效的。
```ts
// modules.js
function add(x, y) {
  return x * y;
}
export { add as default };  // 等同于 export default add;

// app.js
import { default as foo } from 'modules';  // 等同于 import foo from 'modules';
```

### 复合写法
```ts
export { foo, bar } from 'my_module';

// 可以简单理解为
import { foo, bar } from 'my_module';
export { foo, bar };
```
```ts
// 接口改名
export { foo as myFoo } from 'my_module';

// 整体输出
export * from 'my_module';
```

### 动态加载
因为静态分析的缘故，import和export命令只能在模块的顶层，不能在代码块之中（比如，在if代码块之中，或在函数之中）。如果想要实现跟require一样的动态加载，就可以用到import()函数。

import()函数可以用在任何地方，不仅仅是模块，非模块的脚本也可以使用。它是运行时执行，也就是说，什么时候运行到这一句，就会加载指定的模块。另外，import()函数与所加载的模块没有静态连接关系，这点也是与import语句不相同。import()类似于 Node 的require方法，区别主要是前者是异步加载，后者是同步加载。

```ts
import(`./xxx/aaa.js`)
  .then(module => { ... });
```

**适用场合：**
- 按需加载
- 条件加载
- 动态的模块路径
```ts
// 按需加载
button.addEventListener('click', event => {
  import('./dialogBox.js')
  .then(dialogBox => {
    dialogBox.open();
  })
});

// 条件加载
if (condition) {
  import('moduleA').then(...);
} else {
  import('moduleB').then(...);
}

// 动态的模块路径
import(getPath())
  .then(...);
```

import()加载模块成功以后，这个模块会作为一个对象，当作then方法的参数。因此，可以使用对象解构赋值的语法，获取输出接口。
```ts
import('./myModule.js')
  .then(({export1, export2}) => {});
```

如果想同时加载多个模块，可以用promise.all
```ts
Promise.all([
  import('./module1.js'),
  import('./module2.js'),
  import('./module3.js'),
])
  .then(([module1, module2, module3]) => {});
```

import()也可以用在 async 函数之中。
```ts
async function main() {
  const myModule = await import('./myModule.js');
  const { export1, export2 } = await import('./myModule.js');
  const [module1, module2, module3] =
    await Promise.all([
      import('./module1.js'),
      import('./module2.js'),
      import('./module3.js'),
    ]);
}
```

### 加载规则
浏览器加载 ES6 模块，使用`<script>`标签，但是要加入type="module"属性。浏览器对于带有type="module"的`<script>`，都是异步加载，不会造成堵塞浏览器，即等到整个页面渲染完，再执行模块脚本，等同于打开了`<script>`标签的defer属性。如果网页有多个`<script type="module">`，它们会按照在页面出现的顺序依次执行。

```html
<script type="module" src="./foo.js"></script>
<!-- 等同于 -->
<script type="module" src="./foo.js" defer></script>
```

### ES6 模块与 CommonJS 模块的差异
它们有三个重大差异:
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。这是因为 CommonJS 加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。
- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
- CommonJS 模块的require()是同步加载模块，ES6 模块的import命令是异步加载，有一个独立的模块依赖的解析阶段。

CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值
```ts
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  get getCounter() { return counter; }
  counter: counter,
  incCounter: incCounter,
};

// main.js
var mod = require('./lib');

console.log(mod.counter);     // 3
mod.incCounter();
console.log(mod.counter);       // 3,不会变化，这是因为mod.counter是一个原始类型的值，会被缓存
console.log(mod.getCounter());  // 4 函数可以拿到动态变化的值
```

ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。这点很神奇，就像可以给原始类型一个pointer。
```ts
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter);   // 3
incCounter();
console.log(counter);   // 4,会变化
```
另一个例子
```ts
// m1.js
export var foo = 'bar';
setTimeout(() => foo = 'changed', 500);

// m2.js
import { foo } from './m1.js';
console.log(foo);                         // bar
setTimeout(() => console.log(foo), 600);  // changed
```

export通过接口，输出的是同一个值。不同的脚本加载这个接口，得到的都是同样的实例。之前用到的context就是这样使用的。
```ts
// mod.js
function Context() {}
export let c = new Context();   // 不同的脚本加载这个模块，得到的都是同一个实例
```

## cjs和mjs
注意，ES6 模块与 CommonJS 模块尽量不要混用

在node里面，mjs文件总是以 ES6 模块加载，cjs文件总是以 CommonJS 模块加载，.js文件的加载取决于package.json里面type字段的设置，如果是`"type": "module"`就会被当做ES6加载。

### cjs加载esm
require命令不能加载mjs文件，会报错，只有import命令才可以加载mjs文件。反过来，mjs文件里面也不能使用require命令，必须使用import。

require()不支持 ES6 模块的一个原因是，它是同步加载，而 ES6 模块内部可以使用顶层await命令，导致无法被同步加载。但可以在cjs模块里面用import。
```ts
// 可以在 CommonJS 模块中运行
(async () => {
  await import('./my-app.mjs');
})();
```

### esm加载cjs
import命令可以加载 CommonJS 模块，但是只能整体加载，不能只加载单一的输出项。这是因为 ES6 模块需要支持静态代码分析，而 CommonJS 模块的输出接口是module.exports，是一个对象，无法被静态分析，所以只能整体加载。
```ts
import packageMain from 'commonjs-package';   // 正确
import { method } from 'commonjs-package';    // 报错
```
加载单一的输出项，可以写成这样：
```ts
import packageMain from 'commonjs-package';
const { method } = packageMain;
```

### 同时支持两种格式的模块
一个模块同时要支持 CommonJS 和 ES6 两种格式,可以进行包装：
- 如果原始模块是 ES6 格式，那么需要给出一个整体输出接口，比如export default obj，使得 CommonJS 可以用import()进行加载。
- 如果原始模块是 CommonJS 格式，那么可以加一个包装层。

或者可以在package.json文件的exports字段，指明两种格式模块各自的加载入口。
```ts
"exports"：{
  "require": "./index.js"，
  "import": "./esm/wrapper.js"
}
```

### 内部变量
ES6 模块应该是通用的，同一个模块不用修改，就可以用在浏览器环境和服务器环境。为了达到这个目标，Node.js 规定 ES6 模块之中不能使用 CommonJS 模块的特有的一些内部变量。

首先，就是this关键字。ES6 模块之中，顶层的this指向undefined；CommonJS 模块的顶层this指向当前模块，这是两者的一个重大差异。

其次，以下这些顶层变量在 ES6 模块之中都是不存在的。
- arguments
- require
- module
- exports
- __filename
- __dirname


## 总结
**var和let/const区别**
- es5的时候，var只有全局作用域和函数作用域，let会产生块级作用域
- 块级作用域中let声明必须有大括号，var就不需要，可以`if(true) var x = 1`
- var在全局的时候是挂在全局对象上的，let是不会挂在全局对象上的
- 一个作用域里面可以重复声明var，不能重复声明let，因此也有暂时性死区这个概念
- let不会有变量提升，不能在声明之前使用，否则报错

**箭头函数**
- 箭头函数没有自己的this对象，this就是定义时上层作用域中的this。
- 所以不可以当作构造函数。还有一个技术上的直接原因，是没有prototype。
- 没有arguments对象，如果要用，可以用 rest 参数代替。
- 不可以使用yield命令，因此箭头函数不能用作 Generator 函数。

**ES6 模块与 CommonJS 模块的差异**
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。这是因为 CommonJS 加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。
- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
- CommonJS 模块的require()是同步加载模块，ES6 模块的import命令是异步加载，有一个独立的模块依赖的解析阶段。
- cjs可以不能直接require esm，可以内部使用await import()一个esm模块；esm可以直接import一个cjs模块，但是只能整体加载，不能只加载单一的输出项。
## references
- https://es6.ruanyifeng.com/