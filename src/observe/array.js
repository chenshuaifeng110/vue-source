// 重写数组部分方法

import {observe} from ''
let oldArrayProto = Array.prototype; 

// 拷贝原有的数组中的成员
export let newArrayProto = Object.create(oldArrayProto)


// newArrayProto.push = function

// 需要重写数组的方法
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

// 重写数组方法
// 内部调用原来的方法，函数劫持切片生成
methods.forEach(method =>{
    newArrayProto[method] = function(...args) {
        // this 指向 data
        // 谁调用了这个数组的方法this指向谁
        const result = oldArrayProto[method].call(this, ...args)
        // 增强功能
        let inserted
        let ob = this.__ob__
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'unshift':
                inserted = args.splice(2) // arr.splice(index, num ,parms)
        }
        if(inserted){
            ob.observeArray(inserted)
        }
        return result
    }
})