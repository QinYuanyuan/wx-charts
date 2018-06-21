// pages/part-detail/part-detail.js
Page({

  data: {
    psn: '',
    category_id: '',
  },

  onLoad: function (options) {
    console.log(options);
    this.setData({
      psn: options.psn,
      category_id: options.category_id,
    })
  },

  onShow: function () {
  
  },

 
})