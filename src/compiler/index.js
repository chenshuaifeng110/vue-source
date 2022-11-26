
import {parseHTML} from './parse'

//  {            
//     tag: 'div',
//     type: 1,
//     attrs: [
//         {
//             name: 'id',
//             value: '#app'
//         }
//     ],
//     parent: null,
// }
// text: "{{name}}hello"
// 生成属性字符串
function genProps(attrs){
    let str = '' 
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i] 
        if(attr.name === 'style'){
            // color:red;background:red; => {color: 'red'}
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`       
    }
    return `{${str.slice(0, -1)}}`
}
function genChildren(el){
    const children = el.children;
    if(children){
        return children.map(child => gen(child)).join(',')
    }
}

function gen(node){
    // 区分文本和元素标签
    // const ELEMENT_TYPE = 1;
    if(node.type === 1){
        // 元素节点
        return codegen(node)
    }else{
        // 文本节点
        // 纯文本
        // 插值表达式
        const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  // 匹配表达式变量
        let text = node.text
        // console.log('text', defaultTagRE.test(text))
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})`
        }else{
            // _v处理文本 _c处理元素标签 _json字符串
            // _v(_s(name)+'hello'+_s(name))
            let tokens = []
            let match
            defaultTagRE.lastIndex = 0 // 重复捕获
            let lastIndex = 0
            // console.log('defaultTagRE', defaultTagRE.exec(text))
            while( match = defaultTagRE.exec(text)){
                // console.log('match--------------',match)  ['{{name}}', 'name', index: 0, input: '{{name}}hello{{age}}', groups: undefined]
                let index = match.index  // 拿到表达式开始的索引 {{name}} hello {{age}} hello
                tokens.push(`_s(${match[1].trim()})`)
                // console.log(tokens)   ['_s(name)', '_s(age)']
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                // 记录位置匹配中间hello字符
                lastIndex = index + match[0].length
           }
           // 匹配最后一个hello
           if(lastIndex < text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
           }
           return `_v(${tokens.join('+')})`
        }
    }
}
function codegen(ast){

    let children = genChildren(ast);
    // 转换字符串
    // 继续处理子节点
    let code = (`_c('${ast.tag}',${ast.attrs.length>0 ?genProps(ast.attrs):'null' }${ast.children.length>0? `,${children}`:''})`)
    return code
}

export function cpmpileToFuntion(template) {
    // 1. 将template转换成ast语法树
    let ast = parseHTML(template)
    // console.log('ast', ast)
    // 2. 生成render方法，render方法返回的虚拟DOM

    // render(h){
    //     // 形容html内容 标签名+属性
    //     return _c('div', {id:'app'},  _c('div',{style:{color: 'read'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
    // }
    // console.log('ast',ast)
    // console.log(codegen(ast)) _c('div',{id:"app",style:{"color":" red","background-color":" pink"}},_c('div',{style:{"color":" red"}},_v(_s(name)+_s(age)+"hello"+"hello")),_c('span',null,_v("code")))
    // _v处理文本 _c处理元素标签 _json字符串
    let code = codegen(ast)
    // console.log(code)

    //with增强函数从对象属性上取值 vm.name
    // 将插值表达式转换为值的一部
    code = `with(this){return ${code}}`

    // 生成render函数
    // 让字符串运行 
    let render = new Function(code)  // 字符串变为函数运行

    // 模板引擎实现原理 with + new Funcion
    return render
    // console.log(render.toString) [Function: anonymous]
}