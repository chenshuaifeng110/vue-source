// let strFn = `
// function f(){
//     return 4
// }
// `
// let fn = new Function(strFn)

// console.log(fn.toString())


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