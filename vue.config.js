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
  }),

  devServer: {
    proxy: {
      /* "/v2": {
        target: "http://120.79.178.33:30570",
        ws: true,
        secure: false,
        changeOrigin: true
      }, */
      "/logTransmit": {
        target: "https://120.79.175.99:30537",
        ws: true,
        changeOrigin: true
      },
      "/47.75.85.181": {
        target: "http://47.75.85.181:30570", // hk
        ws: true,
        changeOrigin: true,
        pathRewrite: {"/47.75.85.181" : ""}
      },
      "/120.77.150.206": {
        target: "http://120.77.150.206:30570", // cn
        ws: true,
        changeOrigin: true,
        pathRewrite: {"/120.77.150.206": ""}
      },
      "/47.91.107.36": {
        target: "http://47.91.107.36:30570",// dubai
        ws: true,
        changeOrigin: true,
        pathRewrite: {"/47.91.107.36" : ""}
      },
      "/47.90.188.115": {
        target: "http://47.90.188.115:30570", // eusa
        ws: true,
        changeOrigin: true,
        pathRewrite: {"/47.90.188.115" : ""}
      },
      "/120.79.178.33": {
        target: "http://120.79.178.33:30570",  // test
        ws: true,
        changeOrigin: true,
        pathRewrite: {"^/120.79.178.33" : ""}
      }
    }
  }
};
