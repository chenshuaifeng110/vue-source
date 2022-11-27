// let strFn = `
// function f(){
//     return 4
// }
// `
// let fn = new Function(strFn)

// console.log(fn.toString())

// with 语句可以方便地用来引用某个特定对象中已有的属性
var obj = {
    a: 1,
    b: 2,
    c: void 0
  }
  
  with (obj) {
     a = a + b;
     c = a;
  }
  
  console.log(obj.c) 