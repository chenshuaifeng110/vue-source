
import {newArrayProto} from './array'
import Dep from './dep'
class Obsereve{
    constructor(data){
        // 如果是对象类型，在数组方法重写过程中造成调用栈溢出
        // 将此属性变为不可枚举
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        // 数组类型数据，通过数组的七个方法实现
        if(Array.isArray(data)){
            // 将this保存到data上，供重写方法使用
            // data调用了数组的push等方法
            // 注释掉下面代码是因为__ob__属性在上面代码中已经被定义为静态属性
            // data.__ob__ = this
            // 重写数组的七个方法，修改数组本身
           data.__proto__ = newArrayProto
            this.observeArray(data)
        }else{
            // Object.defineProperty只能劫持已有的属性，对后增、删除无法劫持（$set $delete）
            this.walk(data)
        }
    }
    // 劫持代理对象方法
    walk(data){
        // 循环对象
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    // 劫持代理数组的方法
    // 此方法可以监控到数组内的对象属性
    // 无法监测到数组索引改变
    observeArray(data){
        data.forEach(item => observe(item))
    }
}

export function defineReactive(target, key, value){
    // 为每个dep增加dep
    let dep = new Dep()
    // value可能是个对象
    // 如果是对象递归劫持
    observe(value)
    Object.defineProperty(target, key, {
        get(){
            if(Dep.target){
                dep.depend() // 让这个属性的DEP记住当前的watcher
            }
            return value
        },
        set(newValue){
            if(newValue ===  value) return
            // 直接赋值一个对象的情况
            observe(newValue)
            value = newValue
            dep.notify() // 更新时
        }
    })
}

// 使用defineProperty实现属性劫持代理
export function observe(data){
    // 对对象进行劫持
    if(typeof data !== 'object' || data === null) return

    if(data.__ob__ instanceof Obsereve){
        // 已经代理过了
        return data.__ob__
    }
    // 如果对象已经被劫持过 则不需要在进行劫持
    // 增添一个实例用实例来判断是否被劫持
    return new Obsereve(data)
}

