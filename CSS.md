# CSS相关

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [CSS相关](#css相关)
  - [8种水平居中的方法](#8种水平居中的方法)
    - [行内元素](#行内元素)
    - [块级元素](#块级元素)
  - [8种垂直居中的方法](#8种垂直居中的方法)
    - [行内元素](#行内元素-1)
    - [块级元素](#块级元素-1)
  - [3种水平垂直居中的方法](#3种水平垂直居中的方法)
  - [两栏布局](#两栏布局)
  - [三栏布局](#三栏布局)
  - [块元素，行内元素、行内块元素](#块元素行内元素行内块元素)
  - [flex布局](#flex布局)
  - [grid布局](#grid布局)
  - [画三角形](#画三角形)
  - [z-index无效的情况](#z-index无效的情况)
  - [css选择器的优先级](#css选择器的优先级)
  - [reference](#reference)

<!-- /code_chunk_output -->

## 8种水平居中的方法
### 行内元素
```css
.parent {
  text-align: center;
}
```

### 块级元素
```scss
/* 一般方式 */
.son {
  margin: 0 auto;
}

/* 一般方式有width的情况 */
.son {
  position: absolute;
  width: 宽度;
  left: 0;
  right: 0;
  margin: 0 auto;
}

/* 子元素含 float */
.parent{
  width: fit-content;
  margin: 0 auto;
}

.son {
  float: left;
}

/* Flex 弹性盒子 */
.parent {
  display: flex;
  justify-content: center;
}

/* 老版flex */
.parent {
  display: box;
  box-orient: horizontal;
  box-pack: center;
}

/* 直接用transform */
.son {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
}

/* 手写实现transform */
$width: 50px;
.son {
  position: absolute;
  width: $width;
  left: 50%;
  margin-left: calc(-0.5 * #{$width})
}
```

## 8种垂直居中的方法
### 行内元素
```scss
$height: 100px;
.parent {
  height: $height;
}

.son {
  line-height: $height;
}
```

### 块级元素
- 把line-height设置成parent的line-height
```scss
/* 行内块级元素 */
.parent::after, .son{
  display: inline-block;
  vertical-align: middle;
}
.parent::after{
  content: '';
  height: 100%;
}

/* table */
.parent {
  display: table;
}
.son {
  display: table-cell;
  vertical-align: middle;
}

/* 一般情况 */
.son {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
}

/* flex */
.parent {
  display: flex;
  align-items: center;
}

/* 老版flex */
.parent {
  display: box;
  box-orien: vertical;
  box-pack: center;
}

/* transform */
.son {
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
}

/* 手写transform */
$height: 50px;
.son {
  position: absolute;
  top: 50%;
  height: $height;
  margin-top: calc(-0.5 * #{$height});
}
```

## 3种水平垂直居中的方法
```css
/* flex */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* transfrom */
.parent {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); 
}

/* 手写transfrom */
$width: 50px;
$height: 50px;
.parent {
  position: absolute;
  width: $width;
  height: $height;
  margin-left: calc(-0.5 * #{$width});
  margin-top: calc(-0.5 * #{$height});
}
```

## 两栏布局
```html
<body>
  <div class="box">
    <div class="left">左边</div>
    <div class="right">右边</div>
  </div>
  内容内容内容
</body>
```

用margin left
```css
.left {
  float: left;
  width: 200px;
  height: 400px;
}
.right {
  margin-left: 210px;
  height: 200px;
}
```

absolute
```css
.box {
  position: relative;
  height: 100px;
}
.left {
  position: absolute;
  width: 200px;
  height: 100px;
}
.right {
  margin-left: 200px;
}
```

flex
```css
.box {
  display: flex;
  height: 100px;
}
.left {
  width: 200px;
}
.right {
  flex: 1;
}
```

## 三栏布局
- absolute
```css
.outer {
  position: relative;
  height: 100px;
}

.left {
  position: absolute;
  width: 100px;
  height: 100px;
}

.right {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100px;
}

.center {
  margin-left: 100px;
  margin-right: 200px;
  height: 100px;
}
```
- flex
```css
.outer {
  display: flex;
  height: 100px;
}

.left {
  width: 100px;
}

.right {
  width: 100px;
}

.center {
  flex: 1;
}
```
- 圣杯
```css
.outer {
  height: 100px;
  padding-left: 100px;
  padding-right: 200px;
}

.left {
  position: relative;
  left: -100px;

  float: left;
  margin-left: -100%;

  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  position: relative;
  left: 200px;

  float: right;
  margin-left: -200px;

  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  float: left;

  width: 100%;
  height: 100px;
  background: lightgreen;
}
```

双飞翼


## 块元素，行内元素、行内块元素
块元素
- 常用块元素：div，p，ul，li，h1~h6，dl，dt，dd等
- 支持全部样式
- 可以设置宽高，如果没有设置宽度属性，则宽度默认为父级宽度的百分之百
- 盒子占据一行，即使设置了宽度

内联元素（行内元素）
- 常见的有：a，span，em，b，strong，i
- 不支持宽高、上下margin、上下padding
- 宽高由元素内容决定，如果是图片就为图片大小，如果字体30就按照30
- 盒子并在一行中
- 代码换行时盒子会自动产生间距。解决办法：将父元素中的font-size设置为0，再重新设置子元素的font-size。
- 子元素是内联元素的话，父元素可用text-align设置对其方式

内联块元素
- 常见的有：image
- 支持全部样式
- 可以自己设置宽高，如果元素没有设置宽高，则由内容决定
- 盒子并在一行
- 代码换行，盒子产生间距
- 父元素可用text-align设置子元素对其方式

## flex布局
https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html

flex就是弹性盒布局，CSS3 的新属性，用于方便布局，比如垂直居中

容器的属性：
- flex-direction: row | row-reverse | column | column-reverse
- flex-wrap: nowrap | wrap | wrap-reverse
- flex-flow: [flex-direction] || [flex-wrap]
- justify-content: flex-start | flex-end | center | space-between | space-around
- align-items: flex-start | flex-end | center | baseline | stretch
- align-content: flex-start | flex-end | center | space-between | space-around | stretch

项目的属性:
- order: [数字]         /* default 0 */
- flex-grow: [数字]     /* default 0 */
- flex-shrink: [数字]   /* default 1 */
- flex-basis: [length] | auto   /* default auto */
- flex: auto => 1 1 auto | none => 0 0 auto
- align-self: auto | flex-start | flex-end | center | baseline | stretch

## grid布局
https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html
有点像更高级的flex，不仅有flex的justify-content之类的核心api，还可以直接在css里面把每个grid复杂的百分比都定好，思路有点像是在css里面把整个页面的格子先画好，非常强大。

## 画三角形
https://codesandbox.io/s/cssshi-xian-san-jiao-xing-forked-hpr6v

## z-index无效的情况
z-index只对定位元素有效。

- 父标签position属性为relative
- 问题标签无position属性，或者position是static
- 问题标签含有浮动(float)属性

解决办法：
- position:relative改为position:absolute；
- 浮动元素添加position属性（如relative，absolute等）；
- 去除浮动。

## css选择器的优先级
- !important 会覆盖页面内任何位置的元素样式
- 内联样式，如 style="color: green"，权值为 1000
- ID 选择器，如#app，权值为 0100
- 类、伪类、属性选择器，如.foo, :first-child, div[class="foo"]，权值为 0010
- 标签、伪元素选择器，如 div::first-line，权值为 0001
- 通配符、子类选择器、兄弟选择器，如*, >, +，权值为 0000
- 继承的样式没有权值

## reference
- https://juejin.cn/post/6844903799446831117
- https://juejin.cn/post/6905539198107942919#heading-37