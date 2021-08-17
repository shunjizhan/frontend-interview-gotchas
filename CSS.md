## CSS相关
### 100种垂直居中的方法
- 把line-height设置成parent的line-height
```scss
$height: 100px;
#parent {
  height: $height;
  #child { line-height: $height; }
}
```

- flex的align-item: center
```scss
// 怎么用来着
```


### 100种水平居中的方法
- transition
```scss
// 什么50% 50%来着
```

- 父元素设置flex的justify-content：center
```scss
#parent {
  display: flex;
  justify-content：center;
}
```

- 父元素设置align-item: center（有些细节是啥来着）
```scss
#parent {
  align-item: center
}
```

### flex布局

### grid布局