var emptyFunc = function (event) {
  event.stopPropagation()
}
cc.Class({
  extends: cc.Component,

  properties: {
    mask: {
      default: null,
      type: cc.Node
    },
    note: {
      default: null,
      type: cc.Node
    },
    cardIntroduction: {
      default: [],
      type: cc.Node
    },
    cards: {
      default: [],
      type: cc.Node
    },
    close: {
      default: null,
      type: cc.Node
    }
  },
  // use this for initialization
  onLoad: function () {
    let self = this
    this.cards.forEach(function (v, i) {
      if (v) {
        v.on('touchstart', function () {
          self.cardIntroduction[i].active = true
          self.mask.active = true
        })
      }
    })
    this.cardIntroduction.forEach(function (v, i) {
      if (v) {
        v.on('touchstart', function (event) {
          event.stopPropagation()
        })
      }
    })
  },
  backHome: function () {
    let self = this
    let children = self.node.children
    this.mask.on('touchstart', function (event) {
      children.forEach(function (v, i) {
        if (children[16].active || children[7].active || children[2].active || children[10].active) {

        } else {
          children[i].active = false
        }
      })
    })
  },
  cancel: function () {
    let children = this.node.children
    children.forEach(function (v, i) {
      if (children[i].active === true) {
        children[i].active = false
      }
    })
  }

})
