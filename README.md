## 国际化脚本工具

### 自动复制
compare.tool.js 脚本可以对比新生成的 messages.xlf 和 原有的 messages.en.xlf 的内容, 在保留 messages.en.xlf 原有内容的基础上加入 messages.xlf 新生成的内容;
compare.tool.js 脚本执行后生成的内容保存在同目录的 messages.en.target.xlf 文件下, 脚本执行保证了所有的内容都按照 messages.xlf 的内容顺序进行排列
```bash
node compare.tool.js > ./messages.en.target.xlf
```

### 自动翻译
translate.tool.js 脚本的功能是进行自动化翻译, 以 messages.en.target.xlf 为源文件来进行翻译, 需要提供翻译内容的 json 模板并放置于根目录下的 translate.js 文件里(如若需要更换 js 文件位置,请对应更换脚本的路径)
translate.js 文件的生成流程, 复制提供的翻译文档(可能是表格或者 word 文档)到 VSCode 软件里使用快捷键进行快速的格式转换, 然后在 translate.js 文件里通过 `module.exports` 进行导出(如果提供的就是 json 格式则省去数据格式转换这一步,直接 module 导出)
```bash
node translate.tool.js > ./messages.en.xlf
```

### 温馨提示
在给 html 文档标签加 i18n 属性时，能在子标签加就尽量在子标签加，避免跨层级去加。因为此翻译工具只做了对包含一个或不包含 `<x />` 标签的内容进行翻译的处理。