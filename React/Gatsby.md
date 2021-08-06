# Gatsby
Gatsby是一个静态站点生成器

## 优势
**静态应用的优势**
- 访问速度快
- 更利于 SEO 搜索引擎的内容抓取
- 部署简单

**Gatsby**
- 基于 React 和 GraphQL. 结合了 webpack, babel, react-router 等前端领域中最先进工具 . 开发人员开发体验好
- 采用数据层和 UI 层分离而不失 SEO 的现代前端开发模式 . 对 SEO 非常友好
- 数据预读取 , 在浏览器空闲的时候预先读取链接对应的页面内容 . 使静态页面拥有SPA 应用的用户体验 , 用户体验好
- 数据来源多样化 : Headless CMS, markdown, API
- 功能插件化 , Gatsby 中提供了丰富且功能强大的各种类型的插件 , 用什么装什么

![Gatsby](/assets/Gatsby.jpg)

## 创建项目
```
yarn add gatsby-cli -g       # 安装
gatsby new project-name      # 创建
gatsby develop 或 yarn start # 启动
```

## 基于文件的路由系统
Gatsby框架内置基于文件的路由系统, 页面组件被放置在 src/pages 文件夹中。

## 页面模板
可以基于同一个模板创建多个HTML 页面，有多少数据就创建多少页面。比如商品详情页面，有多少商品就生成多少商品详情展示页面。

首先要创建一个页面模板
```tsx
// src/templates/person.js
export default function Person({ pageContext }) {
  const { name, age } = pageContext
  return (
    <div>
      <span>{name}</span>
      <span>{age}</span>
    </div>
  )
}
```

然后在root创建`gatsy-node.js`,运行在服务端,每次修改需要重启服务。
```ts
// gatsy-node.js
function createPages({ actions }) {
  const { createPage } = actions
  const template = require.resolve("./src/templates/person.js")
  // 获取模板所需要的数据，这里硬编码当做例子
  const persons = [
    { slug: "zhangsan", name: "张三", age: 20 },
    { slug: "lisi", name: "李四", age: 30 },
  ]

  // 根据模板和数据创建页面
  persons.forEach(person => {
    createPage({
      component: template,              // 模板绝对路径
      path: `/person/${person.slug}`,   // 客户端访问地址
      context: person,                  // 传递给模板的数据
    })
  })
}

module.exports = {
  createPages,
}
```

## 界面跳转
```tsx
import { Link } from "gatsby";

<Link to="/list">lisi</Link>
```

## Graphql
Gatsby提供了一个统一的存储数据的地方，叫做数据层，是用GraphQL 构建的。在应用构建时，Gatsby 会从外部获取数据并将数据放入数据层，组件可以直接从数据层查询数据。

调试工具：`localhost:8000/___graphql`

### 页面组件（route直接匹配的组件）查询数据
```tsx
// src/pages/index.js

import { graphql } from "gatsby"

// 组件通过props.data拿到下面query查询的数据
export default function Home({ data }) {
  return (
    <>
      ...
    </>
  )
}

// 导出一个query，会自动调用
export const query = graphql`
  query MyQuery {
    site {
      ...
    }
  }
`
```

### 非页面组件查询数据
```tsx
import { graphql, useStaticQuery } from "gatsby"

export default function Header() {
  // 非页面组件通过useStaticQuery钩子查询数据
  const data = useStaticQuery(graphql`
    query {
      site {
        ...
      }
    }
  `)

  return (
    <div>
      <p>{ data.site.siteMetadata.title }</p>
    </div>
  )
}
```

## 插件系统
Gatsby内置插件系统, 插件是为应用添加功能的最好的方式。
有三种类型的插件:
- 数据源插件 ( source )：负责从应用外部获取数据，将数据统一放在Gatsby 的数据层中
- 数据转换插件 ( transformer )：负责转换特定类型的数据的格式，比如将markdown 文件中的内容转换为对象形式
- 功能插件 ( plugin )：为应用提供功能，比如通过插件让应用支持Less 或者TypeScript.

### JSON放入数据层
要将本地JSON 文件中的数据放入数据层需要用到两个插件
- `gatsby-source-filesystem`: 用于将本地文件中的数据添加至数据层
- `gatsby-transformer-json`：将原始 JSON 字符串转换为 JavaScript 对象

```ts
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "json",                   // 数据层里的分类名
        path: `${__dirname}/json/`,     // 这里面有很多xxx.json文件
      },
    },
    "gatsby-transformer-json",
  ]
}
```

将其它数据放入数据层也是一样的到底，只是用到了不同的插件。

## 编程的方式为所有markdown创建页面
### 1. 数据放入数据层
- `gatsby-source-filesystem`: 用于将本地文件中的数据添加至数据层
- `gatsby-transformer-remark`：转换markdown数据
```ts
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "json",                   // 数据层里的分类名
        path: `${__dirname}/json/`,     // 这里面有很多xxx.json文件
      },
    }, {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: ["gatsby-remark-images"],
      },
    },
  ]
}
```

### 2. 用这些数据
data放进数据层以后，可以export一个query拿到，自动当做props.data传进来。
```tsx
function List({ data }) {
  console.log(data.allMarkdownRemark);
  return (
    ...
  )
}

export const query = graphql`
  query {
    allMarkdownRemark {
      nodes {
        frontmatter {
          title
          date
        }
        html
        id
      }
    }
  }
`
```

### 3. 数据层添加slug数据
我们想为每个md数据节点里面添加slug数据，可以用到`onCreateNode`，它每次有新的数据节点创建的时候（比如每次插件读取了一个md文件），就会被调用一次。

