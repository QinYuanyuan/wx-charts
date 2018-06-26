Page({

  data: {
    
  },

  onLoad: function(options) {
    
  },

  toIdentificationFn(e) {
    wx.redirectTo({
      url: `/pages/identification/identification?vin=${e.detail.result.meta.vin}&model=${JSON.stringify(e.detail.result)}`,
    })
  },

  toCameraErrorFn(e) {
    wx.redirectTo({
      url: `/pages/camera-error/camera-error?vin=${e.detail.result.meta.vin}&imageSrc=${e.detail.result.meta.path}`,
    })
  },
})