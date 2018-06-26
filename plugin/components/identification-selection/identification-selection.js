Component({

  properties: {
    models: {
      type: Array,
    }
  },

  data: {},
  ready() {},

  methods: {
    chooseModel(e) {
      this.triggerEvent('chooseModel',{index: e.currentTarget.dataset.index})
    }
  }
})
