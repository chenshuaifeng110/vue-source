import {createTextVNode, createElement} from './vdom'
import Watcher from './observe/watcher'

//_c('div',{style:{color: 'red', width: '10px'}}, _v(_s(name)+'hello'))

export function mountComponent(vm, el){
    vm.$el = el
    // 1. 调用render方法产生虚拟DOM
    let vnode = vm._render()
   // 将虚拟DOM转换成真是DOM
   vm._update(vnode) 
    // 2. 根据虚拟DOM产生真是DOM
    // 3. 插入到el元素中

    // true渲染标识
    const updateComponent = ()=>{
        vm._update(vm._render())
    }
    const watcher = new Watcher(vm, updateComponent, true)
    console.log(watcher)
}
// oldVNode是#app
// vnode 虚拟DOM
function patch(oldVNode, vnode){
    // console.log('patch')
    // console.log('vnode', vnode)
    // 创建新元素
    const isRealElement = oldVNode.nodeType;
    if(isRealElement){
        const el = oldVNode;
        const parentEle = el.parentNode;
        // 创建真实DOM
        let newEle = createEle(vnode)
        // console.log('DOM',newEle)
        parentEle.insertBefore(newEle, el, el.nextSibling)
        parentEle.removeChild(el)
        return   newEle
    }else{
        // diff 算法
    }
}
function createEle(vnode){
    let  {
        vm,
        tag,
        key,
        data,
        children,
        text
    } = vnode
    if(typeof tag === 'string'){
        // 标签
        // 将真实标签和虚拟标签对应，如果虚拟节点的属性发生变化就可以直接找到真实节点
        // 使用createElement的api创建真实标签
        // console.log('tag', tag)
       vnode.el = document.createElement(tag)
        //    console.log('el',vnode.el) 创建div div span 标签
       // 更新属性
       patchProps( vnode.el, data)
       children.forEach(child => {
        // 将真实子节点添加到父节点
        // 递归添加实现循环创建子节点
        vnode.el.appendChild(createEle(child))
       })
    }else{
        // 文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
// 标签 div
// 属性 {style{color: ' red'}}
function patchProps(el, props){
    // console.log('patchProps',el, props)
    for (const key in props) {
        if(key === 'style'){
            for (const styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        }else{
            el.setAttribute(key, props[key])
        }
    }
}
export function initLifeCycle(Vue) {
    Vue.prototype._update = function(vnode){
        //  console.log('vnode', vnode) 表达式已经解析了
        // 变量重新赋值，实现了状态变换后的视图更新
        const vm = this
        const el = vm.$el
        // 将虚拟DOM转换为真是DOM
        vm.$el = patch(el, vnode)
        // console.log('el',el)
        // console.log('vnode',vnode)
        
    }
    Vue.prototype._render = function(){
        // 渲染时会从实例中取值，这样就可以将属性和视图绑定
        // 就是说已经解析出插值表达式
        return this.$options.render.call(this)
    }

    //  _c('div', {id:'app'},  _c('div',{style:{color: 'read'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
    // vm, tag, props
    Vue.prototype._c = function(){
        return createElement(this, ...arguments)
    }
    Vue.prototype._v = function(){
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function(value){
        if(typeof value !== 'object') return value
        return JSON.stringify(value)
    }
}