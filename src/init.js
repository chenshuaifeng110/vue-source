import { initState } from "./state"
import {cpmpileToFuntion} from './compiler'
import {mountComponent} from './lifecycle'
// 初始化Vue
export const initMixin = (Vue) => {
    Vue.prototype._init = function(options){
        const vm = this
        // 将options选项挂载在this
        vm.$options = options

        // 初始化状态
        initState(vm)

        // 采用虚拟DOM
        // 将模板变成js语法，通过js语法生成虚拟DOM
        // 语法转换 es6--> es5
        // 将template转换为el元素
        if(options.el){
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function(el) {
        const vm = this
        el = document.querySelector(el);

        let ops = vm.$options
        let template
        if(!ops.render){
            // 使用$mount挂载情况
            if(!ops.template && el){
                // 再根节点上挂载模板的情况
                template = el.outerHTML

            }else{
                // 在options挂载模板
                if(el){
                    template = ops.template
                }
            }
            if(template){
                // 进行模板编译
                const render = cpmpileToFuntion(template)
                ops.render = render
                // render函数
                console.log(ops.render)
            }
        }
        // 在options内部有render
        // 使用$mount挂载情

        mountComponent(vm,el) // 组件挂载 调用render函数产生虚拟DOM
        // script标签引用的vue是浏览器编译
        // runtime是不包含模板编译，模板编译是打包的时候通过loader转义。
    }
} 



