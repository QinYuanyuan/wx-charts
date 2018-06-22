Page({

  data: {

  },

  onLoad: function(options) {

  },

  toIdentificationFn(e) {
    console.log(1212121212, e.detail.result);
    wx.redirectTo({
      url: `/pages/identification/identification?vin=${e.detail.result.meta.vin}&model=${JSON.stringify(e.detail.result)}`,
    })
  },

  toCameraErrorFn(e) {
    console.log('toCameraErrorFn',e)
    wx.redirectTo({
      url: `/pages/camera-error/camera-error?vin=${e.detail.result.meta.vin}&imageSrc=${e.detail.result.meta.path}`,
    })
  },
})