const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配到的分组是一个开始标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配到的分组是一个结束标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/; // 匹配属性
const startTagClose = /^\s*(\/?)>/; // 匹配</tag> <tag/>

// Vue3不是正则，一个字符进行判断
// htmlparse2 与这个模块相似

// 组装树结构数据，构建父子关系
// 利于栈特点前面进栈是父亲后面进栈是儿子
const ELEMENT_TYPE = 1;
const TEXT_TYPE = 3;
let root // 根节点
let currentParent // 指向栈中最后一个节点(文本节点或标签结束节点)的父节点
const stack = [] // 存放元素

// 进行模板解析
export function parseHTML(html) {
    // 循环解析
    while (html) {
        let textEnd = html.indexOf('<') // <div>a</div>  如果是0则是开始或结束标签 
        if (textEnd === 0) {
            // 解析开始标签
            const startTagMatch = parseStartTag(html) //  { tagName: "div", attrs:[{name:id,value:app}]}
            if (startTagMatch) {
                // 如果开始标签有值
                // console.log('startTagMatchhtml', html) 内部嵌套的开始标签解析完成，到达文本标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            // 解析结束标签
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
            break
        }
        if (textEnd > 0) {
            // 到达我们的文本节点
            let text = html.substring(0, textEnd) // 获取文本节点
            if (text) {
                chart(text)
                advance(text.length)
            }
        }
    }
    //解析开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen) // match接受一个正则返回一个数组
        if (start) {
            const match = {
                tagName: start[1],// 标签名 start = {start[1]: 'div', start[]: '<div'}
                attrs: [],// 属性名
            }
            // 匹配到开始标签删除开始标签，开始匹配属性
            advance(start[0].length)
            // console.log('match', match)
            // console.log('html', html)

            // 循环匹配
            // 如果不是开始标签的结束一直循环取属性
            // 把匹配的结果保存到attr
            // 再把已经匹配的属性删除
            let attr;
            let end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // console.log('attr', attr)   [' id="app"', 'id', '=', 'app', undefined, undefined]
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
                advance(attr[0].length)
            }
            if (end) {
                // console.log('end的html', html) >
                // 把结束标签的>删除
                advance(end[0].length)
            }
            // console.log('endhtml', html) ''
            // console.log('match', match) { tagName: "div", attrs:[{name:id,value:app}]}
            return match
        }
        return false // 不是开始标签
    }
    // 向后截取字符
    function advance(n) {
        html = html.substring(n)
    }


    // 转换为抽象树语法结构
    // const obj = [
    //     {
    //         tag: 'div',
    //         type: 1,
    //         attrs: [
    //             {
    //                 name: 'id',
    //                 value: '#app'
    //             }
    //         ],
    //         parent: null,
    //         children: [
    //             {
    //                 tag: 'div',
    //                 type: 1,
    //                 attrs: [
    //                     {
    //                         name: 'class',
    //                         value: 'error'
    //                     }
    //                 ],
    //                 parent: {
    //                     tag: 'div',
    //                     type: 1,
    //                     attrs: [
    //                         {
    //                             name: 'id',
    //                             value: '#app'
    //                         }
    //                     ],
    //                     parent: null,
    //                 },
    //                 children: [

    //                 ]
    //             },
    //             {
    //                 tag: 'span',
    //                 type: 3,
    //                 attrs: [
    //                     {
    //                         name: 'id',
    //                         value: '#span'
    //                     }
    //                 ],
    //                 parent: {
    //                     tag: 'div',
    //                     type: 1,
    //                     attrs: [
    //                         {
    //                             name: 'id',
    //                             value: '#app'
    //                         }
    //                     ],
    //                     parent: null,
    //                 },
    //                 children: [

    //                 ]
    //             }
    //         ]
    //     }
    // ]
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }



    // 因为只讲html删除没有获取 所以定义方法获取html
    function start(tag, attrs) {
        // 获取开始标签
        // console.log('start', tag, attrs)
        let node = createASTElement(tag, attrs)
        if (!root) {
            // 第一个节点即根节点
            root = node
        }
        if (currentParent) {
            // 第一个节点的父节点没有则指向自己
            // 给当前节点添加父节点
            node.parent = currentParent
            // 给当前节点push子节点
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node; // 最后一个节点

    }
    function chart(text) {
        text = text.replace(/\s/g, '')
        // 获取文本
        // console.log('text', text)
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        // 获取结束标签 校验标签是否合法 对比
        stack.pop() // 弹出最后一个节点因为这个节点是根节点 根节点后进栈  
        currentParent = stack[stack.length - 1]  // 最新栈最后一个是子节点，获取它的父节点减一
        // console.log('end', tag)
    }


    // console.log(root)
    // 将解析的ast模板数据返回
    return root
    // console.log( html) ''
}