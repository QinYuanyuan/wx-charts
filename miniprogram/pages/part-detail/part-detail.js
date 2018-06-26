Page({

  data: {
    psn: '',
    category_id: '',
  },

  onLoad: function (options) {
    this.setData({
      psn: options.psn,
      category_id: options.category_id,
    })
  },
})