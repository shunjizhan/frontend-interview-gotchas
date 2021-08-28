# React SSR
[手写 mini React SSR](https://github.com/shunjizhan/mini-react-ssr)

# NextJS
<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [React SSR](#react-ssr)
- [NextJS](#nextjs)
  - [介绍](#介绍)
  - [常用命令](#常用命令)
  - [基于页面的路由系统](#基于页面的路由系统)
    - [创建页面](#创建页面)
    - [页面跳转](#页面跳转)
  - [静态资源、元数据和CSS](#静态资源元数据和css)
    - [静态资源](#静态资源)
    - [修改页面元数据](#修改页面元数据)
    - [CSS样式](#css样式)
  - [预渲染](#预渲染)
    - [选择哪种预渲染](#选择哪种预渲染)
    - [有数据的静态生成](#有数据的静态生成)
    - [基于动态路由的静态生成](#基于动态路由的静态生成)
      - [Incremental Static Regeneration](#incremental-static-regeneration)
  - [API Routes](#api-routes)
  - [自定义Next服务器](#自定义next服务器)

<!-- /code_chunk_output -->
## 介绍
Next.js是 React 服务端渲染应用框架,用于构建 SEO 友好的 SPA 应用
- 支持两种预渲染方式 , 静态生成和服务器端渲染 .
- 基于页面的路由系统 , 路由零配置
- 自动代码拆分 . 优化页面加载速度
- 支持静态导出 , 可将应用导出为静态网站
- 内置 CSS in JS 库 styled jsx
- 方案成熟 , 可用于生产环境 , 世界许多公司都在使用
- 应用部署简单 , 拥有专属部署环境 Vercel, 也可以部署在其他环境

## 常用命令
**创建项目**
`npx create-next-app my-project`

**运行开发环境**
`yarn dev`  
`next dev`


**生成静态网站**
`next build && next out`
这样会自动生成一个`out/`文件夹，里面包含的就是生成好的静态网站。

## 基于页面的路由系统
### 创建页面
页面是被放置在 pages 文件夹中的 React 组件 
组件需要被默认导出
组件文件中不需要引入React.
页面地址与文件地址是对应的关系

```tsx
// pages/List.js
export default function List() {
  return (<div>List page</div>);
}
```

**自定义404页面**：直接在 pages 文件夹中创建 404.js 文件就行了。
```tsx
// pages/404.js
export default function Custom404() {
  return (<div>404!!!</div>);
}
```

### 页面跳转
页面与页面之间通过Link 组件进行跳转.
Link组件默认使用 JavaScript 进行页面跳转，即 SPA 形式的跳转
如果浏览器中JavaScript 被禁用，则使用`<a>`链接跳转
Link组件中不应添加除 href 属性以外的属性, 其余属性添加到`<a>`标签上
Link组件通过预取功能（在生产环境中）自动优化应用程序以获得最佳性能

```tsx
import Link from 'next/link';

<Link href='/List'><a title='list page'>list page</a></Link>
```

## 静态资源、元数据和CSS
### 静态资源
应用程序根目录中的`public/`文件夹用于提供静态资源
静态资源通过以下形式进行访问:
`public/images/1.jpg` --> `/images/1.jpg`
`public/css/base.css` --> `/css/base.css`

### 修改页面元数据
```tsx
import Head from 'next/head';
<>
  <Head>
    <title>Index Page</title>
  </Head>
</>
```

### CSS样式
- 内置styled jsx
在Next.js 中内置了 styled jsx, 它是一个 CSS in JS 库 , 允许在 React 组件中编写 CSS, CSS 仅作用于组件内部.
```tsx
export default function Home() {
  return (
    <>
      <div className="demo">list page</a>

      <style jsx>{`
        .demo {
          color: black;
        }
      `}</style>
    </>
  );
}
```

- CSS模块: 
通过使用CSS 模块功能 , 允许将组件的 CSS 样式编写在单独的 CSS 文件中。CSS模块约定样式文件的名称必须为`组件文件名称.module.css`

```tsx
// index.module.css
.green { color: green }

// index.js
import styles from './index.module.css';

<div className={ styles.green }></div>
```

- 全局样式文件
  - 创建 global.css (不一定是这个名字)
  - 在 pages 文件夹中新建固定写法的`_app.js`,通过 import 引入 global.css.
  - 重新启动开发服务器

```tsx
// pages/_app.js
import './global.css';

export default function App ({ Component, pageProps }) {
  return <Component {...pageProps}/>
}
```

## 预渲染
**预渲染**是指数据和HTML的拼接在服务器端提前完成 .
- 预渲染可以使SEO 更加友好
- 预渲染会带来更好的用户体验, 可以无需运行 JavaScript 即可查看应用程序 UI.

在Next.js中支持两种形式的预渲染，区别是生成HTML的时机不同：
- **静态生成**：是在构建时生成 HTML. 以后的每个请求都共用构建时生成好的 HTML.
- **服务器端渲染**: 在请求时生成 HTML，每个请求都会重新生成 HTML.

### 选择哪种预渲染
Next.js允许开发者为每个页面选择不同的预渲染方式，不同的预渲染方式拥有不同的特点，应根据场景进行渲染，但**一般建议使用静态生成**。
- 静态生成一次构建, 反复使用, 访问速度快。因为页面都是事先生成好的。适用场景：营销页面、博客文章、电子商务产品列表、帮助和文档。
- 服务器端渲染访问速度不如静态生成快, 但是由于每次请求都会重新渲染 , 所以适用数据频繁更新的页面或页面内容随请求变化而变化的页面。

### 有数据的静态生成
如果组件不需要在其他地方获取数据（无数据的静态生成）, 直接进行静态生成，没什么特别的。

如果组件需要在其他地方获取数据, 在构建时 Next.js 会预先获取组件需要的数据, 然后再对组件进行静态生成。我们需要用到
- 静态生成(SSG)：`getStaticProps()`
- 服务端渲染(SSR)：`getServerSideProps(context)`

这两个函数的作用是获取组件静态生成需要的数据，并通过 props 的方式将数据传递给组件。它们是一个运行在node服务端的异步函数（所以可以执行node环境下的API）, 需要在组件内部进行导出。

`getStaticProps()`在开发模式下, 会自动改为在每个请求上运行。（`getServerSideProps()`本来就是在每个请求上运行）

```tsx
// 可以用node的系统模块API，但是打包的时候是不会打包到客户端bundle里面的，因为next会帮我们作treeshaking，把这些node相关的给摇晃掉。
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const read = promisify(readFile);   // readFile本身是callback形式

export default function List({ data }) {
  return (<div>{ data }</div>);
}

export async function getServerSideProps (context) {
  console.log('where am I?');   // 打印在node服务端
  console.log(context.query);   // 携带特定的请求参数

  // 这里就以读取_app.js当做数据为例
  const data = await read(join(process.cwd(), 'pages', '_app.js'), 'utf-8');
  return {
    props: {
      data
    }
  }
}
```

### 基于动态路由的静态生成
基于参数为页面组件生成HTML页面，有多少参数就生成多少 HTML 页面.在构建应用时, 先获取用户可以访问的所有路由参数, 再根据路由参数获取具体数据, 然后根据数据生成静态 HTML.

具体流程：
- 创建基于动态路由的页面组件文件, 命名时在文件名称外面加上`[]`, 比如`[id].js`
- 导出异步函数`getStaticPaths`, 用于获取所有用户可以访问的路由参数
- 导出异步函数`getStaticProps`, 用于根据路由参数获取具体的数据

```tsx
// pages/post/[id].js
// 比如用户访问 /post/3 就会匹配到这个组件
import { useRouter } from 'next/router';

export default function Post ({ data }) {
  const router = useRouter();
  if (router.isFallback) return <div>loading</div>;
  return <div>
    <span>{data.id}</span>
    <span>{data.title}</span>
  </div>
}

// 返回用户可以访问到的所有的路由参数
export async function getStaticPaths () {
  const getAllAvailablePaths = () => Promise.resolve(
    [{params: {id: "1"}}, {params: {id: "2"}}]
  );

  // 调用api拿到真正的数据，这里是例子所以直接hardcode结果
  const paths = await getAllAvailablePaths();

  return {
    paths,
    fallback: true
  }
}

// 返回路由参数所对应的具体的数据
// 对每一个param（路由）都会调用一次，等于对每一个id去拿对应的数据
export async function getStaticProps ({ params }) {
  const data = await fetchData(params.id);
  return {
    props: {
      data，
      revalidate: 60,   // 每60秒刷新缓存
    }
  }
}
```

#### Incremental Static Regeneration
Next这种方法叫做`Incremental Static Regeneration`, 好处是
- 可以缓存页面，提高响应速度，有请求的时候直接返回cache的页面。
- 用户可以自由控制哪些页面用怎么样的策略，只需要决定对不同的页面，是用getStaticProps还是getServerSideProps,以及调整参数。比如对数据经常变化的页面用getServerSideProps，对访问量大而且不怎么变化的界面，用getStaticProps。


拓展阅读：
https://vercel.com/docs/next.js/incremental-static-regeneration

## API Routes
API Routes可以理解为接口, 客户端向服务器端发送请求获取数据的接口。
Next.js应用允许 React 开发者编写服务器端代码创建数据接口，创建项目的时候就会在项目根目录生成一个`api/`文件夹，api相关的代码可以直接写在里面。

用法：
- 在 pages/api 文件夹中创建 API Routes 文件，比如 user.js
- 在文件中默认导出请求处理函数, 函数有两个参数, req 为请求对象, res 为响应对象
- 访问 API Routes: `localhost:3000/api/user`

注意：不要在getStaticPaths 或 getStaticProps 函数中访问 API Routes, 因为这两个函数就是在服务器端运行的, 可以直接写服务器端代码。

```ts
// pages/api/user.js
export default function (req, res) {
  const data = { id: 1, name: 'tom' };
  res.status(200).send(data);
}
```

## 自定义Next服务器
根目录下创建`server/index.js`,开发环境运行的时候就不要运行默认的`next dev`，而是运行`node server/index.js`; （部署到vercel是没用的，vercel不支持自定义服务器）
```ts
// server/index.js
const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production'

const nextApp = next({ dev });
const handler = nextApp.getRequestHandler();    // next默认的handler

nextApp.prepare().then(() => {
  const app = express();

  // 自定义的处理方式
  app.get('/hello', (req, res) => {
    res.send('Hello Next.js')
  });

  // 默认的处理方式
  app.get('*', (req, res) => {
    handler(req, res)
  });

  app.listen(3000, () => console.log('服务器启动成功'));
});
```