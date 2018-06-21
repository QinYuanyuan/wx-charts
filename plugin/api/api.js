// api.js => 接口插件文件夹，可以存放插件所需要的接口

let systemInfo = null;

// 获取插件信息
function getPluginInfo() {
  return {
    name: 'aleVIN',
    version: '1.0.0',
    date: '2018-05-05'
  }
}

//设置设备信息
function setSystemInfo(value) {
  systemInfo = value;
  
}

//获取设备信息
function getSystemInfo() {
  let systemInfo = wx.getSystemInfoSync();
  return systemInfo;
}



module.exports = {
  getPluginInfo,
  getSystemInfo,
  setSystemInfo,
}