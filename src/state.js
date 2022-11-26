import { observe } from "./observe/index"

export function initState(vm){
    const opts = vm.$options

    if(opts.data){
        initData(vm)
    }
}

// 进行数据劫持、数据代理
function initData(vm){
    let data = vm.$options.data
    data = typeof data === 'function'? data.call(vm):data

    vm._data = data
    // 使用defineProperty实现属性劫持代理
    observe(data)

    // 将vm._data的数据代理到vm
    for (const key in data) {
        proxy(vm, '_data', key)
    }
}

function proxy(vm, target, key){
    Object.defineProperty(vm, key, {
        get(){
            return vm[target][key]
        },
        set(newValue){
            if(newValue ===  key) return
            vm[target][key] = newValue
        }
    })
}
