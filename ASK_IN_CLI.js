const requiredPrompts = [
    {
        type: 'input',
        name: 'repoNameEn',
        message: 'please input repo English Name ? (e.g. `smart-case`.focus.cn)',
    },
    {
        type: 'input',
        name: 'repoNameZh',
        message: 'please input repo Chinese Name ?(e.g. `智慧水利`)',
    },
];
// 需要修改字段所在文件
const effectFiles = [
    `readme.md`,
    `package.json`,
    // ...
]
module.exports = {
    requiredPrompts,
    effectFiles,
};