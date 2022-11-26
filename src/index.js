import {initMixin} from './init'
import {initLifeCycle} from './lifecycle'


// 使用构造函数的方法来创建类
function Vue(options){
    // 调用实例_init初始化
    this._init(options)
}

initMixin(Vue)  // 为Vue实例扩展init方法
initLifeCycle(Vue)

export default Vue
