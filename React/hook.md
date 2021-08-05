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
### useState
 ```ts
 // setCount是异步的
const [count, setCount] = useState(0);
const [count, setCount] = useState(() => { ... });    // 初始值可以是一个函数，只会被调用一次，用来处理动态初始值
```

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
```ts
let state = [];
let setters = [];
let stateIndex = 0;

function reRender () {
  stateIndex = 0;
  effectIndex = 0;
  ReactDOM.render(<App />, document.getElementById('root'));
}

function createSetter (index) {
  return newState => {
    state[index] = newState;
    reRender();
  }
}

function useState (initialState) {
  state[stateIndex] = state[stateIndex] ? state[stateIndex] : initialState;
  setters.push(createSetter(stateIndex));
  let value = state[stateIndex];
  let setter = setters[stateIndex];
  stateIndex++;
  return [value, setter];
}

// 上一次的依赖值
let prevDepsAry = [];
let effectIndex = 0;

function useEffect(callback, depsAry) {
  // 判断callback是不是函数
  if (Object.prototype.toString.call(callback) !== '[object Function]') throw new Error('useEffect函数的第一个参数必须是函数');
  // 判断depsAry有没有被传递
  if (typeof depsAry === 'undefined') {
    // 没有传递
    callback();
  } else {
    // 判断depsAry是不是数组
    if (Object.prototype.toString.call(depsAry) !== '[object Array]') throw new Error('useEffect函数的第二个参数必须是数组');
    // 获取上一次的状态值
    let prevDeps = prevDepsAry[effectIndex];
    // 将当前的依赖值和上一次的依赖值做对比 如果有变化 调用callback
    let hasChanged = prevDeps ? depsAry.every((dep, index) => dep === prevDeps[index]) === false : true;
    // 判断值是否有变化
    if (hasChanged) {
      callback();
    }
    // 同步依赖值
    prevDepsAry[effectIndex] = depsAry;
    effectIndex++;
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