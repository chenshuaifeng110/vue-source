
// 为每个属性增加dep

let id=0
class Dep{
    constructor(){
        this.id = id++ // 属性的dep收集多个watcher
        this.subs = [] // 多个watcher
        this.deps=[] // 用于存放多个dep 实现计算属性和组件卸载时的清理工作
    }
    depend(){
        // Dep.target是watcher
        // 当有两个name时候,push两个相同watcher
        // 同时让wacher记录dep
        // this.subs.push(Dep.target)  // 由于dep与wacher多对多关系 需要去重
        Dep.target.addDep(this)
    }
    addSub(watcher){
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher=>watcher.update())
    }
}
// dep与watcher关联做准备,
Dep.target = null
export default Dep