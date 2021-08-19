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

## references
- https://mp.weixin.qq.com/s/zVCB0Gj_yq_xNuRPW8a2iQ