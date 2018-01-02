cc.Class({
  extends: cc.Component,

  properties: {
    initY: 555,
    initX: 375,
    index: null,
    game: null
  },

  // use this for initialization
  onLoad: function () {

  },
  init: function (game, data) {
    this.game = game
    this.node.children[0].getComponent('cc.Label').string = data.title
    this.node.children[1].getComponent('cc.Label').string = data.content
    let add = false
    for (let i = 0; i < game.barrage.length; i++) {
      let x = this.initX + this.node.width / 2,
        y = this.initY - 50 * i - i * 10
      if (game.barrage[i].length > 0) {
        let arr = game.barrage[i],
          index = arr.length - 1,
          width = arr[index].x + arr[index].width / 2
        if (width < this.initX) {
          this.node.setPosition(x, y)
          this.index = [i, arr.length]
          this.game.barrage[i].push(this.node)
          add = true
          break
        }
      } else {
        this.node.setPosition(x, y)
        this.index = [i, 0]
        game.barrage[i][0] = this.node
        add = true
        break
      }
    }
    if (!add) {
      game.barrage.push([])
      let index = game.barrage.length - 1,
        x = this.initX + this.node.width / 2,
        y = this.initY - 50 * index - index * 10
      this.node.setPosition(x, y)
      this.index = [index, 0]
      this.game.barrage[index].push(this.node)
    }
  },

  // called every frame, uncomment this function to activate update callback
  update: function (dt) {
    try {
      if (this.node.x) {
        // console.log(this.node.x);
        let newX = this.node.x - 5,
          newY = this.node.y
        this.node.setPosition(newX, newY)
        let posX = -1 * this.initX - this.node.width / 2
        if (this.node.x < posX) {
          this.game.barrage[this.index[0]].shift()
          this.node.destroy()
        }
      }
    } catch (e) {

    }
  }
})
