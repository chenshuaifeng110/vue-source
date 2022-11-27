import {initMixin} from './init'
import {initLifeCycle} from './lifecycle'
import {nextTick} from './observe/watcher'

// 使用构造函数的方法来创建类
function Vue(options){
    // 调用实例_init初始化
    this._init(options)
}
Vue.prototype.$nextTick = nextTick
initMixin(Vue)  // 为Vue实例扩展init方法
initLifeCycle(Vue)

export default Vue
