let s = require('../../api/services.js');
let reVin = require('../../api/re.js').reVIN;
let services = s.default;


Component({
  properties: {
    search: {
      type: Object,
    },
    showResultList: { //各个tab下的结果展示列表
      type: Array,
    },
    pageSearchType: { // home表示从首页进入该组件；part表示从配件列表页面进入该组件
      type: String,
    },
    showTip: { //是否显示未搜索到的标识
      type: Boolean,
    },
    searchFlag: { //标识着是否搜索过，搜索过置为true
      type: Boolean,
    }
  },

  data: {
    tabState: '', //搜索结果中的tab状态
    focus: true,
  },

  methods: {
    toCameraFn() {
      this.triggerEvent('toCameraFn');
    },

    // 触发搜索框搜索事件
    searchFn() {
      this.setData({
        'search.status': true,
      })
      this.triggerEvent('initSearch', {
        search: this.data.search,
      })
    },

    // 取消事件
    blurSearch() {
      this.setData({
        'search.status': false,
        showTip: false,
        searchFlag: false,
      });
      if (this.data.pageSearchType === 'home') {
        wx.setNavigationBarTitle({
          title: '首页'
        })
      }

      this.clearSearch();
      this.triggerEvent('initSearch', {
        search: this.data.search,
        showResultList: []
      })
    },

    // 清空搜索栏
    clearSearch() {
      this.setData({
        'search.query': '',
        'search.inputQuery': '',
        // 'search.status': false,
        'search.list.status': false,
        'search.list.result': [],
        showResultList: [],
        showTip: false,
        searchFlag: false,
      });
      this.triggerEvent('initSearch', {
        search: this.data.search,
        showResultList: []
      })
    },

    // 触发搜索
    focusSearch() {
      this.setData({
        'search.status': true
      });
      if (this.data.pageSearchType === 'home') {
        wx.setNavigationBarTitle({
          title: '阿乐汽配'
        })
      }
    },

    setSearch(e) {
      const query = e.detail.value;
      this.setData({
        'search.query': e.detail.value,
        tabState: '',
      });
      if (query && !/^[a-zA-Z0-9]{17}$/.test(query)) {
        services._request(`/home/search?kw=${e.detail.value}`).then(r => {
          if (r.success) {
            if (this.data.search.query) {
              // 将搜索到的品牌过滤
              let filterResult = [];
              r.result.forEach((item, index) => {
                if (item.item_type !== 'part_brand') {
                  filterResult.push(item);
                }
              })
              this.setData({
                'search.list.result': filterResult,
                'search.list.status': true,
                showResultList: filterResult,
                showTip: r.result.length === 0 ? true : false,
                searchFlag: true,
              })
            }
          }
        })
      } else {
        this.setData({
          'search.list.result': [],
          showResultList: [],
          'search.list.status': false,
          showTip: false,
        })
      }
    },

    execSearch() {
      let vin = this.data.search.query;
      if (/^[a-zA-Z0-9]{17}$/.test(vin)) {
        // 进入identification页面 然后通过vin查询车型信息，告诉该页面该入口的特征
        this.triggerEvent('toIdentificationFn', {
          vin: vin,
        })
      }
    },

    // 消除之前保存全局的车型信息的影响
    // clearGlobalModel() {
    //   app.globalData.modelInfo = {};
    //   app.globalData.modelId = '';
    //   app.globalData.seriesId = '';
    // },

    checkSearch(e) {
      const item = this.data.showResultList[e.currentTarget.dataset.index];
      // this.clearGlobalModel();

      switch (item.item_type) {
        case 'part': // 配件
          this.blurSearch();
          let categoryId = Number(item.item_id.substr(1, 4)); //psn中的第1到第5位是categoryId
          this.triggerEvent('toDetailFn', {
            search: {
              status: false,
              query: '',
              inputQuery: '',
              list: {
                result: [],
                status: false,
              },
              actualQuery: '',
            },
            psn: item.item_id,
            category_id: categoryId
          })
          break;
        case 'car_series': // 车系
          this.blurSearch();
          this.triggerEvent('getSearchPartList', {
            series_id: item.item_id,
            series_name: item.content,
          })
          break;
        case 'part_brand': // 配件品牌
          this.blurSearch();
          this.triggerEvent('getBrandListFn');
          this.triggerEvent('getSearchPartList', {
            brand_id: item.item_id,
            brand_name: item.content,
          })
          break;
        case 'part_category_virtual': // 配件品类
          this.blurSearch();
          this.triggerEvent('getSearchPartList', {
            category_id: String(item.item_id),
            category_name: item.content,
          })
          break;
      }
    },

    tabChangeFn(e) {
      let tabType = e.currentTarget.dataset.tabType;
      if (!tabType) { //全部tab
        this.setData({
          tabState: tabType,
          showResultList: this.data.search.list.result,
        })
        if (this.data.searchFlag) {
          this.setData({
            showTip: this.data.search.list.result.length === 0 ? true : false,
          })
        }
      } else {
        let showResultList = [];
        showResultList = this.data.search.list.result.filter((item, index) => {
          return item.item_type === tabType;
        })
        this.setData({
          tabState: tabType,
          showResultList: showResultList,
        })
        if (this.data.searchFlag) {
          this.setData({
            showTip: showResultList.length === 0 ? true : false,
          })
        }
      }
    },
  }
})