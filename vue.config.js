module.exports = {
  chainWebpack (config) {
    config.module.rule('pdf')
      .test(/\.pdf$/i)
      .use('file-loader')
      .loader('file-loader')
      .options({ name: 'documents/[name].[hash:8].[ext]' })
  }
}
