(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('')) :
  typeof define === 'function' && define.amd ? define([''], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 重写数组部分方法
  var oldArrayProto = Array.prototype;

  // 拷贝原有的数组中的成员
  var newArrayProto = Object.create(oldArrayProto);

  // newArrayProto.push = function

  // 需要重写数组的方法
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];

  // 重写数组方法
  // 内部调用原来的方法，函数劫持切片生成
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // this 指向 data
      // 谁调用了这个数组的方法this指向谁
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      // 增强功能
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'unshift':
          inserted = args.splice(2);
        // arr.splice(index, num ,parms)
      }

      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Obsereve = /*#__PURE__*/function () {
    function Obsereve(data) {
      _classCallCheck(this, Obsereve);
      // 如果是对象类型，在数组方法重写过程中造成调用栈溢出
      // 将此属性变为不可枚举
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      // 数组类型数据，通过数组的七个方法实现
      if (Array.isArray(data)) {
        // 将this保存到data上，供重写方法使用
        // data调用了数组的push等方法
        // 注释掉下面代码是因为__ob__属性在上面代码中已经被定义为静态属性
        // data.__ob__ = this
        // 重写数组的七个方法，修改数组本身
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        // Object.defineProperty只能劫持已有的属性，对后增、删除无法劫持（$set $delete）
        this.walk(data);
      }
    }
    // 劫持代理对象方法
    _createClass(Obsereve, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
      // 劫持代理数组的方法
      // 此方法可以监控到数组内的对象属性
      // 无法监测到数组索引改变
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Obsereve;
  }();
  function defineReactive(target, key, value) {
    // value可能是个对象
    // 如果是对象递归劫持
    observe(value);
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        // 直接赋值一个对象的情况
        observe(newValue);
        value = newValue;
      }
    });
  }

  // 使用defineProperty实现属性劫持代理
  function observe(data) {
    // 对对象进行劫持
    if (_typeof(data) !== 'object' || data === null) return;
    if (data.__ob__ instanceof Obsereve) {
      // 已经代理过了
      return data.__ob__;
    }
    // 如果对象已经被劫持过 则不需要在进行劫持
    // 增添一个实例用实例来判断是否被劫持
    return new Obsereve(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }

  // 进行数据劫持、数据代理
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // 使用defineProperty实现属性劫持代理
    observe(data);

    // 将vm._data的数据代理到vm
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        if (newValue === key) return;
        vm[target][key] = newValue;
      }
    });
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配到的分组是一个开始标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配到的分组是一个结束标签名
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/; // 匹配属性
  var startTagClose = /^\s*(\/?)>/; // 匹配</tag> <tag/>

  // Vue3不是正则，一个字符进行判断
  // htmlparse2 与这个模块相似

  // 组装树结构数据，构建父子关系
  // 利于栈特点前面进栈是父亲后面进栈是儿子
  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;
  var root; // 根节点
  var currentParent; // 指向栈中最后一个节点(文本节点或标签结束节点)的父节点
  var stack = []; // 存放元素

  // 进行模板解析
  function parseHTML(html) {
    // 循环解析
    while (html) {
      var textEnd = html.indexOf('<'); // <div>a</div>  如果是0则是开始或结束标签 
      if (textEnd === 0) {
        // 解析开始标签
        var startTagMatch = parseStartTag(); //  { tagName: "div", attrs:[{name:id,value:app}]}
        if (startTagMatch) {
          // 如果开始标签有值
          // console.log('startTagMatchhtml', html) 内部嵌套的开始标签解析完成，到达文本标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        // 解析结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
        break;
      }
      if (textEnd > 0) {
        // 到达我们的文本节点
        var text = html.substring(0, textEnd); // 获取文本节点
        if (text) {
          chart(text);
          advance(text.length);
        }
      }
    }
    //解析开始标签
    function parseStartTag() {
      var start = html.match(startTagOpen); // match接受一个正则返回一个数组
      if (start) {
        var match = {
          tagName: start[1],
          // 标签名 start = {start[1]: 'div', start[]: '<div'}
          attrs: [] // 属性名
        };
        // 匹配到开始标签删除开始标签，开始匹配属性
        advance(start[0].length);
        // console.log('match', match)
        // console.log('html', html)

        // 循环匹配
        // 如果不是开始标签的结束一直循环取属性
        // 把匹配的结果保存到attr
        // 再把已经匹配的属性删除
        var attr;
        var _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // console.log('attr', attr)   [' id="app"', 'id', '=', 'app', undefined, undefined]
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }
        if (_end) {
          // console.log('end的html', html) >
          // 把结束标签的>删除
          advance(_end[0].length);
        }
        // console.log('endhtml', html) ''
        // console.log('match', match) { tagName: "div", attrs:[{name:id,value:app}]}
        return match;
      }
      return false; // 不是开始标签
    }
    // 向后截取字符
    function advance(n) {
      html = html.substring(n);
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
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    // 因为只讲html删除没有获取 所以定义方法获取html
    function start(tag, attrs) {
      // 获取开始标签
      // console.log('start', tag, attrs)
      var node = createASTElement(tag, attrs);
      if (!root) {
        // 第一个节点即根节点
        root = node;
      }
      if (currentParent) {
        // 第一个节点的父节点没有则指向自己
        // 给当前节点添加父节点
        node.parent = currentParent;
        // 给当前节点push子节点
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node; // 最后一个节点
    }

    function chart(text) {
      text = text.replace(/\s/g, '');
      // 获取文本
      // console.log('text', text)
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      // 获取结束标签 校验标签是否合法 对比
      stack.pop(); // 弹出最后一个节点因为这个节点是根节点 根节点后进栈  
      currentParent = stack[stack.length - 1]; // 最新栈最后一个是子节点，获取它的父节点减一
      // console.log('end', tag)
    }

    // console.log(root)
    // 将解析的ast模板数据返回
    return root;
    // console.log( html) ''
  }

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
  function genProps(attrs) {
    var str = '';
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.name === 'style') {
        (function () {
          // color:red;background:red; => {color: 'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        })();
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function genChildren(el) {
    var children = el.children;
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }
  function gen(node) {
    // 区分文本和元素标签
    // const ELEMENT_TYPE = 1;
    if (node.type === 1) {
      // 元素节点
      return codegen(node);
    } else {
      // 文本节点
      // 纯文本
      // 插值表达式
      var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配表达式变量
      var text = node.text;
      // console.log('text', defaultTagRE.test(text))
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // _v处理文本 _c处理元素标签 _json字符串
        // _v(_s(name)+'hello'+_s(name))
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0; // 重复捕获
        var lastIndex = 0;
        // console.log('defaultTagRE', defaultTagRE.exec(text))
        while (match = defaultTagRE.exec(text)) {
          // console.log('match--------------',match)  ['{{name}}', 'name', index: 0, input: '{{name}}hello{{age}}', groups: undefined]
          var index = match.index; // 拿到表达式开始的索引 {{name}} hello {{age}} hello
          tokens.push("_s(".concat(match[1].trim(), ")"));
          // console.log(tokens)   ['_s(name)', '_s(age)']
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          // 记录位置匹配中间hello字符
          lastIndex = index + match[0].length;
        }
        // 匹配最后一个hello
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function codegen(ast) {
    var children = genChildren(ast);
    // 转换字符串
    // 继续处理子节点
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length > 0 ? ",".concat(children) : '', ")");
    return code;
  }
  function cpmpileToFuntion(template) {
    // 1. 将template转换成ast语法树
    var ast = parseHTML(template);
    // console.log('ast', ast)
    // 2. 生成render方法，render方法返回的虚拟DOM

    // render(h){
    //     // 形容html内容 标签名+属性
    //     return _c('div', {id:'app'},  _c('div',{style:{color: 'read'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
    // }
    // console.log('ast',ast)
    // console.log(codegen(ast)) _c('div',{id:"app",style:{"color":" red","background-color":" pink"}},_c('div',{style:{"color":" red"}},_v(_s(name)+_s(age)+"hello"+"hello")),_c('span',null,_v("code")))
    // _v处理文本 _c处理元素标签 _json字符串
    var code = codegen(ast);
    // console.log(code)

    //with增强函数从对象属性上取值 vm.name
    // 将插值表达式转换为值的一部
    code = "with(this){return ".concat(code, "}");

    // 生成render函数
    // 让字符串运行 
    var render = new Function(code); // 字符串变为函数运行

    // 模板引擎实现原理 with + new Funcion
    return render;
    // console.log(render.toString) [Function: anonymous]
  }

  // _c() 
  // _c('div', {id:'app'},  _c('div',{style:{color: 'red'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  // _v()
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, key, data, children, text) {
    // key用于diff算法
    // ast做的时语法层面的转换，描述语法本身
    // 虚拟DMOM描述dom元素， 可以增加自定义属性
    var vnode = {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
    // console.log('vnode',vnode) 虚拟DOM中表达式已经被替换
    return vnode;
  }

  function mountComponent(vm, el) {
    vm.$el = el;
    // 1. 调用render方法产生虚拟DOM
    var vnode = vm._render();
    // 将虚拟DOM转换成真是DOM
    vm._update(vnode);
    // 2. 根据虚拟DOM产生真是DOM
    // 3. 插入到el元素中
  }

  function patch(oldVNode, vnode) {
    // 创建新元素
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      var el = oldVNode;
      var parentEle = el.parentNode;
      var newEle = createEle(vnode);
      parentEle.insertBefore(newEle, el, el.nextSibling);
      parentEle.removeChild(el);
    }
  }
  function createEle(vnode) {
    vnode.vm;
      var tag = vnode.tag;
      vnode.key;
      var data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      // 标签
      // 将真实节点和虚拟节点对应，如果虚拟节点的属性发生变化就可以直接找到真实节点
      vnode.el = document.createElement(tag);
      // 更新属性
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        // 将真实子节点添加到父节点
        // 递归添加
        vnode.el.appendChild(createEle(child));
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  //_c('div',{style:{color: 'red', width: '10px'}}, _v(_s(name)+'hello'))
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      //  console.log('vnode', vnode) 表达式已经解析了
      var el = this.$el;
      // 将虚拟DOM转换为真是DOM
      patch(el, vnode);
      console.log(vnode, el);
    };
    Vue.prototype._render = function () {
      // 渲染时会从实例中取值，这样就可以将属性和视图绑定
      // 就是说已经解析出插值表达式
      return this.$options.render.call(this);
    };

    //  _c('div', {id:'app'},  _c('div',{style:{color: 'read'}}, _v(_s(name)+'hello')),_c('span',undefined, _v(_s(name)+'hello')))
    // vm, tag, props
    Vue.prototype._c = function () {
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
  }

  // 初始化Vue
  var initMixin = function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // 将options选项挂载在this
      vm.$options = options;

      // 初始化状态
      initState(vm);

      // 采用虚拟DOM
      // 将模板变成js语法，通过js语法生成虚拟DOM
      // 语法转换 es6--> es5
      // 将template转换为el元素
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      var template;
      if (!ops.render) {
        // 使用$mount挂载情况
        if (!ops.template && el) {
          // 再根节点上挂载模板的情况
          template = el.outerHTML;
        } else {
          // 在options挂载模板
          if (el) {
            template = ops.template;
          }
        }
        if (template) {
          // 进行模板编译
          var render = cpmpileToFuntion(template);
          ops.render = render;
          // render函数
          console.log(ops.render);
        }
      }
      // 在options内部有render
      // 使用$mount挂载情

      mountComponent(vm, el); // 组件挂载 调用render函数产生虚拟DOM
      // script标签引用的vue是浏览器编译
      // runtime是不包含模板编译，模板编译是打包的时候通过loader转义。
    };
  };

  // 使用构造函数的方法来创建类
  function Vue(options) {
    // 调用实例_init初始化
    this._init(options);
  }
  initMixin(Vue); // 为Vue实例扩展init方法
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
