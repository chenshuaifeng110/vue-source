// 1. 观察者模式实现依赖收集
// 2. 异步更新策略
// 3. mixin的实现原理
// 渲染逻辑vm._update(vm._render())
// 模板中的那些地方用到了响应式属性
// 给模板中的属性增加一个收集器 dep
// 页面渲染时候,将渲染逻辑封装到watcher
// dep记住这个warcher,属性发生变化找到对应的dep就可以重新渲染

import Dep from "./dep";

// 多个组件实例对应对各watcher实例
let id=0
export default class Watcher{
    constructor(vm, callback, flag){
        this.renderWatcher = flag
        this.id = id++
        this.getter = callback;
        this.depsId = new Set()
        this.deps = []
        this.get() // 渲染方法放在最后面不然 deps为undefined
    }
    get(){
        // dep和watcher关联
        // Dep添加一个静态属性,指向wathcer
        // 1. 当创建wathcer时候,把watcher挂载到Dep.target上
        // 2. 调用_render()取值走到get
        // this指向当前watcher target包含id 和render函数的更新方法callback
        // 执行get取值会调用Dep中方法  收集依赖
        // console.log(this)b
        Dep.target =this
        // 开始编译渲染
        this.getter()
        Dep.target =null
    }

    addDep(dep){
        this.deps
        // 一个组件有多个属性 重复属性不用记录
        let id = dep.id
        // 去重后再push
        if(!this.depsId.has(id)){
            this.depsId.add(id)
            this.deps.push(dep)
            dep.addSub(this) // 让dep记住wathcer
        }
    }

    update() {
        // 异步更新 当多个属性同时更新时,只更新一次
        // 原理放在一个定时器中,主执行栈同步代码执行完毕,调用定时器执行一次
        // 节省性能
        queueWatcher(this)

        // 更新渲染 重新生成虚拟dom
        // this.get()
    }
    
    run() {
        console.log('update')
        this.get()
    }

    //  给模板中的属性增加一个收集器 dep, 收集wathcer
    // 一个组件中有多个属性, n个属性对应n个watcher,一个dep(props在多个组件使用)对应多个watcher
}

let queue = []
let has = {} // 去重
let pending = false;
function queueWatcher(watcher) {
    const id = watcher.id
    if(!has[id]){
        queue.push(watcher)
        has[id] = true;
        // 多个组件更新,也只执行一次
        console.log(queue)
        if(!pending){
            setTimeout(flushSchedulerQueue, 0)
            pending = true
        }
    }
}


function flushSchedulerQueue(){
    let flushQueue = queue.splice(0)
    flushQueue.forEach(q =>q.run())   // 再刷新的过程中如果有新的watcher重新放到队列中 所以对queue拷贝操作     
    queue = []
    has = {}
    pending = false
}


// vm.age = 4
// vm.name = 'abc'
// console.log(app.innerHTML) <div style="color: red;">csf18hellocsfhello</div><span>code</span 获取失败
// 因为更新是异步跟新的 获取html是同步
// 用户输入的情况 1. 同步更新 2. 定时器 3. async await
// 微任务优先执行
// Promise.resolve().then(() =>{
//     console.log(app.innerHTML) // name= sfc
// })

// 所以nextTick不是创建异步任务, 而是将创建任务队列,按照进栈顺序执行
let callbacks =[]
let waiting = false
export function nextTick(callback){
    callbacks.push(callback)
    if(!waiting){
        Promise.resolve().then(flushCallbacks)
        // setTimeout(() =>{
        //     flushCallbacks()
        // },)
    }
    waiting = true
}

function flushCallbacks(){
    let cbs =  callbacks.slice(0) // 拷贝数组
    waiting = true
    callbacks = [];
    cbs.forEach(cb => cb())
}