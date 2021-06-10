const Compiler = require('./Compiler')
const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')

const webpack = function (options) {
  // 实例化 compiler 对象
  const compiler = new Compiler(options.context)
  compiler.options = options

  // 这个默认插件让compiler具体文件读写能力
  // 所有插件的挂载api都是new xxxPlugin().applu(compiler)
  new NodeEnvironmentPlugin().apply(compiler)

  // 挂载其它所有plugin至compiler对象身上
  const { plugin } = options;
  if (plugin && Array.isArray(plugin)) {
    for (const p of plugin) {
      p.apply(compiler)
    }
  }

  // 挂载所有webpack内置的插件（入口）
  new WebpackOptionsApply().process(options, compiler);

  // 05 返回 compiler 对象即可
  return compiler
}

module.exports = webpack