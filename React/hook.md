

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [React Hooks](#react-hooks)
  - [hook有什么用](#hook有什么用)
  - [类组件的不足](#类组件的不足)
  - [经典hooks的使用](#经典hooks的使用)
    - [useContext](#usecontext)
    - [useEffect](#useeffect)
      - [执行时机 => 对应的生命周期函数](#执行时机--对应的生命周期函数)
      - [解决的问题](#解决的问题)
      - [基本使用](#基本使用)
      - [执行异步函数](#执行异步函数)
    - [useMemo](#usememo)
    - [useCallback](#usecallback)
    - [useRef](#useref)
  - [手写hook](#手写hook)
  - [一些问题](#一些问题)
    - [对 React Hook 的理解，它的实现原理是什么](#对-react-hook-的理解它的实现原理是什么)
    - [Hook 的使用限制有哪些](#hook-的使用限制有哪些)
    - [useEffect 与 useLayoutEffect 的区别](#useeffect-与-uselayouteffect-的区别)
    - [一个细节](#一个细节)
    - [hook里面有几个链表](#hook里面有几个链表)
  - [hook的源码](#hook的源码)
    - [mount阶段](#mount阶段)
  - [总结](#总结)
  - [references](#references)

<!-- /code_chunk_output -->
# React Hooks

## hook有什么用
对函数型组件进⾏增强, 让函数型组件可以存储状态, 可以拥有处理副作⽤的能⼒.
让开发者在不使⽤类组件的情况下, 实现相同的功能.

## 类组件的不足
- 缺少逻辑复⽤机制
  - 为了复⽤逻辑增加⽆实际渲染效果的组件(HOC或者render props)，增加了组件层级，变得⼗分臃肿，嵌套地狱。
  - 增加了调试的难度以及运⾏效率的降低
- 类组件经常会变得很复杂难以维护
  - 将⼀组相⼲的业务逻辑拆分到了多个⽣命周期函数中
  - 在⼀个⽣命周期函数内存在多个不相⼲的业务逻辑
- 类成员⽅法不能保证this指向的正确性

## 经典hooks的使用
<!-- ### useState
 ```ts
 // setCount是异步的
const [count, setCount] = useState(0);
const [count, setCount] = useState(() => { ... });    // 初始值可以是一个函数，只会被调用一次，用来处理动态初始值
``` -->

### useReducer
useReducer是另⼀种让函数组件保存状态的⽅式.
```ts
const INCREMENT = 'increment';
const reducer = (state, action) => {
  switch(action.type) {
    case INCREMENT:
      return state + 1;
  }
}

const [count, dispatch] = useReducer(reducer, 0);
const handleIncrement = () => dispatch({ type: INCREMENT });
```

### useContext
在跨组件层级获取数据时简化获取数据的代码
```tsx
import { createContext, useContext } from 'react';

const countContext = createContext();
const { Provider } = countContext;

const App = () => (
  <Provider value={ 100 }>
    <Foo />
  </Provider>
);

const Foo = () => {
  const value = useContext(countContext);   // 100
  // ...
}
```

### useEffect
让函数型组件拥有处理副作⽤的能⼒.类似⽣命周期函数,可以把 `useEffect` 看做 `componentDidMount`, `componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合.

#### 执行时机 => 对应的生命周期函数
- `useEffect(() => {})` => `componentDidMount`, `componentDidUpdate`
- `useEffect(() => {}, [])` => `componentDidMount`
- `useEffect(() => () => {})` => `componentWillUnMount`

#### 解决的问题
- 按照⽤途将代码进⾏分类 (将⼀组相⼲的业务逻辑归置到了同⼀个副作⽤函数中)
- 简化重复代码, 使组件内部代码更加清晰

#### 基本使用
```ts
// count变化的时候把网页标题也变化
useEffect(() => {
  document.title = count;
}, [count]);
```

#### 执行异步函数
useEffect中的参数函数不能是异步函数, 因为useEffect函数要返回清理资源的函数, 如果是异步函数就变成了返回Promise。所以需要用个IIFE把异步函数包起来。
```ts
useEffect(() => {
  (async () => {
    await axios.get();
  })();
});
```

### useMemo
useMemo 的⾏为类似Vue中的计算属性, 可以监测某个值的变化, 根据变化值计算新值。useMemo 会缓存计算结果. 如果监测值没有发⽣变化, 即使组件重新渲染, 也不会重新计算. 此⾏为可以有助于避免在每个渲染上进⾏昂贵的计算.

```tsx
const res = useMemo(
  () => expensiveCalc(count)
}, [count]);    // 如果count变化此函数重新执行
```

memo还能用来性能优化, 如果本组件中的数据没有发⽣变化, 阻⽌组件更新. 类似类组件中的 PureComponent 和 shouldComponentUpdate

```tsx
import React, { memo } from 'react';

const App = () => (<div></div>);
const MemoApp = memo(App);
```

### useCallback
缓存函数, 使组件重新渲染时得到相同的函数实例，以实现性能优化。

```tsx
const App = () => {
  const [count, setCount] = useState(0);
  const resetCount = useCallback(() => setCount(0), [setCount]);

  // <Test />组件不会频繁更新(假设Test是purecomponent)，因为拿到的resetCount是经过缓存的, 是同一个实例
  return (<Test resetCount={ resetCount }/>)
}
```

### useRef
可以用来获取DOM元素对象
```tsx
const App = () => {
  const username = useRef();
  const log = () => console.log(username);    // { current: input }

  return (<input ref={ username } onChange={ log }/>);
}
```

还可以用来跨组件周期保存数据。
即使组件重新渲染, 保存的数据仍然还在. 保存的数据被更改不会触发组件重新渲染.
```ts
// 这样是不行的，因为每次重新渲染，App() 重新被调用，timer又被设置成null了，就拿不到之前周期的那个timer。
const App = () => {
  let timer = null;
  useEffect(() => {
    timer = setInterval(() => { ... }, 1000);
  }, []);

  const stopTimer = () => {
    clearInterval(timer);
  };
};

const App = () => {
  let timer = useRef();   // 通过useRef跨周期保存timer的reference
  useEffect(() => {
    timer.current = setInterval(() => { ... }, 1000);
  }, []);

  const stopTimer = () => {
    clearInterval(timer.current);
  };
};
```

## 手写hook
```tsx
// useState相关
let state = [];
let setters = [];
let stateIdx = 0;

// useEffect相关
let prevDeps = [];
let effectIdx = 0;

function reRender () {
  stateIdx = 0;
  effectIdx = 0;
  ReactDOM.render(<App />, document.getElementById('root'));
}

function createSetter (index) {
  return newState => {
    state[index] = newState;
    reRender();
  }
}

function useState (initialState) {
  state[stateIdx] = state[stateIdx] ? state[stateIdx] : initialState;
  setters[stateIdx] = setters[stateIdx] ? setters[stateIdx] : createSetter(stateIdx);

  const value = state[stateIdx];
  const setter = setters[stateIdx];
  stateIdx++;

  return [value, setter];
}

const isFunction = x => Object.prototype.toString.call(x) === '[object Function]';
const isArray = x => Object.prototype.toString.call(x) === '[object Array]';

function useEffect(cb, deps) {
  if (!isFunction(cb)) throw new Error('useEffect函数的第一个参数必须是函数');

  if (typeof deps === 'undefined') {
    cb();     // 没有deps,每次都直接调用cb()
  } else {
    if (!isArray(deps)) throw new Error('useEffect函数的第二个参数必须是数组');

    const prevDeps = prevDeps[effectIdx];
    const hasChanged = (
      !prevDeps ||                                       // 初次渲染
      deps.some((dep, index) => dep !== prevDeps[index]) // deps变化
    );
    hasChanged && cb();

    // 同步依赖值
    prevDeps[effectIdx] = deps;
    effectIdx++;
  }
}

function useReducer (reducer, initialState) {
  const [state, setState] = useState(initialState);
  function dispatch (action) {
    const newState = reducer(state, action);
    setState(newState);
  }
  return [state, dispatch];
}
```

## 一些问题
### 对 React Hook 的理解，它的实现原理是什么
在hook出现之前，类组件的能力边界明显强于函数组件，因为它有自己的state和this，还自带了各种生命周期，所以可以处理很多状态相关的逻辑。函数组件更多的就是作为纯渲染组件来用。

但是，类组件这样又带来了一些劣势：
- 整个逻辑是在生命周期和this.state耦合在一起的，逻辑难以拆分，复用性很差。
- 整个类组件里面的繁杂的逻辑，导致学习成本的提高，开发的效率变低。

实际上，类组件和函数组件之间，是面向对象和函数式编程这两套不同的设计思想之间的差异。**而函数组件更加契合 React 框架的设计理念**，组件本身的定位就是函数，一个输入数据、输出 UI 的函数。`UI = f(data)`。

为了能让开发者更好的的去编写函数式组件，产生了hook。这是一套能够使函数组件更强大、更灵活的“钩子”，能够钩入各种函数组件本来缺失的能力，比如state，比如生命周期。

所以说，功能上来讲，函数组件 + hook = 类组件，但这样的好处就是，可以自己选择钩入需要的逻辑，按需导入，而不是像类组件一样，还没有用很多逻辑，就已经导入了。这样让整个设计更加灵活，也增加了逻辑的可复用性。

总结，hook的好处：
- 函数组件更符合react设计思想
- 可以按需导入
- 逻辑的复用
- 减少逻辑的耦合性，更小颗粒度的逻辑

### Hook 的使用限制有哪些
- 必须始终在React函数的顶层使用Hook
- 不要在循环、条件或嵌套函数中调用 Hook
- 在 React 的函数组件中调用 Hook

那为什么不要在循环、条件或嵌套函数中调用 Hook 呢？因为 Hooks 的设计是基于数组实现。在调用时按顺序加入数组中，如果使用循环、条件或嵌套函数很有可能导致数组取值错位，执行错误的 Hook。当然，实质上 React 的源码里不是数组，是链表。

### useEffect 与 useLayoutEffect 的区别
**共同点**  
useEffect 与 useLayoutEffect 两者都是用于处理副作用，这些副作用包括改变 DOM、设置订阅、操作定时器等。

**不同点**  
useEffect 在 React 的渲染过程中是被**异步调用**的，用于绝大多数场景；而 useLayoutEffect 会在所有的 DOM 变更之后**同步调用**，主要用于处理 DOM 操作、调整样式、避免页面闪烁等问题。也正因为是同步处理，所以需要避免在 useLayoutEffect 做计算量较大的耗时任务从而造成阻塞。

useEffect是按照顺序执行代码的，改变屏幕像素之后执行（先渲染，后改变DOM），当改变屏幕内容时可能会产生闪烁；useLayoutEffect是改变屏幕像素之前就执行了（会推迟页面显示的事件，先改变DOM后渲染），不会产生闪烁。useLayoutEffect总是比useEffect先执行。

### 一个细节
setState的时候，必须要给一个新的对象，才能触发改变。这点跟redux很想，reducer必须要给一个新对象，不然redux就以为没有改变，因为是通过oldData === newData来对比的。

但是class的setState就没关系，因为在React.component里面, setState里面显式调用了render和diff。
```ts
  let [num, setNums] = useState([0,1,2,3])
  const test = () => {
    num.push(1)
    setNums(num)    // num不会改变，如果用num = [...num ,1]就可以
  }
```

### hook里面有几个链表
- fiber本身就用链表链接sibling和child，这样可以实现深度优先的遍历
- 副作用链effect list：深度优先的遍历fiber树就是为了收集这条链，渲染commit阶段就通过遍历副作用链完成 DOM 更新
- hook链表：存储了按顺序执行的hook的信息

## hook的源码
无状态组件中fiber对象memoizedState保存当前的hooks形成的链表。每个hook都是一个对象，也是链表中的一个node。
```ts
const fiber: Fiber = {
  memoizedState: null,    // 指向当前函数的hooks形成的链表
}

const hook: Hook = {
  // useState中 保存 state信息 ｜ useEffect 中 保存着 effect 对象 ｜ useMemo 中 保存的是缓存的值和deps ｜ useRef中保存的是ref 对象
  memoizedState: null,  

  baseState: null,
  baseQueue: null,
  queue: null,
  next: null,   // 指向下一个hook
};
```

![hook可视化](/assets/hook可视化.png)

### mount阶段
mount的初始化阶段，在一个函数组件第一次渲染执行上下文过程中，每个react-hooks执行，都会产生一个hook对象，并形成链表结构，绑定在workInProgress的memoizedState属性上，然后react-hooks上的状态，绑定在当前hooks对象的memoizedState属性上。对于effect副作用钩子，会绑定在workInProgress.updateQueue上，等到commit阶段，dom树构建完成，在执行每个 effect 副作用钩子。

在组件初始化的时候,每一次hooks执行，都会调用mountWorkInProgressHook。
```ts
function mountWorkInProgressHook() {
  const hook: Hook = {
    memoizedState: null,  // useState中 保存 state信息 ｜ useEffect 中 保存着 effect 对象 ｜ useMemo 中 保存的是缓存的值和deps ｜ useRef中保存的是ref 对象
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {    // 第一个hook，创建一个hook链表
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {                              // 把hook挂到下一个hook上
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}
```

对于useXXX函数，都会调用mountXXX，结构大概是
```ts
function mountXXX(...args) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = ...    // 保存了状态
  hook.queue = ...            // 保存了负责更新的信息

  return ...                  // 如果有需要的话，就return，useEffect就没有return
}
```

对于useState
```ts
function mountState(initialState){
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    // 如果 useState 第一个参数为函数，执行函数得到state
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,  // 带更新的
    dispatch: null, // 负责更新函数
    lastRenderedReducer: basicStateReducer, //用于得到最新的 state ,
    lastRenderedState: initialState, // 最后一次得到的 state
  });

  const dispatch = (queue.dispatch = (dispatchAction.bind( // 负责更新的函数
    null,
    currentlyRenderingFiber,
    queue,
  )))
  return [hook.memoizedState, dispatch];
}

// dispatchAction就是useState里面那个setter
// fiber和queue都被bind成当前的fiber，只用传入action
function dispatchAction(fiber, queue, action) {}
```

## 总结
- hook的出现为了解决函数组件相对于类组件确实的那些功能，包括状态保存，还有生命周期。
- 类组件的缺点：
  - 逻辑复用性不方便,耦合性强：需要HOC或者render props，这样会产生回调地狱
  - 同一组相关联的逻辑散落在组件各个地方，太分散。hook可以把逻辑写成一组。有点类似vue的composite API，也有人把composite api叫vue hooks哈哈哈
  - 整个react充满函数式编程的思想，UI = f(data)，函数组件更贴合这种设计：输入prop（data），输出UI。类组件更像是面向对象的编程思想。vue 2里面就很不函数，耦合性特别强，总是喜欢什么东西都往vue实例的vm身上挂，vm像个木流牛马一样传来传去，包括webpack也是，在实例化的时候会把compiler传来穿去，往上面挂东西。

从功能上来讲，函数组件 + hook = 类组件。这样把一个大的，耦合性强的类组件，拆分成了更小颗粒度的逻辑，就像积木一样，可以按需钩入需要的逻辑，大大优化了开发者体验。
## references
- https://juejin.cn/post/6944863057000529933