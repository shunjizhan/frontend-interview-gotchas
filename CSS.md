# CSS相关
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

## flex布局
https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html

## grid布局
https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html
有点像更高级的flex，不仅有flex的justify-content之类的核心api，还可以直接在css里面把每个grid复杂的百分比都定好，思路有点像是在css里面把整个页面的格子先画好，非常强大。

## 画三角形
https://codesandbox.io/s/cssshi-xian-san-jiao-xing-forked-hpr6v

## reference
- https://juejin.cn/post/6844903799446831117