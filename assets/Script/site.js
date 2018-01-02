const pageNode = require('./module/getPageNode')
const http = require('./util/http')
const util = require('./util/util')

cc.Class({
  extends: cc.Component,

  properties: {
    order: {
      default: null,
      type: cc.Label
    },
    progressBar: {
      default: null,
      type: cc.ProgressBar
    },
    game: null,
    sp: null,
    uid: null,
    guess: [],
    controlArr: []
  },

  // use this for initialization
  onLoad: function () {
    // pageNode.getSiteNode(this.node);
  },

  init: function (data) {
    // this.order = {
    //     string:data.order
    // };
    this.order.string = data.order
    // this.orderNode.spriteFrame = this.orders[data.order-1];
    this.game = data.game
    pageNode.getSiteNode(this.node, data.order)
    let siteNode = pageNode.siteNode[this.order.string]
    this.controlArr = [{
      node: siteNode.control1,
      type: VOTE_TYPE.wolf
    }, {
      node: siteNode.control2,
      type: VOTE_TYPE.prophet
    }, {
      node: siteNode.control3,
      type: VOTE_TYPE.guard
    }, {
      node: siteNode.control4,
      type: VOTE_TYPE.witchSave
    }, {
      node: siteNode.control5,
      type: VOTE_TYPE.witchPosion
    }, {
      node: siteNode.control6,
      type: VOTE_TYPE.hunter
    }, {
      node: siteNode.control7,
      type: VOTE_TYPE.votePolice
    }, {
      node: siteNode.control11,
      type: VOTE_TYPE.voteDieInDay
    }, {
      node: siteNode.control9,
      type: VOTE_TYPE.transferEmblem
    }]
    for (let i = 0; i < this.controlArr.length; i++) {
      this.voteControl(this.controlArr[i].node, this.controlArr[i].type)
    }

    // this.voteOperation();
    this.roomGuess({
      seat: this.order.string
    })
    this.sitDown({
      seat: this.order.string
    })

    siteNode.control.on('touchstart', function (event) {
      let control = true
      for (let i = 0; i < this.controlArr.length; i++) {
        if (this.controlArr[i].node.active) {
          // event.stopPropagation();
          this.votePoll(this.controlArr[i].type)
          control = false
          break
        }
      }
      if (control) {
        this.userClickSite()
      }
    }, this)
  },
  guessRule: function (node) {
    // 预测身份
    let siteNode = pageNode.siteNode[this.order.string]
    node.children.forEach(function (v, i) {
      v.on('touchstart', function (event) {
        node.active = false
        siteNode.guess.children[0].color = v.children[0].color
        siteNode.guess.children[0].children[0].getComponent(cc.Label).string = v.children[0].children[0].getComponent(cc.Label).string
        siteNode.guess.children[0].children[0].color = v.children[0].children[0].color
      })
    })
  },
  votePoll: function (type) {
    // 角色投票
    console.log(type)
    let order = this.order.string,
      socket = this.game.webSocket.socket,
      _this = this
    // socket.emit('vote.poll', {
    //     type: type,
    //     seat: order
    // })
    http.post({
      url: HTTPURL + '/wolf100/poll/poll',
      data: {
        type: type,
        seat: order
      },
      header: {
        sign: GAME_INPUT
      },
      success: function (data) {
        data = JSON.parse(data)
        if (data.code == 200) {

        } else {
          _this.game.creatPopUp(data.msg)
        }
      }
    })
    if (type == VOTE_TYPE.witchSave) {
      _this.game.readyGo.restorePollWitch(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.witchPosion) {
      _this.game.readyGo.restorePollWitch(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.prophet) {
      _this.game.readyGo.restorePollProphet(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.guard) {
      _this.game.readyGo.restorePollGuard(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.hunter) {
      _this.game.readyGo.restorePollHunter(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.votePolice) {
      _this.game.readyGo.restorePollPolice(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.transferEmblem) {
      _this.game.readyGo.restorePollMovePolice(_this.game.webSocket, _this.game, pageNode.node)
    }

    if (type == VOTE_TYPE.voteDieInDay) {
      _this.game.readyGo.restorePollDayList(_this.game.webSocket, _this.game, pageNode.node)
    }
  },
  voteControl: function (node, type) {
    // 角色投票按钮
    let _this = this
    node.on('touchstart', function (event) {
      event.stopPropagation()
      _this.votePoll(type)
    })
  },
  userSite: function (data, start) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      _this = this
    this.uid = data.uid
    siteNode.guess.parent.active = false
    if (data.uid == GAME_UID) {
      // this.order.node.parent.color = cc.hexToColor('#5aa23a');
      // siteNode.siteBac.color = cc.hexToColor('#5aa23a');
      siteNode.siteBac.children[0].children[1].children[2].active = true
      siteNode.siteBac.children[0].children[1].children[1].active = false
      USER_SEAT = this.order.string
      this.game.gameControl.children[0].active = true
      this.game.gameControl.children[4].active = true
      node.inviteFriend.active = true
      siteNode.siteBac.children[2].children[0].active = true
      if (data.isMain == 1) {
        node.startGame.active = true
        this.game.webSocket.roomInfo.isMain = 1
        node.cancle.active = false
        GAME_ROOMMAIN = true
      } else {
        if (data.isready == 1) {
          node.cancle.active = true
        } else {
          node.readyGame.active = true
        }
        node.startGame.active = false
      }
    }
    if (data.isMain == 1) {
      siteNode.isMain.active = true
    } else {
      if (data.isready) {
        siteNode.readied.active = true
      } else {
        siteNode.ready.active = true
      }
    }
    if (start == 1) {
      siteNode.isMain.active = false
      siteNode.readied.active = false
      node.startGame.active = false
      node.readyGame.active = false
      node.cancle.active = false
      node.voice.active = false
      node.startSpeak.children[0].active = false
      node.startSpeak.children[1].active = false
      node.startSpeak.children[2].active = false
      node.inviteFriend.active = false
      for (var i = 1; i < 13; i++) {
        pageNode.siteNode[i].empty.children[0].active = false
        pageNode.siteNode[i].empty.children[1].active = false
        pageNode.siteNode[i].empty.children[2].active = true
      }
    }

    // siteNode.avatar.parent.active = true;
    siteNode.ready.active = true
    if (data.nickname.length > 4) {
      data.nickname = data.nickname.substring(0, 4) + '...'
    }
    siteNode.nickname.parent.setPositionX(9.2)
    siteNode.nickname.getComponent(cc.Label).string = data.nickname
    siteNode.empty.active = false
    siteNode.avatar.parent.active = true
    if (data.avatar) {
      util.loadImage(data.avatar, siteNode.avatar, function (sp) {
        _this.sp = sp
      })
    }
    siteNode.avatar.off('touchstart', this.userClickSite, this)
    siteNode.avatar.on('touchstart', this.userClickSite, this)
    let playWifi = node.userInfoDialog.children[0].children[3].children[0]
    playWifi.children[0].active = true
    siteNode.wifi.children[1].children[0].active = true
    siteNode.wifi.active = true
  },
  userClickSite: function () {
    let _this = this,
      siteNode = pageNode.siteNode[this.order.string],
      userNode = pageNode.node.userInfoDialog
    _this.game.kickUserSeat = _this.order.string
    if (true) {
      // GAME_INAPP || GAME_NATIVE
      http.post({
        url: 'https://wtf.xys.ren/263/interface/game.php?input=' + GAME_INPUT,
        data: {
          action: 'hall_maninfo',
          otherUid: _this.uid
        },
        success: function (data) {
          data = JSON.parse(data).data
          if (data) {
            userNode.children[0].getComponent(cc.Sprite).spriteFrame = null
            _this.game.dialogNode.children[0].active = true
            _this.game.dialogNode.children[12].active = true

            if (data.gradeIcon) {
              let lv = userNode.children[0].children[0].children[2].children[0]
              util.loadImage(data.gradeIcon, lv, null)
            }

            if (data.nickname != '') {
              userNode.children[0].children[0].children[0].children[0].getComponent(cc.Label).string = data.nickname
            } else {
              userNode.children[0].children[0].children[0].children[0].getComponent(cc.Label).string = '我没有名字'
            }

            userNode.children[0].children[0].children[0].children[1].children[1].getComponent(cc.Label).string = '人气值 ' + data.myCharm

            let gender = userNode.children[0].children[0].children[1]
            if (data.gender == 1) {
              gender.children[0].active = true
              gender.children[1].active = false
              gender.children[0].children[0].getComponent(cc.Label).string = data.age
            } else {
              gender.children[0].active = false
              gender.children[1].active = true
              gender.children[1].children[0].getComponent(cc.Label).string = data.age
            }

            let uid = userNode.children[0].children[0].children[3]
            uid.children[0].getComponent(cc.Label).string = 'ID:' + data.uid

            let playCount = userNode.children[1].children[0].children[1]
            playCount.getComponent(cc.Label).string = data.totle

            let winPer = userNode.children[1].children[1].children[1]
            winPer.getComponent(cc.Label).string = data.winsLv

            let isFollow = userNode.children[3].children[0]
            if (data.isFollow && data.isFollow == 1) {
              isFollow.children[0].active = false
              isFollow.children[1].active = true
            } else {
              isFollow.children[0].active = true
              isFollow.children[1].active = false
            }

            if (!GAME_ROOMMAIN) {
              userNode.children[3].children[3].active = false
              userNode.children[3].children[4].active = false
            } else {
              userNode.children[3].children[3].active = true
              userNode.children[3].children[4].active = true
            }

            if (data.avatar) {
              util.loadImage(data.avatar, userNode.children[0], null, [250, 250])
            }

            if (data.isseiyuu) {
              userNode.children[0].children[2].active = true
            } else {
              userNode.children[0].children[2].active = false
            }
          }
        }
      })
    }
  },
  roomReady: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    siteNode.isMain.active = false
    if (data.readyType > 0) {
      siteNode.readied.active = true
      if (this.order.string == USER_SEAT) {
        node.readyGame.active = false
        node.cancle.active = true
      }
    } else {
      siteNode.readied.active = false
      if (this.order.string == USER_SEAT) {
        node.readyGame.active = true
        node.cancle.active = false
      }
    }
  },
  roomUserQuit: function (data) {
    console.log('roomUserQuit')
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.ready.active = false
    siteNode.readied.active = false
    siteNode.isMain.active = false
    siteNode.nickname.parent.setPositionX(0)
    siteNode.nickname.getComponent(cc.Label).string = '空'
    siteNode.siteBac.children[2].children[0].active = false
    siteNode.wifi.active = false
    if (USER_ONTREE) {
      if (CANSITEDOWN === 1) {
        siteNode.empty.children[0].active = false
        siteNode.empty.children[1].active = true
      }
    } else {
      siteNode.empty.children[0].active = true
      siteNode.empty.children[1].active = false
    }
    siteNode.empty.active = true

    siteNode.nickname.color = cc.hexToColor('#FFFFFF')
    siteNode.siteBac.children[0].children[1].children[2].active = false
    siteNode.siteBac.children[0].children[1].children[1].active = true

    siteNode.avatar.off('touchstart', this.userClickSite, this)
    console.log(siteNode.empty.active)
    this.hideUserOrder(siteNode)
    this.hideUserRole(siteNode)
    if (siteNode.userTalkLeft.children[0].active || siteNode.userTalkRight.children[0].active) {
      siteNode.userTalkLeft.children[0].active = false
      siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      siteNode.userTalkRight.children[0].active = false
      siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      let socket = this.game.webSocket.socket
      // socket.emit('room.userTalk', {
      //   type: 0
      // })
      if (GAME_INAPP) {
        COMMONOBJ.appUserStopSpeak()
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appUserStopSpeak',
          methodNameIOS: 'appUserStopSpeak',
          methodSignature: '()V',
          parameters: []
        })
      }
    }
  },
  roomMainQuit: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    if (siteNode.readied.active) {
      siteNode.readied.active = false
    }
    siteNode.isMain.active = true
    // this.hideUserRole(siteNode);
  },
  roomStart: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node
    let _this = this
    node.gulpMain.active = false
    this.game.dialogNode.children[9].children[4].active = true
    siteNode.ready.active = false
    siteNode.readied.active = false
    siteNode.isMain.active = false
    // siteNode.userTalk.active = false;
    if (this.order.string != USER_SEAT) {
      siteNode.guess.active = true
      siteNode.guess.parent.active = true
      this.roomGuess(data)
    }
    this.hideUserOrder(siteNode)
    this.hideUserRole(siteNode)
    siteNode.campaign.active = false
    // siteNode.polickOn.active = false;
    // siteNode.policekOut.active = false;
    siteNode.policeIcon.active = false
    let voice = node.voice.getComponent('cc.Animation')
    voice.stop('sound_in')
    voice.play('sound_out')
    if (siteNode.userTalkLeft.children[0].active || siteNode.userTalkRight.children[0].active) {
      siteNode.userTalkLeft.children[0].active = false
      siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      siteNode.userTalkRight.children[0].active = false
      siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      let socket = this.game.webSocket.socket
      // socket.emit('room.userTalk', {
      //   type: 0
      // })
      if (GAME_INAPP) {
        COMMONOBJ.appUserStopSpeak()
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appUserStopSpeak',
          methodNameIOS: 'appUserStopSpeak',
          methodSignature: '()V',
          parameters: []
        })
      }
    }
    for (let i = 1; i < 13; i++) {
      pageNode.siteNode[i].empty.children[0].active = false
      pageNode.siteNode[i].empty.children[1].active = false
      pageNode.siteNode[i].empty.children[2].active = true
    }
    // siteNode.empty.children[0].active = false;
    // siteNode.empty.children[1].active = false;
    // siteNode.empty.children[2].active = false;
  },
  hideUserRole: function (siteNode) {
    siteNode.userRole.children.forEach(function (value, index, array) {
      if (value.active) {
        siteNode.userRole.children[index].active = false
      }
    })
  },
  roomAllotRole: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      _this = this
    // siteNode.ready.active = false;
    // siteNode.readied.active = false;
    // siteNode.isMain.active = false;
    if (data.role == 1) {
      siteNode.ruleOrder.children[0].active = true
      siteNode.userRole.children[0].active = true
      siteNode.userRole.active = true
    }
    if (this.order.string == USER_SEAT) {
      let card = _this.game.gameControl.children[3]
      card.children[data.role - 1].active = true
      card.children[7].children[0].getComponent(cc.Label).string = '位置：' + _this.order.string
      card.active = true
      siteNode.guess.active = false
      siteNode.guess.parent.active = false
      USER_ROLE = data.role

      this.game.dialogNode.children[0].active = true
      node.roleConfirm.active = true
      node.roleConfirm.children[0].active = true
      if (data.icon) {
        // cc.loader.load({
        //     url: data.icon,
        //     type: 'jpg'
        // }, function(err, texture) {
        //     let sp = new cc.SpriteFrame(texture),
        //         sprite = node.roleConfirm.children[0].children[0].getComponent(cc.Sprite),
        //         w = sprite.node.width,
        //         h = sprite.node.height;
        //     sprite.spriteFrame = sp;
        //     sprite.node.width = w;
        //     sprite.node.height = h;
        // });
        util.loadImage(data.icon, node.roleConfirm.children[0].children[0], null)
      }
      node.roleConfirm.children[0].children[1].children[0].children[1].getComponent('cc.Label').string = data.name
      node.roleConfirm.children[0].children[1].children[1].getComponent('cc.Label').string = data.word
      siteNode.userRole.children[data.role - 1].active = true
      siteNode.userRole.active = true
      siteNode.ruleOrder.children[data.role - 1].active = true
      let time = 5,
        label = node.roleConfirmTime.children[1].getComponent(cc.Label)
      label.string = time
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        label.string = time
        if (time <= 0) {
          node.roleConfirm.active = false
          _this.game.dialogNode.children[0].active = false
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    }
  },
  roomPollWolf: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      _this = this
    if (data.isPoll) {
      if (data.canPoll) {
        siteNode.guess.active = false
        siteNode.guess.parent.active = false
        siteNode.userRole.active = true
        siteNode.userRole.children[0].active = true
      }
      //  else {
      //     siteNode.control.active = true;
      //     siteNode.control.children[0].active = true;
      // }
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control1.active = true
      if (data.notKill == 1) {
        siteNode.control1.active = false
        siteNode.protect.active = true
      }
    }
  },
  restorePollWolf: function (data, btnClick) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      wolfVoteNode = siteNode.wolfVote.children,
      length = wolfVoteNode.length
    if (data.isPoll) {
      // if (!data.canPoll) {
      //     siteNode.control.active = false;
      //     siteNode.control.children[0].active = false;
      // }
      siteNode.protect.active = false
      siteNode.control.active = false
      siteNode.control.children[0].active = false
      siteNode.control1.active = false
    }
    if (!btnClick) {
      siteNode.wolfVote.active = false
      for (let i = 0; i < length; i++) {
        if (wolfVoteNode[i].active) {
          wolfVoteNode[i].active = false
        }
      }
    }
  },
  roomPollProphet: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]

    if (data.isPoll) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control2.active = true
    }
  },
  restorePollProphet: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control2.active = false
  },
  voteSeeRole: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      seeRole = this.game.dialogNode.children[5],
      role = seeRole.children[2].children[1].getComponent(cc.Label),
      _this = this
    siteNode.guess.active = false
    siteNode.guess.parent.active = false
    siteNode.userRole.active = true
    if (data.isdie == 1) {
      siteNode.userRole.children[7].active = true
      siteNode.ruleOrder.children[7].active = true
      role.string = '好人'
    } else {
      siteNode.userRole.children[0].active = true
      siteNode.ruleOrder.children[0].active = true
      role.string = '狼人'
    }
    this.game.dialogNode.children[0].active = true
    seeRole.active = true
    seeRole.children[2].children[0].getComponent('cc.Label').string = data.seat + '号玩家是'
    let label = seeRole.children[0].children[0].getComponent(cc.Label),
      time = 10
    label.string = '确定(10S)'
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      label.string = '确定(' + time + ')'
      if (time <= 0) {
        seeRole.active = false
        _this.game.dialogNode.children[0].active = false
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
    if (data.avatar) {
      // cc.loader.load({
      //     url: data.avatar,
      //     type: 'jpg'
      // }, function(err, texture) {
      //     let sp = new cc.SpriteFrame(texture),
      //         sprite = seeRole.children[1].getComponent(cc.Sprite),
      //         w = sprite.node.width,
      //         h = sprite.node.height;
      //     sprite.spriteFrame = sp;
      //     sprite.node.width = w;
      //     sprite.node.height = h;
      // });
      util.loadImage(data.avatar, seeRole.children[1], null)
    }
  },
  roomPollGuard: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    if (data.isPoll == 1) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control3.active = true
    }
  },
  restorePollGuard: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control3.active = false
  },
  roomPollWitch: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    if (data.isPoll == 1) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control5.active = true
    }
    if (data.isPoll == 2) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control4.active = true
    }
    if (data.notKill == 1) {
      siteNode.control4.active = false
      siteNode.control5.active = false
      siteNode.protect.active = true
    }
  },
  restorePollWitch: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control5.active = false
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control4.active = false
    siteNode.protect.active = false
  },
  roomPollHunter: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    this.game.gameControl.children[6].active = false
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control9.active = false
    if (data.isPoll) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control6.active = true
    }
  },
  restorePollHunter: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control6.active = false
  },
  voteHunterKill: function (data) {
    this.restorePollHunter()
    let siteNode = pageNode.siteNode[this.order.string]
    // this.playMusic(3, this.game, 1);
    if (GAME_NATIVE && GAME_SOUND) {
      callNativeMethod({
        methodNameAndroid: 'appPlayVoice',
        methodNameIOS: 'appPlayVoice:',
        methodSignature: '(Ljava/lang/String;)V',
        parameters: ['shooting']
      })
    }
    if (data.poll != 0) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control10.active = true
    }
  },
  votePollNoticeLess (data) {
    if (data.polltype == 11) {
      let siteNode = pageNode.siteNode[this.order.string],
        length = siteNode.wolfVote.children.length

      for (let i = 0, node = siteNode.wolfVote.children; i < length; i++) {
        let order = node[i].children[0].children[0].children[0].getComponent(cc.Label).string
        if (order == data.seat) {
          node[i].active = false
        }
      }
    }
  },
  votePollNotice: function (data) {
    if (data.polltype == 11) {
      let siteNode = pageNode.siteNode[this.order.string],
        node = siteNode.wolfVote.children,
        length = node.length
      siteNode.wolfVote.active = true
      for (let i = 0; i < length; i++) {
        // node[i].active = false;
        if (!node[i].active) {
          node[i].active = true
          node[i].children[0].children[0].children[0].getComponent(cc.Label).string = data.seat
          break
        }
      }
    }
  },
  lastNightResult: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node
    let deathInfo = this.game.dialogNode.children[14]
    let _this = this
    this.roomHideVoteResult(siteNode, this.order.string)
    this.restorePollDay()
    if (data.avatar) {
      // cc.loader.load({
      //     url: data.avatar,
      //     type: 'jpg'
      // }, function(err, texture) {
      //     let sp = new cc.SpriteFrame(texture),
      //         sprite = deathInfo.children[2].children[0].children[0].getComponent(cc.Sprite),
      //         w = sprite.node.width,
      //         h = sprite.node.height;
      //     sprite.spriteFrame = sp;
      //     sprite.node.width = w;
      //     sprite.node.height = h;
      // });
      util.loadImage(data.avatar, deathInfo.children[2].children[0].children[0], null)
    }
    console.log(data)
    if (data.isdie != 0 && data.role != 6) {
      siteNode.control.active = true
      deathInfo.active = true
      deathInfo.children[0].children[0].children[0].children[0].getComponent('cc.Label').string = data.seat
      deathInfo.children[0].children[1].getComponent('cc.Label').string = data.nickname
      if (data.isdie == 1) {
        if (data.role == 7) {
          siteNode.guess.active = false
          siteNode.guess.parent.active = false
          siteNode.userRole.active = true
          siteNode.userRole.children[6].active = true
          siteNode.ruleOrder.children[6].active = true
        }
        deathInfo.children[2].children[1].children[0].active = true
        deathInfo.children[2].children[1].children[1].active = false
        deathInfo.children[2].children[1].children[2].active = false
        deathInfo.children[1].children[0].getComponent('cc.Label').string = '在夜里倒牌'
        siteNode.control.children[0].active = true
        // this.playMusic(0, this.game, 1);
        if (GAME_NATIVE && GAME_SOUND) {
          callNativeMethod({
            methodNameAndroid: 'appPlayVoice',
            methodNameIOS: 'appPlayVoice:',
            methodSignature: '(Ljava/lang/String;)V',
            parameters: ['death']
          })
        }
        siteNode.control8.active = true
      } else if (data.isdie == 2) {
        siteNode.control.active = true
        siteNode.control.children[0].active = true
        siteNode.control10.active = true
        deathInfo.children[1].children[0].getComponent('cc.Label').string = '被猎人猎杀'
        deathInfo.children[2].children[1].children[2].active = true
        deathInfo.children[2].children[1].children[0].active = false
        deathInfo.children[2].children[1].children[1].active = false
      } else if (data.isdie == 6 && data.role == 6) {
        siteNode.guess.active = false
        siteNode.guess.parent.active = false
        siteNode.userRole.active = true
        siteNode.userRole.children[5].active = true
        siteNode.ruleOrder.children[5].active = true
      } else if (data.isdie == 10) {
        siteNode.control.children[0].active = true
        siteNode.boomIcon.active = true
        deathInfo.children[1].children[0].getComponent('cc.Label').string = '已自爆死亡'
        deathInfo.children[2].children[1].children[1].active = true
        deathInfo.children[2].children[1].children[0].active = false
        deathInfo.children[2].children[1].children[2].active = false
      } else if (data.isdie == 4 && data.role != 6) {
        deathInfo.children[2].children[1].children[0].active = true
        deathInfo.children[2].children[1].children[1].active = false
        deathInfo.children[2].children[1].children[2].active = false
        deathInfo.children[1].children[0].getComponent('cc.Label').string = '被投票处决'
        siteNode.control.children[0].active = true
      }
      if (this.order.string == USER_SEAT) {
        node.wolfBoom.active = false
        let text = this.game.gameControl.children[6].children[0].getComponent('cc.Label')
        let death = deathInfo.children[1].children[0].getComponent('cc.Label')
        if (data.isdie == 1) {
          this.game.gameControl.children[6].active = true
          text.string = '您在夜里倒牌'
          death.string = '您在夜里倒牌'
        } else if (data.isdie == 2) {
          this.game.gameControl.children[6].active = true
          text.string = '您被猎人射杀'
          death.string = '您被猎人射杀'
        } else if (data.isdie == 10) {
          this.game.gameControl.children[6].active = true
          text.string = '您已自爆死亡'
          death.string = '您已自爆死亡'
        } else if (data.isdie == 4 && USER_SEAT != 6) {
          this.game.gameControl.children[6].active = true
          text.string = '您被投票处决'
          death.string = '您被投票处决'
        }
        GAME_USERDIE = true
      }
      setTimeout(function () {
        deathInfo.active = false
      }, 2000)
    }
  },
  roomGuess: function (data) {
    // 角色预测
    let _this = this
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.guess.parent.on('touchstart', function (event) {
      for (let i = 1; i < 13; i++) {
        if (pageNode.siteNode[i].guessLeft.active || pageNode.siteNode[i].guessRight.active) {
          pageNode.siteNode[i].guessLeft.active = false
          pageNode.siteNode[i].guessRight.active = false
        }
      }
      if (data.seat >= 1 && data.seat < 7) {
        if (siteNode.guessLeft.active) {
          siteNode.guessLeft.active = false
        } else {
          siteNode.guessLeft.active = true
        }
      } else {
        if (siteNode.guessRight.active) {
          siteNode.guessRight.active = false
        } else {
          siteNode.guessRight.active = true
        }
      }
    })

    this.guessRule(siteNode.guessRight) // 1-6
    this.guessRule(siteNode.guessLeft) // 7-12
  },
  voteOperation: function () {
    // 角色操作
    let siteNode = pageNode.siteNode[this.order.string]
    // siteNode.control.active = true;
    // siteNode.control1.active = true;
    this.voteControl(siteNode.control1, VOTE_TYPE.wolf) // 狼人
    this.voteControl(siteNode.control2, VOTE_TYPE.prophet) // 预言
    this.voteControl(siteNode.control3, VOTE_TYPE.guard) // 守卫
    this.voteControl(siteNode.control4, VOTE_TYPE.witchSave) // 女巫救
    this.voteControl(siteNode.control5, VOTE_TYPE.witchPosion) // 女巫毒
    this.voteControl(siteNode.control6, VOTE_TYPE.hunter) // 猎人
    this.voteControl(siteNode.control7, VOTE_TYPE.votePolice) // 投票选举警长
    this.voteControl(siteNode.control11, VOTE_TYPE.voteDieInDay) // 白天投票
    // this.voteControl(siteNode.control8, VOTE_TYPE.guard); //白天票死标志
    this.voteControl(siteNode.control9, VOTE_TYPE.transferEmblem) // 移交警徽
  },
  speakSpeakSkip: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    let socket = _this.game.webSocket
    // siteNode.selfSpeak.active = true;
    // siteNode.selfSpeak.children[0].active = true;
    // siteNode.control.active = true
    // siteNode.control.children[0].active = true
    siteNode.speakTime.active = true
    let label = siteNode.speakTime.children[1].getComponent(cc.Label),
      time = data.changeTime * 1
    // label.string = time
    siteNode.userTalkLeft.active = true
    siteNode.userTalkRight.active = true
    _this.progressBar.progress = 1
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      let num = time / 60
      // label.string = time
      _this.progressBar.progress = num
      if (time <= 0) {
        siteNode.control.active = false
        siteNode.control.children[0].active = false
        siteNode.speakTime.active = false
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
  },
  speakSpeakSkipTurn: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node
    // siteNode.selfSpeak.active = true;
    // siteNode.selfSpeak.children[0].active = true;
    siteNode.speakTime.active = false
    if (!siteNode.control10.active && !siteNode.control8.active && !siteNode.boomIcon.active && !siteNode.leaveIcon.active) {
      siteNode.control.active = false
      siteNode.control.children[0].active = false
    }
    let label = siteNode.speakTime.children[1].getComponent(cc.Label)
    label.unschedule(label.callback)
  },
  roomStartGameNight: function () {
    let siteNode = pageNode.siteNode[this.order.string]
    this.roomHideVoteResult(siteNode, this.order.string)
    if (siteNode.control11.active) {
      siteNode.control.active = false
      siteNode.control.children[0].active = true
      siteNode.control11.active = false
    }
    this.game.dialogNode.children[15].active = false
  },
  voteGameDay: function () {
    let siteNode = pageNode.siteNode[this.order.string]
    // siteNode.selfSpeak.active = true;
    // siteNode.selfSpeak.children[0].active = true;
    this.restorePollWitch()
  },
  roomPollPolice: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    // siteNode.policekOut.active = false;
    if (data.isPoll) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control7.active = true
    }

    if (data.seat == USER_SEAT && data.canPoll) {
      let control = this.game.gameControl.children[2],
        label = control.children[0].children[0].getComponent(cc.Label)
      control.active = true
      label.string = '放弃(10S)'
      let time = 10
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        label.string = '放弃(' + time + ')'
        if (time <= 0) {
          control.active = false
          siteNode.control.active = false
          siteNode.control.children[0].active = true
          siteNode.control7.active = false
          _this.game.readyGo.restorePollPolice(_this.game.webSocket, _this.game, pageNode.node)
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    }
  },
  restorePollPolice: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control7.active = false
  },
  roomCampaign: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    // 竞选
    siteNode.campaign.active = true
    siteNode.polickOn.active = true
    siteNode.policekOut.active = false
    siteNode.policeIcon.active = false
  },
  voteDecisionCampaign: function (data) {
    this.restorePollPolice()
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node
    siteNode.policekOut.active = false
    let self = this
    if (data.seat != 0) {
      if (this.order.string == data.seat) {
        siteNode.campaign.active = true
        siteNode.polickOn.active = false
        siteNode.policekOut.active = false
        siteNode.policeIcon.active = true
        siteNode.campaign.children[0].getComponent('cc.Animation').play('police_success')
        let animState = this.game.policeIcon.getComponent('cc.Animation')
        animState.play('police_' + data.seat)
        animState.on('finished', function () {
          siteNode.campaign.children[3].active = true
          siteNode.campaign.children[0].active = false
          self.game.policeIcon.active = false
        })
      } else {
        siteNode.campaign.active = false
        siteNode.polickOn.active = false
        siteNode.policekOut.active = false
        siteNode.policeIcon.active = false
      }
    } else {
      if (siteNode.policeIcon.active) {
        siteNode.campaign.active = true
        siteNode.polickOn.active = false
        siteNode.policekOut.active = false
        siteNode.policeIcon.active = true
      } else {
        siteNode.campaign.active = false
        siteNode.polickOn.active = false
        siteNode.policekOut.active = false
        siteNode.policeIcon.active = false
      }
    }
  },
  roomPollMovePolice: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    this.game.gameControl.children[6].active = false
    if (data.isPoll) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control9.active = true
    }
    let tear = this.game.gameControl.children[2],
      label = tear.children[0].children[0].getComponent(cc.Label)
    tear.active = true
    label.string = '撕掉(10S)'
    let time = 10
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      label.string = '撕掉(' + time + ')'
      if (time <= 0) {
        tear.active = false
        siteNode.control.active = false
        siteNode.control.children[0].active = true
        siteNode.control9.active = false
        _this.game.readyGo.restorePollMovePolice(_this.game.webSocket, _this.game, pageNode.node)
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
  },
  restorePollMovePolice: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control9.active = false
  },
  votePoliceBadge: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    if (data.poll == this.order.string) {
      siteNode.campaign.active = true
      siteNode.polickOn.active = false
      siteNode.policekOut.active = false
      siteNode.policeIcon.active = true
    }
    if (data.seat == this.order.string) {
      siteNode.campaign.active = false
      siteNode.polickOn.active = false
      siteNode.policekOut.active = false
      siteNode.policeIcon.active = false
    }
  },
  voteNotPoliceBadge: function () {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control9.active = false
    siteNode.campaign.active = false
    siteNode.polickOn.active = false
    siteNode.policekOut.active = false
    siteNode.policeIcon.active = false
    this.restorePollMovePolice()
  },
  roomPollDayList: function (data) {
    this.speakSpeakSkipTurn(data)
    let siteNode = pageNode.siteNode[this.order.string],
      _this = this
    if (data.isPoll) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control11.active = true
    }
    let lab1 = this.game.dialogNode.children[15].children[0].getComponent(cc.Label)
    let lab2 = this.game.dialogNode.children[15].children[1].getComponent(cc.Label)
    lab1.string = 15
    lab2.string = '15秒后公布投票结果'
    let time1 = 15
    lab1.unscheduleAllCallbacks()
    lab1.callback = function () {
      time1--
      lab1.string = time1
      lab2.string = time1 + '秒后公布投票结果'
      if (time1 <= 0) {
        _this.game.dialogNode.children[15].active = false
        lab1.unschedule(lab1.callback)
      }
    }
    lab1.schedule(lab1.callback, 1)
    if (data.seat == USER_SEAT && data.canPoll) {
      this.game.dialogNode.children[15].active = true

      let control = this.game.gameControl.children[2],
        label = control.children[0].children[0].getComponent(cc.Label)
      control.active = true
      label.string = '放弃(15S)'
      let time = 15
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        label.string = '放弃(' + time + ')'
        if (time <= 0) {
          control.active = false
          siteNode.control.active = false
          siteNode.control.children[0].active = true
          siteNode.control11.active = false
          _this.game.readyGo.restorePollDayList(_this.game.webSocket, _this.game, pageNode.node)
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    }
  },
  voteOverPoll: function (data) {
    // 白天投票结果反馈
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = true
    siteNode.control.children[0].active = true
    siteNode.control8.active = true
    // this.playMusic(0, this.game, 1);
    if (GAME_NATIVE && GAME_SOUND) {
      callNativeMethod({
        methodNameAndroid: 'appPlayVoice',
        methodNameIOS: 'appPlayVoice:',
        methodSignature: '(Ljava/lang/String;)V',
        parameters: ['death']
      })
    }
    this.game.dialogNode.children[15].active = false
    // if (data.seat != 0) {
    //     if (this.order.string == USER_SEAT) {
    //         let text = this.game.gameControl.children[6].children[0].getComponent('cc.Label');
    //         this.game.gameControl.children[6].active = true;
    //         text.string = '您被投票处决';
    //     }
    // }
    this.restorePollDay()
    this.roomHideVoteResult(siteNode, this.order.string)
  },
  restorePollDayList: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control11.active = false
  },
  restorePollDay: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node
    siteNode.control.active = false
    siteNode.control.children[0].active = true
    siteNode.control11.active = false
    this.game.dialogNode.children[15].active = false
    this.game.gameControl.children[2].active = false
  },
  roomUserTalk: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    if (data.seat > 0 && data.seat < 7) {
      if (!GAME_START) {
        siteNode.userTalkLeft.children[0].active = true
        siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').play('speak')
      } else {
        siteNode.userTalkLeft.children[1].active = true
        siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').play('speak_start')
      }
    } else {
      if (!GAME_START) {
        siteNode.userTalkRight.children[0].active = true
        siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').play('speak')
      } else {
        siteNode.userTalkRight.children[1].active = true
        siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').play('speak_start')
      }
    }
    // siteNode.userTalk.off('touchstart', this.userClickSite, this);
    // siteNode.userTalk.on('touchstart', this.userClickSite, this);
  },
  roomUserDelTalk: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    if (data.seat > 0 && data.seat < 7) {
      if (!GAME_START) {
        siteNode.userTalkLeft.children[0].active = false
        siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').stop('speak')
      } else {
        siteNode.userTalkLeft.children[1].active = false
        siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
      }
    } else {
      if (!GAME_START) {
        siteNode.userTalkRight.children[0].active = false
        siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').stop('speak')
      } else {
        siteNode.userTalkRight.children[1].active = false
        siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
      }
    }
  },
  gameOut: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    let deathInfo = this.game.dialogNode.children[14]
    siteNode.userTalkLeft.active = true
    siteNode.userTalkRight.active = true
    this.game.dialogNode.active = true
    siteNode.ready.active = true
    if (data.isMain == 1) {
      siteNode.isMain.active = true
    } else {
      siteNode.readied.active = false
    }
    this.game.gameControl.children[3].children[data.role - 1].active = false
    if (data.isdie > 0) {
      siteNode.control10.active = false
      siteNode.control8.active = false
      siteNode.control.active = false
      siteNode.boomIcon.active = false
      deathInfo.children[2].children[1].children[0].active = false
      deathInfo.children[2].children[1].children[1].active = false
      deathInfo.children[2].children[1].children[2].active = false
    }
    if (this.order.string == USER_SEAT) {
      node.inviteFriend.active = true
      console.log(data.isMain)
      if (data.isMain == 1) {
        node.startGame.active = true
      } else {
        node.readyGame.active = true
      }
    }
    siteNode.guess.children[0].color = cc.hexToColor('#FFFFFF')
    siteNode.guess.children[0].children[0].getComponent(cc.Label).string = '?'
    siteNode.guess.active = false
    siteNode.guess.parent.active = false
    siteNode.userRole.active = true
    siteNode.ruleOrder.active = true
    siteNode.ruleOrder.children[7].active = false
    siteNode.userRole.children[7].active = false
    siteNode.ruleOrder.children[data.role - 1].active = true
    siteNode.userRole.children[data.role - 1].active = true
    siteNode.policeIcon.active = false
    node.gameTime.getComponent(cc.Label).string = '第一天白天'
    node.gameCountTime.parent.active = false

    // siteNode.empty.children[0].active = false;
    // siteNode.empty.children[1].active = false;
    // siteNode.empty.children[2].active = false;
    this.game.dialogNode.children[10].active = false
    this.game.dialogNode.children[15].active = false
    this.game.dialogNode.children[0].active = true
    node.wolfBoom.active = false
    this.game.gameControl.children[6].active = false
    this.roomHideGuess(siteNode, this.order.string)
    this.roomHideVoteResult(siteNode, this.order.string)
    siteNode.control.active = false
    siteNode.leaveIcon.active = false
    siteNode.control.children[0].children.forEach(function (v, i) {
      if (v.active) {
        siteNode.control.children[0].children[i].active = false
      }
    })
    if (USER_ONTREE) {
      for (let i = 1; i < 13; i++) {
        pageNode.siteNode[i].empty.children[0].active = false
        pageNode.siteNode[i].empty.children[1].active = true
        pageNode.siteNode[i].empty.children[2].active = false
      }
      node.voice.active = false
      node.readyGame.active = false
      node.startGame.active = false
    } else {
      for (let i = 1; i < 13; i++) {
        pageNode.siteNode[i].empty.children[0].active = true
        pageNode.siteNode[i].empty.children[1].active = false
        pageNode.siteNode[i].empty.children[2].active = false
      }
    }
    siteNode.wolfVote.active = false
    for (var i = 0; i < siteNode.wolfVote.children.length; i++) {
      siteNode.wolfVote.children[i].active = false
    }
    node.startSpeak.children[0].active = false
    node.startSpeak.children[1].active = false
    node.startSpeak.children[2].active = false
    node.roleCard.children[8].active = false
    this.game.quizResult.active = false
    this.game.input.active = true
  },
  roomReEnter: function (data) {
    let siteNode = pageNode.siteNode[this.order.string]
    let node = pageNode.node,
      _this = this
    // 从游戏界面外重新连接进来
    this.uid = data.uid
    console.log(data)
    // this.game.observe.children[0].children[0].getComponent(cc.Label).string = this.game.webSocket.treeList.length + '人';
    cc.audioEngine.pauseAllEffects()

    if (data.isMain && data.uid == GAME_UID) {
      GAME_ROOMMAIN = true
    }
    siteNode.ready.active = false
    siteNode.readied.active = false
    siteNode.isMain.active = false
    if (siteNode.empty.active) {
      if (data.uid == GAME_UID) {
        // this.order.node.parent.color = cc.hexToColor('#5aa23a');
        // siteNode.siteBac.color = cc.hexToColor('#5aa23a');
        siteNode.siteBac.children[0].children[1].children[2].active = true
        siteNode.siteBac.children[0].children[1].children[1].active = false
        siteNode.siteBac.children[2].children[0].active = true
        USER_SEAT = this.order.string
        node.cancle.active = false
        node.startGame.active = false
        node.readyGame.active = false
        node.inviteFriend.active = false
        node.voice.active = false
        node.startSpeak.children[0].active = false
        node.startSpeak.children[1].active = false
        node.startSpeak.children[2].active = false
        siteNode.ready.active = false
        siteNode.readied.active = false
        siteNode.isMain.active = false
        // 角色信息
        this.game.gameControl.active = true
        this.game.gameControl.children[3].active = true
        let card = this.game.gameControl.children[3]
        card.children[data.roleID - 1].active = true
        card.children[7].children[0].getComponent(cc.Label).string = '位置：' + this.order.string
        card.active = true
        siteNode.guess.active = false
        siteNode.guess.parent.active = false
        USER_ROLE = data.roleID
        siteNode.userRole.active = true
        siteNode.userRole.children[data.roleID - 1].active = true
        siteNode.ruleOrder.children[data.roleID - 1].active = true
      } else {
        if (data.roleID != 0) {
          siteNode.userRole.active = true
          siteNode.userRole.children[data.roleID - 1].active = true
          siteNode.ruleOrder.children[data.roleID - 1].active = true
          siteNode.guess.active = false
          siteNode.guess.parent.active = false
        } else {
          siteNode.guess.active = true
          siteNode.guess.parent.active = true
        }
      }
    }
    // 昵称头像
    // siteNode.avatar.parent.active = true;
    if (data.nickname.length > 4) {
      data.nickname = data.nickname.substring(0, 4) + '...'
    }
    siteNode.nickname.getComponent(cc.Label).string = data.nickname
    siteNode.empty.active = false
    siteNode.avatar.parent.active = true
    if (data.avatar) {
      // cc.loader.load({
      //     url: data.avatar,
      //     type: 'jpg'
      // }, function(err, texture) {
      //     let sp = new cc.SpriteFrame(texture),
      //         sprite = siteNode.avatar.getComponent(cc.Sprite),
      //         w = sprite.node.width,
      //         h = sprite.node.height;
      //     sprite.spriteFrame = sp;
      //     sprite.node.width = w;
      //     sprite.node.height = h;
      // });
      util.loadImage(data.avatar, siteNode.avatar, function () {
        _this.sp = sp
      })
    }
    siteNode.avatar.off('touchstart', this.userClickSite, this)
    siteNode.avatar.on('touchstart', this.userClickSite, this)

    if (data.isPolice) {
      siteNode.campaign.active = true
      siteNode.polickOn.active = false
      siteNode.policekOut.active = false
      siteNode.policeIcon.active = true
    }
    if (data.isdie != 0) {
      siteNode.control.active = true
      if (data.isdie == 1) {
        if (data.roleID == 7) {
          siteNode.guess.active = false
          siteNode.guess.parent.active = false
          siteNode.userRole.active = true
          siteNode.userRole.children[6].active = true
          siteNode.ruleOrder.children[6].active = true
        }
        siteNode.control.children[0].active = true
        siteNode.control8.active = true
      } else if (data.isdie == 2) {
        siteNode.control.children[0].active = true
        siteNode.control10.active = true
      } else if (data.isdie == 6 && data.roleID == 6) {
        siteNode.guess.active = false
        siteNode.guess.parent.active = false
        siteNode.userRole.active = true
        siteNode.userRole.children[5].active = true
        siteNode.ruleOrder.children[5].active = true
      } else if (data.isdie == 10) {
        siteNode.control.children[0].active = true
        siteNode.boomIcon.active = true
      }
      if (this.order.string == USER_SEAT) {
        node.wolfBoom.active = false
        let deathInfo = this.game.dialogNode.children[14]
        let text = this.game.gameControl.children[6].children[0].getComponent('cc.Label')
        let death = deathInfo.children[1].children[0].getComponent('cc.Label')
        if (data.isdie == 1) {
          this.game.gameControl.children[6].active = true
          text.string = '您在夜里倒牌'
          death.string = '您在夜里倒牌'
        } else if (data.isdie == 2) {
          this.game.gameControl.children[6].active = true
          text.string = '您被猎人射杀'
          death.string = '您被猎人射杀'
        } else if (data.isdie == 10) {
          this.game.gameControl.children[6].active = true
          text.string = '您已自爆死亡'
          death.string = '您已自爆死亡'
        } else if (data.isdie == 4) {
          this.game.gameControl.children[6].active = true
          text.string = '您被投票处决'
          death.string = '您被投票处决'
        }
        GAME_USERDIE = true
      }
    }

    for (let i = 1; i < 13; i++) {
      pageNode.siteNode[i].empty.children[0].active = false
      pageNode.siteNode[i].empty.children[1].active = false
      pageNode.siteNode[i].empty.children[2].active = true
    }
    if (data.isLeave) {
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.leaveIcon.active = false
    }

    // siteNode.empty.children[0].active = false;
    // siteNode.empty.children[1].active = false;
    // siteNode.empty.children[2].active = false;
  },
  voteOtherDieInfo: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    siteNode.userRole.children[data.role - 1].active = true
    siteNode.ruleOrder.children[data.role - 1].active = true
    siteNode.userRole.active = true
    siteNode.guess.active = false
    siteNode.guess.parent.active = false
    if (data.role == 7) {
      // this.playMusic(0, this.game, 1);
      if (GAME_NATIVE && GAME_SOUND) {
        callNativeMethod({
          methodNameAndroid: 'appPlayVoice',
          methodNameIOS: 'appPlayVoice:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['death']
        })
      }
      siteNode.control.active = true
      siteNode.control.children[0].active = true
      siteNode.control8.active = true
    }
  },
  // playMusic: function(num, game, time) {
  //     cc.audioEngine.play(game.audio[num], false, time);
  // },
  roomStandUp: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    if (data) {
      this.roomUserQuit(data)
    }
    siteNode.wifi.active = false
    let voice = node.voice.getComponent('cc.Animation')
    voice.stop('sound_in')
    voice.play('sound_out')
    if (siteNode.userTalkLeft.children[0].active || siteNode.userTalkRight.children[0].active) {
      siteNode.userTalkLeft.children[0].active = false
      siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      siteNode.userTalkRight.children[0].active = false
      siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').stop('speak_start')
      let socket = this.game.webSocket.socket
      // socket.emit('room.userTalk', {
      //   type: 0
      // })
      if (GAME_INAPP) {
        COMMONOBJ.appUserStopSpeak()
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appUserStopSpeak',
          methodNameIOS: 'appUserStopSpeak',
          methodSignature: '()V',
          parameters: []
        })
      }
    }
    if (data.uid == GAME_UID) {
      node.standUp.active = false
      node.standUp.parent.children[0].active = true
      node.voice.active = false
      if (data.avatar) {
        // cc.loader.load({
        //     url: data.avatar,
        //     type: 'jpg'
        // }, function(err, texture) {
        //     let sp = new cc.SpriteFrame(texture),
        //         sprite = node.standUp.parent.children[0].children[0].children[0].getComponent(cc.Sprite),
        //         w = sprite.node.width,
        //         h = sprite.node.height;
        //     sprite.spriteFrame = sp;
        //     sprite.node.width = w;
        //     sprite.node.height = h;
        // });
        util.loadImage(data.avatar, node.standUp.parent.children[0].children[0].children[0], null)
      }
      node.startGame.active = false
      node.readyGame.active = false
      node.cancle.active = false
      siteNode.siteBac.children[2].active = false
      for (let i = 1; i < 13; i++) {
        pageNode.siteNode[i].empty.children[0].active = false
        pageNode.siteNode[i].empty.children[1].active = true
      }
      // siteNode.empty.children[0].active = false;
      // siteNode.empty.children[1].active = false;
      // siteNode.empty.children[2].active = false;
      this.hideUserOrder(siteNode)
    } else {
      this.addTreeList(data)
    }
  },
  roomSitdown: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    if (data) {
      this.userSite(data)
    }
    siteNode.wifi.active = true
    let voice = node.voice.getComponent('cc.Animation')
    voice.stop('sound_in')
    voice.play('sound_out')
    siteNode.userTalkLeft.active = true
    siteNode.userTalkRight.active = true
    // siteNode.isMain.active = false;
    if (data.uid == GAME_UID) {
      node.standUp.active = true
      node.standUp.parent.children[0].active = false
      if (this.game.readyGo.quizActive) {
        this.game.readyGo.quizActive = false
        this.game.quiz.getComponent('cc.Animation').play('quiz_c')
        this.game.input.getComponent('cc.Animation').play('input_on')
      }
      node.voice.active = true
      node.startGame.active = true
      node.cancle.active = true
      node.inviteFriend.active = true
      for (let i = 1; i < 13; i++) {
        pageNode.siteNode[i].empty.children[0].active = true
        pageNode.siteNode[i].empty.children[1].active = false
      }
      // siteNode.empty.children[0].active = false;
      // siteNode.empty.children[1].active = false;
      // siteNode.empty.children[2].active = false;
    } else {
      this.removeTreeList(data)
    }
  },
  sitDown: function (data) {
    let _this = this
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    siteNode.sitDown.on('touchstart', function (event) {
      http.post({
        url: HTTPURL + '/wolf100/watch/sitdown',
        data: {
          roomId: GAME_ROOMID,
          seat: data.seat
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          data = JSON.parse(data)
          console.log(data)
          if (data.code == 200) {

          } else {
            _this.game.creatPopUp(data.msg)
          }
        }
      })
    })
  },
  addTreeList: function (data) {
    let ava = cc.instantiate(this.game.avatar)
    if (data.avatar) {
      // cc.loader.load({
      //     url: data.avatar,
      //     type: 'jpg'
      // }, function(err, texture) {
      //     let sp = new cc.SpriteFrame(texture),
      //         sprite = ava.children[0].children[0].getComponent(cc.Sprite),
      //         w = sprite.node.width,
      //         h = sprite.node.height;
      //     sprite.spriteFrame = sp;
      //     sprite.node.width = w;
      //     sprite.node.height = h;
      // });
      util.loadImage(data.avatar, ava.children[0].children[0], null)
    }
    ava.uid = data.uid
    this.game.observe.children[1].children[0].children[0].children[0].addChild(ava)
  },
  removeTreeList: function (data) {
    let treeList = this.game.observe.children[1].children[0].children[0].children[0]
    for (var i = 1; i < treeList.children.length; i++) {
      if (treeList.children[i].uid == data.uid) {
        treeList.removeChild(treeList.children[i])
        break
      }
    }
  },
  roomPollWoflBoom: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    node.wolfBoom.active = true
  },
  roomPollWoflEnd: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    node.wolfBoom.active = false
    this.game.dialogNode.children[11].active = false
  },
  voteWoflBoom: function (data) {
    this.restorePollPolice()
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    let deathInfo = this.game.dialogNode.children[14]
    siteNode.control.active = true
    siteNode.control.children[0].active = true
    siteNode.boomIcon.active = true
    node.wolfBoom.active = false
    siteNode.userRole.active = true
    siteNode.userRole.children[0].active = true
    siteNode.ruleOrder.children[0].active = true
    siteNode.guess.active = false
    siteNode.guess.parent.active = false
    node.giveUp.active = false
    if (this.order.string == USER_SEAT) {
      let text = this.game.gameControl.children[6].children[0].getComponent('cc.Label')
      this.game.gameControl.children[6].active = true
      text.string = '您已自爆死亡'
    }
    if (data.isPolice) {
      siteNode.policeIcon.active = false
    }
    this.game.dialogNode.children[10].active = false
    if (!node.userInfoDialog.active) {
      this.game.dialogNode.children[0].active = false
    }
    for (var i = 1; i < 13; i++) {
      if (pageNode.siteNode[i].polickOn.active || pageNode.siteNode[i].policekOut.active) {
        pageNode.siteNode[i].polickOn.active = false
        pageNode.siteNode[i].policekOut.active = false
      }
    }
    this.roomHideVoteResult(siteNode, this.order.string)
  },
  roomCloseInfo: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    siteNode.control.active = true
    siteNode.control.children[0].active = true
    siteNode.leaveIcon.active = true
  },
  roomPollResult: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      _this = this
    if (data.poll != 0) {
      if (data.seat > 0 && data.seat < 7) {
        siteNode.userPollLeft.children[0].active = true
        siteNode.userPollLeft.children[0].children[0].getComponent('cc.Label').string = data.poll
      } else {
        siteNode.userPollRight.children[0].active = true
        siteNode.userPollRight.children[0].children[0].getComponent('cc.Label').string = data.poll
      }
    } else {
      if (data.seat > 0 && data.seat < 7) {
        siteNode.userPollLeft.children[1].active = true
      } else {
        siteNode.userPollRight.children[1].active = true
      }
    }
    setTimeout(function () {
      _this.roomHideVoteResult(siteNode, _this.order.string)
    }, 5000)
    let socket = this.game.webSocket
    this.restorePollDay()
  },
  roomReEnterInfo: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    // if (siteNode.control8.active || siteNode.boomIcon.active || siteNode.control10) {
    //     siteNode.control.children[0].active = true;
    //     siteNode.control.active = true;
    //     siteNode.leaveIcon.active = false;
    // } else {
    //     siteNode.control.children[0].active = false;
    //     siteNode.control.active = false;
    //     siteNode.leaveIcon.active = false;
    // }
    // console.log(this.order.string, USER_SEAT)
    if (this.order.string == USER_SEAT) {
      node.startGame.active = false
      node.readyGame.active = false
      node.cancle.active = false
      node.inviteFriend.active = false
    }
    siteNode.leaveIcon.active = false
    let controlNode = siteNode.control.children[0],
      index
    for (index = 1; index < controlNode.children.length; index++) {
      if (controlNode.children[index].active) {
        siteNode.control.children[0].active = true
        siteNode.control.active = true
        siteNode.leaveIcon.active = false
        break
      }
    }
    if (index == controlNode.children.length) {
      siteNode.control.children[0].active = false
      siteNode.control.active = false
      console.log(USER_ROLE)
      if (USER_ROLE == 1 && !GAME_USERDIE && GAME_ISNIGHT) {
        siteNode.control.children[0].active = true
        siteNode.control.active = true
      }
    }
  },
  hideUserOrder: function (siteNode) {
    siteNode.siteBac.children[10].children[0].children[0].children.forEach(function (v, i) {
      if (v.active) {
        siteNode.siteBac.children[10].children[0].children[0].children[i].active = false
      }
    })
  },
  roomGiveupCampaign: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    siteNode.campaign.active = true
    siteNode.polickOn.active = false
    siteNode.policekOut.active = true
    siteNode.policeIcon.active = false
  },
  roomHideVoteResult: function (siteNode, seat) {
    if (seat > 0 && seat < 7) {
      siteNode.userPollLeft.children[0].active = false
      siteNode.userPollLeft.children[1].active = false
    } else {
      siteNode.userPollRight.children[0].active = false
      siteNode.userPollRight.children[1].active = false
    }
  },
  roomHideGuess: function (siteNode, seat) {
    if (seat > 0 && seat < 7) {
      siteNode.guessLeft.active = false
    } else {
      siteNode.guessRight.active = false
    }
  },
  hideUserTalk: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    let voice = node.voice.getComponent('cc.Animation')
    voice.stop('sound_in')
    voice.play('sound_out')
    siteNode.userTalkLeft.children[1].active = false
    siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
    siteNode.userTalkRight.children[1].active = false
    siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
    this.game.selfSpeak.active = false
    this.game.selfSpeak.children[0].getComponent('cc.Animation').stop('self_speak')
    let socket = this.game.webSocket.socket
    // socket.emit('room.userTalk', {
    //   type: 0
    // })
    if (GAME_INAPP) {
      COMMONOBJ.appUserStopSpeak()
    }
    if (GAME_NATIVE) {
      callNativeMethod({
        methodNameAndroid: 'appUserStopSpeak',
        methodNameIOS: 'appUserStopSpeak',
        methodSignature: '()V',
        parameters: []
      })
    }
  },
  roomOntree: function () {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    for (let i = 1; i < 13; i++) {
      pageNode.siteNode[i].empty.children[0].active = false
      pageNode.siteNode[i].empty.children[1].active = true
    }
    node.inviteFriend.active = true
  },
  refreshView: function () {
    // 刷线视图
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node,
      _this = this
    this.sp = null
    siteNode.userRole.children.forEach(function (v, i) {
      if (siteNode.userRole.children[i].active) {
        siteNode.userRole.children[i].active = false
      }
    })
    siteNode.ruleOrder.children.forEach(function (v, i) {
      if (siteNode.userRole.children[i].active) {
        siteNode.userRole.children[i].active = false
      }
    })
    this.game.dialogNode.children[0].active = false
    this.game.dialogNode.children[9].active = false
    this.game.dialogNode.children[9].children.forEach(function (v, i) {
      _this.game.dialogNode.children[9].children[i].active = false
    })
  },
  roomDumpSkipSuccess: function (data) {

  },
  voteUserWintimes: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
  },
  voteHandleMvp: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    let _this = this
    if (data.data.seat != 0) {
      node.mvp.active = true
      this.game.dialogNode.children[0].active = true
    }
    if (USER_SEAT == data.data.seat) {
      node.mvp.children[1].getComponent('cc.Label').string = '恭喜您成为本场MVP'
    } else {
      node.mvp.children[1].getComponent('cc.Label').string = '恭喜' + data.data.seat + '号玩家成为本场MVP'
    }
    if (data.data.avatar) {
      util.loadImage(data.data.avatar, node.mvp.children[0], null)
    }
    let time = 5,
      label = node.mvp.children[2].children[0].getComponent(cc.Label)
    label.string = '确定(5s)'
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      label.string = '确定(' + time + ')'
      if (time <= 0) {
        node.mvp.active = false
        _this.game.dialogNode.children[0].active = false
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
    // let mvpNode = cc.instantiate(this.game.mvpResult)
    let mvpMsg
    if (parseInt(data.data.seat) === 0) {
      mvpMsg = data.msg
      // mvpNode.children[0].getComponent('cc.Label').string = data.msg
    } else {
      mvpMsg = '恭喜' + data.data.seat + '号玩家成为本场MVP'
      // mvpNode.children[0].getComponent('cc.Label').string = '恭喜' + data.data.seat + '号玩家成为本场MVP'
    }
    let mvpObj = {
      'fnName': 'game_addChatMessage',
      'uid': '0',
      'msg': mvpMsg,
      'uidArr': ['-1', '-2'],
      'type': '99',
      'avatar': 'https://appfile.xys.ren/upload/icon/long20170311.png@0o_1l_40w_40h_90q.jpg',
      'nickName': '上帝'
    }
    jsCommonFn(JSON.stringify(mvpObj))
    // game.chatContent.addChild(mvpNode)
  },
  roomProtect: function (data) {
    let _this = this
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    node.protect.active = true
    this.game.dialogNode.children[0].active = true
    if (data.avatar) {
      util.loadImage(data.avatar, node.protect.children[1], null)
    }
    node.protect.children[2].getComponent('cc.Label').string = data.seat + '号玩家'
    let time = 5,
      label = node.protect.children[0].children[0].getComponent(cc.Label)
    label.string = '确定(5s)'
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      label.string = '确定(' + time + ')'
      if (time <= 0) {
        node.protect.active = false
        _this.game.dialogNode.children[0].active = false
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
  },
  pingValue: function (data) {
    let siteNode = pageNode.siteNode[this.order.string],
      node = pageNode.node
    let _this = this
    let playWifi = node.userInfoDialog.children[0].children[3].children[0]
    if (_this.game.kickUserSeat == data.seat) {
      playWifi.children[0].active = false
      playWifi.children[1].active = false
      playWifi.children[2].active = false
    }
    siteNode.wifi.children[1].children[0].active = false
    siteNode.wifi.children[1].children[1].active = false
    siteNode.wifi.children[1].children[2].active = false
    siteNode.wifi.active = true
    if (data.ping > 0 && data.ping <= 60) {
      if (_this.game.kickUserSeat == data.seat) {
        node.userInfoDialog.children[0].children[3].children[1].getComponent('cc.Label').string = data.ping + 'ms'
        playWifi.children[2].active = true
      }
      siteNode.wifi.children[1].children[2].active = true
    } else if (data.ping > 60 && data.ping <= 150) {
      if (_this.game.kickUserSeat == data.seat) {
        node.userInfoDialog.children[0].children[3].children[1].getComponent('cc.Label').string = data.ping + 'ms'
        playWifi.children[1].active = true
      }
      siteNode.wifi.children[1].children[1].active = true
    } else if (data.ping > 150) {
      if (_this.game.kickUserSeat == data.seat) {
        node.userInfoDialog.children[0].children[3].children[1].getComponent('cc.Label').string = data.ping + 'ms'
        playWifi.children[0].active = true
      }
      siteNode.wifi.children[1].children[0].active = true
    }
  },
  gameReplay: function () {

  },
  // called every frame, uncomment this function to activate update callback
  update: function (dt) {
    let _this = this
    // 死亡标志、离开标志、猎人射杀标志检测
    if (GAME_START) {
      if (pageNode.siteNode[this.order.string]) {
        let siteNode = pageNode.siteNode[this.order.string],
          node = pageNode.node
        if (siteNode.leaveIcon.active) {
          siteNode.control.active = true
          siteNode.control.children[0].active = true
        }
        if (siteNode.boomIcon.active) {
          siteNode.control.active = true
          siteNode.control.children[0].active = true
          siteNode.leaveIcon.active = false
        }
        if (siteNode.control10.active || siteNode.control8.active) {
          siteNode.control.active = true
          siteNode.control.children[0].active = true
          siteNode.leaveIcon.active = false
        }
        if (GAME_USERDIE) {
          _this.game.input.active = true
        }
        if (node.voice.active) {
          node.voice.active = false
          node.startSpeak.children[0].active = true
        }
        if (_this.game.dialogNode.children[21].active || _this.game.dialogNode.children[22].active || node.userInfoDialog.active) {
          _this.game.dialogNode.children[0].active = true
        }
      }
    } else {
      if (pageNode.siteNode[this.order.string]) {
        let siteNode = pageNode.siteNode[this.order.string],
          node = pageNode.node
        if (node.startSpeak.children[0].active) {
          node.startSpeak.children[0].active = false
          node.voice.active = true
        }
      }
    }
  }
})
