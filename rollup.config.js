import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: './src/index.js',
    output: {
        file: './dis/vue.js', // 文件出口
        name: 'Vue', // 创建一个全局Vue对象,模块内的属性方法挂在在该实例下
        format: 'umd',  // 打包文件运用社区规范
        sourcemap: true // 支持debugger源代码调试
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        resolve()
    ]

}