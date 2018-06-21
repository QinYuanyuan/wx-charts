// index.js => 插件的入口文件

let api = require('./api/api.js')


// 获取设备信息
wx.getSystemInfo({
  success: function (res) {
    // 存数据
    api.setSystemInfo(
      {
        model: res.model,
        system: res.system
      }
    )
  },
})

// 这里暴露出去的方法是在插件的外部使用的，给插件的调用者提供接口
module.exports = {
  // getPluginInfo: api.getPluginInfo,
  getSystemInfo: api.getSystemInfo,
  vinReault: api.vinReault,
}