import {createTextVNode, createElement} from './vdom'
export function mountComponent(vm, el){
    vm.$el = el
    // 1. 调用render方法产生虚拟DOM
    let vnode = vm._render()
   // 将虚拟DOM转换成真是DOM
   vm._update(vnode) 
    // 2. 根据虚拟DOM产生真是DOM
    // 3. 插入到el元素中
}
function patch(oldVNode, vnode){
    // 创建新元素
    const isRealElement = oldVNode.nodeType;
    if(isRealElement){
        const el = oldVNode;
        const parentEle = el.parentNode;
        let newEle = createEle(vnode)
        parentEle.insertBefore(newEle, el, el.nextSibling)
        parentEle.removeChild(el)
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
        // 将真实节点和虚拟节点对应，如果虚拟节点的属性发生变化就可以直接找到真实节点
       vnode.el = document.createElement(tag)
       // 更新属性
       patchProps( vnode.el, data)
       children.forEach(child => {
        // 将真实子节点添加到父节点
        // 递归添加
        vnode.el.appendChild(createEle(child))
       })
    }else{
        // 文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
//_c('div',{style:{color: 'red', width: '10px'}}, _v(_s(name)+'hello'))
function patchProps(el, props){
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
        const el = this.$el
        // 将虚拟DOM转换为真是DOM
        patch(el, vnode)
        console.log(vnode, el)
        
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