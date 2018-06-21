

//测试环境host
// const host = 'https://api.maijian.heqiauto.com/v1';
// const epcHost = 'http://api.epc.heqi.io'

//预发环境
// const host = 'https://pre-api.parts.heqiauto.com/v1'
// const host = 'https://pre-api.aleqipei.com/v1'

//正式环境
const host = 'https://api.parts.heqiauto.com/v1'
const epcHost = 'https://api.epc.heqiauto.com'

// let Promise = require('../libs/es6-promise')


/**
 * _request header中不存在Authorization字段的请求
 * @param   string   url    请求地址
 * @param   strung   method 请求方法
 * @param   object   data   请求中包含的数据
 * @return  promise         
 */
let _request = function (url, { data = {}, header = {}, method = 'GET', dataType = 'json', config = { isRefresh: false, isEpc: false } } = {}) {

  let defaultHeader = {
    'Content-Type': 'application/json'
  }
  Object.assign(defaultHeader, header);//用于将所有可枚举的属性的值从一个或多个源对象复制到目标对象

  return new Promise(function (resolve, reject) {
    wx.request({
      url: config.isEpc ? epcHost + url : host + url,
      method,
      data: config.isEpc ? Object.assign(data, {
        client_id: 'retNdnPKjkrJbYT',
        secret_key: 'vVBx2alN24q6U7xQGADWql0OFrYC+vDK'
      }) : data,
      dataType,
      header: defaultHeader,
      success: function (res) {
        let data = res.data
        if (!data.success) {
          let error = data.errors[0]
          if (error.error_code > 1000) {     // 如果服务器错误信息代码>1000，则抽出错误信息并抛出
            reject(new Error(error.error_msg))
          } else { // 否则返回数据信息
            if (config.isRefresh) {
              let query = '?';
              // for (let key in options) {
              //   if (options.hasOwnProperty(key)) {
              //     query += `${key}=${options[key]}&`
              //   }
              // }
              // currentPage.setData({ __isRefresh__: true, __refreshRoute__: `${route}${query}` });
              reject(new Error('网络错误'));
            } else {
              resolve(data)
            }
          }
        } else {
          resolve(data);
        }
      },
      fail(err) { // 网络错误
        console.log('fail')

        // console.log(err)
        // let errMsg = err.errMsg.split(' ')[1]
        // reject(new Error(errMsg))
        // if (config.isRefresh) {
        //   let query = '?';
        //   for (let key in options) {
        //         if (options.hasOwnProperty(key)) {
        //           query += `${key}=${options[key]}&`
        //         }
        //       }
        //   currentPage.setData({ __isRefresh__: true, __refreshRoute__: `${route}${query}` });
        // }
        reject(new Error('网络错误'))
      }
    })
  })
} 

let refillToken = function () {
  let app = getApp()

  return new Promise(function (resolve, reject) {
    fetchCode()
      .then(function (code) {
        return _request('/token', 'GET', {
          code
        })
      })
      .then(function (res) {
        if (res.success) {
          let result = res.result
          if (result.is_binding === 0) {
            wx.redirectTo({
              url: '/pages/binds/binds'
            })
          } else {
            app.globalData.token = result.token

            resolve()
          }
        } else {
          let error = res.errors[0]
          throw new Error(error.error_msg)
        }
      })
      .catch(function (err) {
        reject(err.message)
        util.error(err.message)
      })
  }) 
}


/**
 * request header中存在Authorization字段的请求
 * @param  string   url    请求地址
 * @param  strung   method 请求方法
 * @param  object   data   请求中包含的数据
 * @param  object   config 是否触发页面整体刷新
 * @return promise         
 */
let request = function (url, { data = {}, header = {}, method = 'GET', dataType = 'json', config = { isRefresh: false } } = {}) {
  // const app = getApp();
  // const pages = getCurrentPages(), currentPage = pages[pages.length - 1];
  // const route = currentPage.route; // 获取页面刷新路径
  // const options = currentPage.options; // 获取页面的options
  

  let defaultHeader = {
    'Content-Type': 'application/json',
    'x-authorization': app.globalData.token
  };

  Object.assign(defaultHeader, header);

  return new Promise(function (resolve, reject) {
    wx.request({
      url: host + url,
      method,
      data, 
      dataType,
      header: defaultHeader,
      success(res) {
        let data = res.data
        if (!data.success) {
          let error = data.errors[0]
          if (error.error_code > 1000) {     // 如果服务器错误信息代码>1000，则抽出错误信息并抛出
            reject(new Error(error.error_msg))
          } else { // 否则返回数据信息
            if (config.isRefresh) {
              let query = '?';
              // for (let key in options) {
              //   if (options.hasOwnProperty(key)) {
              //     query += `${key}=${options[key]}&`
              //   }
              // }
              currentPage.setData({ __isRefresh__: true, __refreshRoute__: `${route}${query}` });
            } else {
              resolve(data)
            }
          }
        } else {
          resolve(data)
        }
      },
      fail(err) { // 网络错误
        console.log('fail')
        // if (config.isRefresh) {
        //   let query = '?';
        //   for (let key in options) {
        //         if (options.hasOwnProperty(key)) {
        //           query += `${key}=${options[key]}&`
        //         }
        //       }
        //   currentPage.setData({ __isRefresh__: true, __refreshRoute__: `${route}${query}` });
        // }
          
        reject(new Error('网络错误'))
      }
    })
  })
} 

let partRequest = function (url, { data = {}, method = 'GET', dataType = 'json'} = {}){
  return new Promise(function(resolve,reject){
    wx.request({
      url: 'https://epc.heqiauto.com'+url,
      method,
      dataType,
      data,
      success:function(res){
        let data = res.data;
        if(data.success){
          resolve(data.result)
        }else{
          // reject(new Error(data.errors[0].error_msg))
        }
      },
      fail:function(err){
        
      }
    })
  })
}


export default {
  request,
  _request,
  // fetchCode,
  refillToken,
  partRequest,
}