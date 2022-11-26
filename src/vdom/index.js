// _c() 
// _c('div', {id:'app'},  _c('div',{style:{color: 'red'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
export function createElement(vm, tag, data={}, ...children){
if(data == null){
    data = {}
}
let key = data.key;
if(key){
    delete data.key
}

    return vnode(vm, tag, key, data, children)
}

// _v()
export function createTextVNode(vm, text){
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, key, data, children, text){
    // key用于diff算法
    // ast做的时语法层面的转换，描述语法本身
    // 虚拟DMOM描述dom元素， 可以增加自定义属性
     let vnode = {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
// console.log('vnode',vnode) 虚拟DOM中表达式已经被替换
    return vnode
}