```ts
// gatsby-node.js
function onCreateNode({ node, actions }) {
  const { createNodeField } = actions

  if (node.internal.type === "MarkdownRemark") {
    const slug = path.basename(node.fileAbsolutePath, ".md")
    createNodeField({
      node,
      name: "slug",
      value: slug,
    })
  }
}

module.exports = {
  createPages,
  onCreateNode,
}
```

### 4. 根据slug创建文章详情页
```ts
// gatsby-node.js
async function createPages({ graphql, actions }) {
  const { createPage } = actions
  const template = require.resolve("./src/templates/article.js")
  const { data } = await graphql(`
    query {
      allMarkdownRemark {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `)

  data.allMarkdownRemark.nodes.forEach(node => {
    createPage({
      component: template,
      path: `/article/${node.fields.slug}`,
      context: {
        slug: node.fields.slug,
      },
    })
  })
}

module.exports = {
  createPages,
  onCreateNode,
}
```

```tsx
// src/templates/article.js
export default function Article({ data }) {
  return (
    <div>
      <p>{ data.markdownRemark.frontmatter.title }</p>
      ...
    </div>
  )
}

// 上面设置的context: { slug: node.fields.slug }
// 这个slug会自动作为实参调用graphql
export const query = graphql`
  query($slug: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      ...
    }
  }
`
```

## 数据源(source)插件
数据源插件负责从Gatsby 应用外部获取数据，创建数据查询节点供开发者使用。步骤：
- `gatsby clean`：清除上一次的构建内容
- 在项目根目录里下创建 plugins 文件夹，在此文件夹中继续创建具体的插件文件夹，比如 `gatsby-source-mystrapi/` 文件夹
- 在插件文件夹中创建 `gatsby-node.js` 文件
- 插件实际上就是 npm 包
- 导出 `sourceNodes` 方法用于获取外部数据，创建数据查询节点
- 在 `gatsby-config.js` 文件中配置插件，并传递插件所需的配置参数
- 重新运行应用

我们自己的strapi插件：
```ts
// plugins/gatsby-source-mystrapi/gatsby-node.js
const axios = require("axios")
const pluralize = require("pluralize")
const createNodeHelper = require("gatsby-node-helpers").default

async function sourceNodes({ actions }, configOptions) {
  const { createNode } = actions
  const { apiUrl, contentTypes } = configOptions  // 这个是自定义的参数，里面的值是在导入的时候传进来的参数

  // 转换：Post -> posts, Product -> products
  const types = contentTypes
    .map(type => type.toLowerCase())
    .map(type => pluralize(type))

  // 从外部数据源中获取数据
  let final = await getContents(types, apiUrl)
  for (let [name, data] of Object.entries(final)) {
    // 构建数据节点对象: allPostsContent allProductsContent
    const { createNodeFactory } = createNodeHelper({
      typePrefix: name,      // 设置数据层中的名字的中间那一段
    })
    const createNodeObject = createNodeFactory("content") // 设置数据层中的名字的suffix
  
    // 根据数据节点对象创建节点
    data.forEach(item => {
      createNode(createNodeObject(item))
    })
  }
}

async function getContents(types, apiUrl) {
  const size = types.length
  let index = 0

  const final = {}    // { posts: [], prodcuts: [] }
  await loadContents()
  async function loadContents() {
    if (index === size) return
    const { data } = await axios.get(`${apiUrl}/${types[index]}`)
    final[types[index++]] = data
    await loadContents()
  }

  return final
}

module.exports = {
  sourceNodes,
}
```
导入我们写的插件：
```ts
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-mystrapi",
      // options会作为configOptions传给插件的configOptions
      options: {
        apiUrl: "http://localhost:1337",
        contentTypes: ["Post", "Product"],
      },
    },
  ]
}
```

## 转换(transformer)插件开发
transformer插件将 source 插件提供的数据转换为新的数据。假设我们要转换xml => object
- 在 plugins 文件夹中创建 `gatsby-transformer-xml` 文件夹
- 在插件文件夹中创建 `gatsby-node.js` 文件
- 在文件中导出 `onCreateNode` 方法用于构建 Gatsby 查询节点
- 根据节点类型筛选 xml 节点 node.internal.mediaType --> application/xml
- 通过 `loadNodeContent` 方法读取节点中的数据
- 通过 xml2js 将 xml 数据转换为对象
- 将对象转换为 Gatsby 查询节点
- 在 `gatsby-config.js` 文件中配置插件

```ts
// plugins/gatsby-transformer-xml/gatsby-node.js
const { parseString } = require("xml2js")
const { promisify } = require("util")
const parse = promisify(parseString)
const createNodeHelpers = require("gatsby-node-helpers").default

// 每个节点创建的时候都会调用这个函数，可以在这个函数里面转换
async function onCreateNode({ node, loadNodeContent, actions }) {
  const { createNode } = actions

  // 判断node是否是我们需要转换的节点
  if (node.internal.mediaType === "application/xml") {
    let content = await loadNodeContent(node)
    let obj = await parse(content, {
      explicitArray: false,
      explicitRoot: false,
    })

    const { createNodeFactory } = createNodeHelpers({ typePrefix: "XML" })
    const createNodeObject = createNodeFactory("parsedContent")

    createNode(createNodeObject(obj))
  }
}

module.exports = {
  onCreateNode,
}
```

导入我们写的插件：
```ts
// gatsby-config.js
module.exports = {
  plugins: [
    "gatsby-transformer-xml",
  ]
}
```