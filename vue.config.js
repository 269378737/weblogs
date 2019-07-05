const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  baseUrl: ".",
  assetsDir: "static",
  configureWebpack: () => ({
    // mode: "production",
    plugins: [
      new CompressionPlugin({
        // 打包时启用gzip压缩
        minRatio: 1
      })
    ]
    // externals: {
    //   vue: "Vue",
    //   "vue-router": "VueRouter",
    //   vuex: "Vuex",
    //   axios: "axios",
    //   lodash: "_",
    //   jsencrypt: "JSEncrypt"
    // }
  }),

  devServer: {
    proxy: {
      "/v2": {
        target: "http://120.79.178.33:30570",
        ws: true,
        changeOrigin: true
      }
    }
  }
};
