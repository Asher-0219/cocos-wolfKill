const http = require('../util/http')
const util = require('../util/util')
// const msgCtrl = require('../module/msgCtrl')
const ready = {
  uid: null,
  roomId: null, // 网页输入房间号
  view: false,
  message: '', // 发送消息
  require: false, // 观摩席动画是否点击
  speakRequire: false, // 重复发言
  wolfBtnClick: false, // 狼人杀人确定按钮点击
  shortRoomId: null, // 短房间号
  timeInterval: 0, // 上次上麦时间
  userSeat: 0, // 发言时用户座位
  quizActive: false,
  startX: null,
  password: false,
  sendMsgInterval: 0,
  udNum: 0, // 我的U豆数
  whoWin: null, // 押谁赢
  quizUd: 0, // 押注数量
  scrollH: 0, // 移动高度
  init (game, webSocket, pageNode) {
    let _this = this
    let node = pageNode.node
    let socket = webSocket.socket
    GAME_MODULE.readyGo = this

    game.gameReady[1].on('text-changed', function (event) {
      _this.uid = event.detail.string
    })

    game.gameReady[2].on('touchstart', function (event) {
      // 登录
      console.log(GAME_ACCOUNT[_this.uid].account)
      GAME_UID = GAME_ACCOUNT[_this.uid].account
      GAME_SIGN = GAME_ACCOUNT[_this.uid].sign
      GAME_INPUT = GAME_ACCOUNT[_this.uid].input
      socket.setSocketSign(GAME_ACCOUNT[_this.uid].sign)
      LONGLEAVE = 1
      LONGLEAVEWEB = true
      socket.emit('login', {
        uid: GAME_ACCOUNT[_this.uid].account
      })
    })

    game.gameReady[3].on('touchstart', function (event) {
      // 创建房间，如果存在重连进入重连
      // socket.emit('room.create', {
      //     type: 1
      // })
      // game.gameReady[0].active = false;
      http.post({
        url: HTTPURL + '/wolf100/enter/renter',
        data: {},
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          data = JSON.parse(data)
          if (data.code === 200) {
            GAME_ROOMID = data.data.roomId
            game.gameReady[0].active = false
            socket.emit('room.enter', {
              roomId: GAME_ROOMID,
              roomType: 1,
              longLeave: LONGLEAVE
            })
            _this.getShortRoomId(pageNode, game)
          } else {
            http.post({
              url: HTTPURL + '/wolf100/room/create',
              data: {
                type: 1
              },
              header: {
                sign: GAME_INPUT
              },
              success: function (data) {
                data = JSON.parse(data)
                if (data.code === 200) {
                  if (data.data.roomId) {
                    GAME_ROOMID = data.data.roomId
                    GAME_ROOMMAIN = true
                    let label = node.roomId.getComponent(cc.Label)
                    label.string = data.data.roomId + '房间'
                    _this.enterRoom(socket, game)
                  }
                  if (data.data.punish) {
                    // 裁决之刃惩罚时间
                  }
                }
              }
            })
          }
        }
      })
    })

    game.gameReady[4].on('text-changed', function (event) {
      _this.roomId = event.detail.string
    })

    game.gameReady[5].on('touchstart', function (event) {
      // 搜索房间
      game.gameReady[0].active = false
      GAME_ROOMID = _this.roomId
      let label = node.roomId.getComponent(cc.Label)
      label.string = _this.roomId + '房间'
      _this.enterRoom(socket, game)
    })

    pageNode.node.exitGame.on('touchstart', function (event) {
      // 退出游戏
      // game.gameReady[0].active = true;
      let ws = socket.getWs()
      if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
        if (ws.readyState && ws.readyState !== 1) {
          util.quitGame(null)
        } else {
          socket.emit('room.quit', {})
        }
      } else {
        util.quitGame(null)
      }
    })

    game.gameTop.children[0].children[0].on('touchstart', function () {
      // 缩小
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appGameShrink',
          methodNameIOS: 'appGameShrink',
          methodSignature: '()V',
          parameters: []
        })
      }
    })

    node.readyGame.on('touchstart', function (event) {
      // 准备游戏
      socket.emit('room.ready', {
        type: 1
      })
    })

    node.cancle.on('touchstart', function (event) {
      // 取消准备
      socket.emit('room.ready', {
        type: 0
      })
    })

    node.startGame.on('touchstart', function (event) {
      // 开始游戏
      let voice = node.voice.getComponent('cc.Animation').getAnimationState('sound_in')
      if (voice.isPlaying) {
        _this.voiceTouchEnd(node, pageNode, socket)
      }

      socket.emit('room.start', {
        type: 1
      })
    })

    node.panicBuy.children[1].children.forEach(function (v, i) {
      // ud购买角色
      v.children[1].on('touchstart', function () {
        socket.emit('shop.buyRole', {
          roleId: i + 1,
          type: 2
        })
      })

      v.children[2].on('touchstart', function () {
        socket.emit('shop.buyRole', {
          roleId: i + 1,
          type: 1
        })
      })
    })

    node.roleConfirmTime.on('touchstart', function (event) {
      // 确认角色
      node.roleConfirm.active = false
      game.dialogNode.children[0].active = false
    })

    node.policeLeft.on('touchstart', function (event) {
      // 警左发言
      socket.emit('vote.poll', {
        type: 23
      })
      game.dialogNode.children[0].active = false
      node.policeOrder.active = false
    })

    node.policeRight.on('touchstart', function (event) {
      // 警右发言
      socket.emit('vote.poll', {
        type: 22
      })
      game.dialogNode.children[0].active = false
      node.policeOrder.active = false
    })

    node.policeCampaign.on('touchstart', function (event) {
      // 竞选警长
      socket.emit('room.campaign', {
        type: 1
      })
      let siteNode = pageNode.siteNode[USER_SEAT]
      siteNode.campaign.active = true
      siteNode.polickOn.active = true
      node.giveUp.parent.active = true
      node.giveUp.active = true
      node.PoliceCampaignBox.active = false
      // _this.playMusic(webSocket, game, 2, 1);
      if (GAME_NATIVE && GAME_SOUND) {
        callNativeMethod({
          methodNameAndroid: 'appPlayVoice',
          methodNameIOS: 'appPlayVoice:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['police']
        })
      }
      game.dialogNode.children[0].active = false
    })

    node.giveUp.on('touchstart', function (event) {
      // 上警之后弃选
      socket.emit('room.campaign', {
        type: 2
      })
      let siteNode = pageNode.siteNode[USER_SEAT]
      siteNode.campaign.active = true
      siteNode.policekOut.active = true
      node.giveUp.active = false
      // if(!node.dumpSkip.active){
      //     node.giveUp.parent.active = false;
      // }
    })

    node.canclePoliceCampaign.on('touchstart', function (event) {
      // 取消警长竞选
      game.dialogNode.children[0].active = false
      game.dialogNode.children[10].active = false
    })

    node.seeRole.on('touchstart', function (event) {
      // 预言家查人成功弹窗
      let label = node.seeRole.children[0].getComponent(cc.Label)
      node.seeRole.parent.active = false
      game.dialogNode.children[0].active = false
      label.unschedule(label.callback)
    })

    node.voice.on('touchstart', function () {
      // 语音按钮点击
      _this.userSeat = USER_SEAT
      let ms = new Date().getTime()
      if (ms - _this.timeInterval < 500) {
        return
      } else {
        _this.timeInterval = ms
      }
      let ws = socket.getWs()
      if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
        if (ws.readyState && ws.readyState !== 1) {
          console.log('readyState')
          return
        }
      } else {
        return
      }
      let voice = node.voice.getComponent('cc.Animation')
      let siteNode = pageNode.siteNode[_this.userSeat]
      voice.play('sound_in')
      if (_this.userSeat > 0 && _this.userSeat < 7) {
        if (!GAME_START) {
          siteNode.userTalkLeft.children[0].active = true
          siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').play('speak')
          socket.emit('room.userTalk', {
            type: 1
          })
        } else {
          siteNode.userTalkLeft.children[1].active = true
          siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').play('speak_start')
          socket.emit('room.speak', {
            type: SPEAK_TYPE
          })
          socket.emit('room.userTalk', {
            type: 1
          })
        }
      } else {
        if (!GAME_START) {
          siteNode.userTalkRight.children[0].active = true
          siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').play('speak')
          socket.emit('room.userTalk', {
            type: 1
          })
        } else {
          siteNode.userTalkRight.children[1].active = true
          siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').play('speak_start')
          socket.emit('room.speak', {
            type: SPEAK_TYPE
          })
          socket.emit('room.userTalk', {
            type: 1
          })
        }
      }
      if (GAME_INAPP) {
        COMMONOBJ.appUserStartSpeak()
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appUserStartSpeak',
          methodNameIOS: 'appUserStartSpeak',
          methodSignature: '()V',
          parameters: []
        })
      }
    })

    node.voice.on('touchend', function () {
      // 松开停止
      let ws = socket.getWs()
      if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
        if (ws.readyState && ws.readyState !== 1) {
          let siteNode = pageNode.siteNode[USER_SEAT]
          if (siteNode.userTalkLeft.children[0].active) {
            _this.voiceTouchEnd(node, pageNode, socket)
          } else {
            return
          }
        }
      } else {
        let siteNode = pageNode.siteNode[USER_SEAT]
        if (siteNode.userTalkLeft.children[0].active) {
          _this.voiceTouchEnd(node, pageNode, socket)
        } else {
          return
        }
      }
      _this.voiceTouchEnd(node, pageNode, socket)
    })

    node.voice.on('touchcancel', function () {
      // 松开停止
      let ws = socket.getWs()
      let siteNode = pageNode.siteNode[USER_SEAT]
      if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
        if (ws.readyState && ws.readyState !== 1) {
          if (siteNode.userTalkLeft.children[0].active) {
            _this.voiceTouchEnd(node, pageNode, socket)
          } else {
            return
          }
        }
      } else {
        if (siteNode.userTalkLeft.children[0].active) {
          _this.voiceTouchEnd(node, pageNode, socket)
        } else {
          return
        }
      }
      _this.voiceTouchEnd(node, pageNode, socket)
    })

    node.roleControlConfirm.on('touchstart', function (event) {
      // 角色操作：确定、放弃等
      // let label = node.roleControlConfirm.children[0].children[0],
      //     str = label.getComponent(cc.Label).string;
      // node.roleControlConfirm.active = false;
      // label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback);

      if (USER_CONTROL_STATE) {
        if (USER_CONTROL_STATE == VOTE_TYPE.transferEmblem) {
          _this.restorePollMovePolice(webSocket, game, node)
        }

        if (USER_CONTROL_STATE == VOTE_TYPE.votePolice) {
          _this.restorePollPolice(webSocket, game, node)
        }

        if (USER_CONTROL_STATE == VOTE_TYPE.voteDieInDay) {
          _this.restorePollDayList(webSocket, game, node)
        }
      } else {
        if (USER_ROLE == 1) {
          _this.wolfBtnClick = true
          _this.restorePollWolf(webSocket, game, node)
        }

        if (USER_ROLE == 4) {
          _this.restorePollWitch(webSocket, game, node)
        }

        if (USER_ROLE == 7) {
          _this.restorePollHunter(webSocket, game, node)
        }
      }
    })

    node.dumpSkip.on('touchstart', function (event) {
      // 过麦
      // _this.playMusic(webSocket, game, 9, 1);
      if (GAME_NATIVE && GAME_SOUND) {
        callNativeMethod({
          methodNameAndroid: 'appPlayVoice',
          methodNameIOS: 'appPlayVoice:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['guomai']
        })
      }
      if (SPEAK_TYPE) {
        socket.emit('room.dumpskip', {
          type: SPEAK_TYPE
        })
        // node.turnSelfSpeak.children[1].active = false;
        // node.turnSelfSpeak.children[2].active = false;
        // if (!node.giveUp.active) {
        //     node.turnSelfSpeak.active = false;
        // } else {
        //     node.dumpSkip.active = false;
        // }
      }
    })

    node.inviteFriend.on('touchstart', function () {
      // 邀请好友
      let voice = node.voice.getComponent('cc.Animation').getAnimationState('sound_in')
      if (voice.isPlaying) {
        _this.voiceTouchEnd(node, pageNode, socket)
      }

      if (GAME_INAPP) {
        COMMONOBJ.appInviteFriend()
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appInviteFriend',
          methodNameIOS: 'appInviteFriend:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [_this.shortRoomId]
        })
      }
    })

    node.userInfoDialog.children[1].children[2].on('touchstart', function (event) {
      // 个人信息
      event.stopPropagation()
      console.log('个人信息')
      // node.userInfoDialog.active = false;
      // game.dialogNode.children[0].active = false;
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
      let uid = uidNode.getComponent(cc.Label).string
      if (GAME_INAPP) {
        console.log('点击个人信息' + uid)
        COMMONOBJ.appSeeUserInfo(uid.substr(3))
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appSeeUserInfo',
          methodNameIOS: 'appSeeUserInfo:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [uid.substr(3)]
        })
      }
    })

    node.userInfoDialog.children[3].children[0].on('touchstart', function (event) {
      // 关注/或者取消关注
      event.stopPropagation()
      console.log('关注、取消关注')
      // node.userInfoDialog.active = false;
      // game.dialogNode.children[0].active = false;
      let isFollow = node.userInfoDialog.children[3].children[0].children[1].active
      if (isFollow) {
        game.creatPopUp('您已经关注过了!')
      } else {
        console.log('关注')
        let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
        let uid = uidNode.getComponent(cc.Label).string
        if (uid.substr(3) == GAME_UID) return
        http.post({
          url: 'https://wtf.xys.ren/263/interface/discuz.php?input=' + GAME_INPUT,
          data: {
            action: 'xys_home_attention',
            isFav: 1,
            rel: uid.substr(3)
          },
          success: function (data) {
            data = JSON.parse(data)
            if (data.status == 1) {
              // 关注成功
              game.creatPopUp('关注成功!')
              node.userInfoDialog.children[3].children[0].children[1].active = true
            }
          }
        })
      }
    })

    node.userInfoDialog.children[3].children[1].on('touchstart', function (event) {
      // 送礼物
      console.log('送礼物')
      node.userInfoDialog.active = false
      game.dialogNode.children[0].active = false
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
      let nickNameNode = node.userInfoDialog.children[0].children[0].children[0].children[0]
      let uid = uidNode.getComponent(cc.Label).string
      let nickName = nickNameNode.getComponent(cc.Label).string
      if (uid.substr(3) == GAME_UID) return
      if (GAME_INAPP) {
        console.log('点击送礼物' + uid)
        COMMONOBJ.appGiveGift(uid.substr(3), nickName)
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appGiveGift',
          methodNameIOS: 'appGiveGift:andNickName:',
          methodSignature: '(Ljava/lang/String;Ljava/lang/String;)V',
          parameters: [uid.substr(3), nickName]
        })
      }
    })

    node.userInfoDialog.children[3].children[2].on('touchstart', function (event) {
      // 聊天
      let voice = node.voice.getComponent('cc.Animation').getAnimationState('sound_in')
      if (voice.isPlaying) {
        _this.voiceTouchEnd(node, pageNode, socket)
      }

      node.userInfoDialog.active = false
      game.dialogNode.children[0].active = false
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
      let nickNameNode = node.userInfoDialog.children[0].children[0].children[0].children[0]
      let uid = uidNode.getComponent(cc.Label).string
      let nickName = nickNameNode.getComponent(cc.Label).string
      if (uid.substr(3) == GAME_UID) return
      if (GAME_INAPP) {
        console.log('点击聊天' + uid)
        COMMONOBJ.appTalkTogether(uid.substr(3), nickName)
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appTalkTogether',
          methodNameIOS: 'appTalkTogether:andNickName:',
          methodSignature: '(Ljava/lang/String;Ljava/lang/String;)V',
          parameters: [uid.substr(3), nickName]
        })
      }
    })

    node.userInfoDialog.children[3].children[3].on('touchstart', function (event) {
      // 踢人
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
      let uid = uidNode.getComponent(cc.Label).string
      if (uid.substr(3) == GAME_UID) return
      socket.emit('room.kickGamer', {
        seat: game.kickUserSeat
      })
      game.dialogNode.children[0].active = false
      node.userInfoDialog.active = false
    })

    node.userInfoDialog.children[3].children[4].on('touchstart', function (event) {
      // 移交房主
      node.userInfoDialog.active = false
      game.dialogNode.children[0].active = false
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0]
      let uid = uidNode.getComponent(cc.Label).string
      if (uid.substr(3) == GAME_UID) return
      http.post({
        url: HTTPURL + '/wolf101/room/moveRuser',
        data: {
          roomId: GAME_ROOMID,
          muid: uid.substr(3)
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          // let siteNode = game.siteArr[USER_SEAT]
          data = JSON.parse(data)
          GAME_ROOMMAIN = false
          game.creatPopUp(data.msg)
        }
      })
    })

    game.observe.on('touchstart', function (event) {
      event.stopPropagation()
      // 观战展开动画
      if (!_this.require) {
        _this.require = true
        let num = game.observe.width == 166 ? 1 : -1
        _this.observeChange(game, num)
      }
    })

    node.standUp.on('touchstart', function () {
      // 站起
      if (game.observe.width <= 166) {
        return
      }

      http.post({
        url: HTTPURL + '/wolf100/watch/standup',
        data: {
          roomId: GAME_ROOMID,
          seat: USER_SEAT
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          // let siteNode = game.siteArr[USER_SEAT]
          data = JSON.parse(data)
          console.log(data)
          if (data.code == 200) {
            let voice = node.voice.getComponent('cc.Animation').getAnimationState('sound_in')
            if (voice.isPlaying) {
              _this.voiceTouchEnd(node, pageNode, socket)
            }
          } else {
            game.creatPopUp(data.msg)
          }
        }
      })
    })

    game.observe.children[1].on('touchstart', function (event) {
      // 阻止观摩席点击展开冒泡
      event.stopPropagation()
    })

    // game.observe.children[1].children[0].on('touchstart',function(){
    //     _this.set(game);
    // })

    node.wolfBoom.on('touchstart', function () {
      // 狼人自爆按钮
      game.dialogNode.children[0].active = true
      game.dialogNode.children[11].active = true
    })

    game.dialogNode.children[11].children[2].on('touchstart', function () {
      // 狼人自爆
      // socket.emit('vote.poll', {
      //     seat: USER_SEAT,
      //     type: 10
      // })
      http.post({
        url: HTTPURL + '/wolf100/poll/poll',
        data: {
          type: 10,
          seat: USER_SEAT
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          data = JSON.parse(data)
          if (data.code == 200) {

          } else {
            game.creatPopUp(data.msg)
          }
        }
      })
      game.dialogNode.children[0].active = false
      game.dialogNode.children[11].active = false
    })

    game.dialogNode.children[11].children[1].on('touchstart', function () {
      // 狼人不自爆
      game.dialogNode.children[11].active = false
      game.dialogNode.children[0].active = false
    })

    game.input.children[0].children[0].on('editing-did-began', function (event) {
      setTimeout(function () {
        let height = callNativeMethod({
          methodNameAndroid: 'getInputHeight',
          methodNameIOS: 'getInputHeight',
          methodSignature: '()Ljava/lang/String;',
          parameters: []
        })
        if (height) {
          SCROLL_HEIGHT = parseInt(height) + 200
        } else {
          SCROLL_HEIGHT = 0
        }
      }, 500)
    })

    game.input.children[0].children[0].on('text-changed', function (event) {
      // 要发送的消息内容
      _this.message = ''
      _this.message = event.detail.string
    })

    game.input.children[0].children[0].on('editing-return', function (event) {
      // 按下键盘上的发送键
      _this.sendMassage(game, webSocket)
    })

    game.input.children[0].children[0].on('editing-did-ended', function (event) {
      SCROLL_HEIGHT = 0
    })

    node.sendMassage.on('touchstart', function () {
      // 发送消息
      _this.sendMassage(game, webSocket)
    })

    node.gulpMain.children[1].on('touchstart', function () {
      // 检查房主状态弹窗
      socket.emit('groupMain.delResponse', {})
      node.gulpMain.active = false
    })

    node.report.on('touchstart', function () {
      // 举报用户
      node.userInfoDialog.active = false
      game.dialogNode.children[0].active = false
      let uidNode = node.userInfoDialog.children[0].children[0].children[3].children[0],
        nickNameNode = node.userInfoDialog.children[0].children[0].children[0].children[0],
        uid = uidNode.getComponent(cc.Label).string,
        nickName = nickNameNode.getComponent(cc.Label).string
      if (uid.substr(3) == GAME_UID) return
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appAccusation',
          methodNameIOS: 'appAccusation:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [uid.substr(3)]
        })
      }
    })

    node.roleCard.on('touchstart', function (event) {
      // 卡牌介绍
      node.roleCardInfo.active = true
      node.roleCardInfo.getComponent('cc.PageView').setCurrentPageIndex(USER_ROLE - 1)
    })
    game.node.children[2].on('touchend', function (event) {
      // 滑动隐藏身份和观众竞猜
      event.stopPropagation()
      let endX = parseInt(event.touch.getLocationX())
      if (endX - _this.startX > 50) {
        // 向右滑动大于50
        if (!USER_ONTREE) {
          node.roleCard.children[8].active = true
          for (let i = 1; i < 13; i++) {
            pageNode.siteNode[i].userRole.active = false
            pageNode.siteNode[i].ruleOrder.active = false
          }
        }
        if (_this.quizActive) {
          _this.quizActive = false
          game.quiz.getComponent('cc.Animation').play('quiz_c')
          game.input.getComponent('cc.Animation').play('input_on')
        }
      }
      if (_this.startX - endX > 50) {
        // 向左滑动大于50
        if (USER_ONTREE) {
          _this.quizActive = true
          // game.quiz.active = true
          game.quiz.getComponent('cc.Animation').play('quiz')
          game.input.getComponent('cc.Animation').play('input_out')
        } else {
          node.roleCard.children[8].active = false
          for (let i = 1; i < 13; i++) {
            pageNode.siteNode[i].userRole.active = true
            pageNode.siteNode[i].ruleOrder.active = true
          }
        }
      }
    })
    game.node.children[2].on('touchstart', function (event) {
      // 背景点击关闭卡片详情&滑动
      event.stopPropagation()
      if (node.roleCardInfo.active) {
        node.roleCardInfo.active = false
      }
      for (let i = 1; i < 13; i++) {
        if (pageNode.siteNode[i].guessLeft.active || pageNode.siteNode[i].guessRight.active) {
          pageNode.siteNode[i].guessLeft.active = false
          pageNode.siteNode[i].guessRight.active = false
        }
      }
      _this.startX = parseInt(event.touch.getLocationX())
    })

    game.quiz.children[0].children[1].children[0].children[0].children[1].on('touchstart', function () {
      // 竞猜神民赢
      _this.whoWin = 1
      _this.getUdNumer(game, 1)
    })
    game.quiz.children[0].children[1].children[0].children[4].children[1].on('touchstart', function () {
      // 竞猜狼人赢
      _this.whoWin = 0
      _this.getUdNumer(game, 0)
    })
    game.dialogNode.children[20].children[7].on('touchstart', function () {
      // 确定下注
      socket.emit('room.userPutGuess', {
        winType: _this.whoWin,
        num: _this.quizUd
      })
    })
    game.dialogNode.children[20].children[8].on('touchstart', function () {
      // 取消下注
      game.dialogNode.children[20].active = false
    })

    game.dialogNode.children[20].children[4].children[0].on('text-changed', function (event) {
      // 选择下注数量
      let reg = new RegExp(/^[1-9]\d*$/)
      if (reg.test(event.detail.string)) {
        _this.quizUd = event.detail.string
      } else {
        game.dialogNode.children[20].children[4].children[0].getComponent('cc.EditBox').string = game.dialogNode.children[20].children[4].children[0].getComponent('cc.EditBox').string.substring(0, game.dialogNode.children[20].children[4].children[0].getComponent('cc.EditBox').string.length - 1)
      }
    })

    // node.roomId.parent.on('touchstart', function(event) {
    //     game.updateUI.active = true;
    // })
    // game.panel.node.children[7].on('touchstart', function(event) {
    //     game.checkUpdate();
    //     // console.log('checkUpdate');
    // })

    // game.panel.node.children[8].on('touchstart', function(event) {
    //     game.hotUpdate();
    //     // console.log('hotUpdate');
    // })

    // game.panel.node.children[9].on('touchstart', function(event) {
    //     game.retry();
    // })
    node.setSound.children[0].children[1].children[1].on('touchstart', function () {
      // 设置音乐开
      GAME_MUSIC = true
    })
    node.setSound.children[0].children[1].children[2].on('touchstart', function () {
      // 设置音乐关      
      GAME_MUSIC = false
    })
    node.setSound.children[1].children[1].children[1].on('touchstart', function () {
      // 设置音效开
      GAME_SOUND = true
    })
    node.setSound.children[1].children[1].children[2].on('touchstart', function () {
      // 设置音效关
      GAME_SOUND = false
    })
    node.setSound.children[2].children[1].children[1].on('touchstart', function () {
      // 设置公屏打字开
      GAME_TEXT = 0
      http.post({
        url: HTTPURL + '/wolf101/room/typingStatus',
        data: {
          type: 0,
          roomId: GAME_ROOMID
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          data = JSON.parse(data)
          game.creatPopUp(data.msg)
        }
      })
    })
    node.setSound.children[2].children[1].children[2].on('touchstart', function () {
      // 设置公屏打字关
      GAME_TEXT = 1
      http.post({
        url: HTTPURL + '/wolf101/room/typingStatus',
        data: {
          type: 1,
          roomId: GAME_ROOMID
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          data = JSON.parse(data)
          game.creatPopUp(data.msg)
        }
      })
    })
    node.setSound.children[3].children[1].children[1].on('touchstart', function () {
      // 设置观摩弹幕开
      GAME_BARRAGE = true
      game.barrageBox.opacity = 255
    })
    node.setSound.children[3].children[1].children[2].on('touchstart', function () {
      // 设置观摩弹幕关
      GAME_BARRAGE = false
      game.barrageBox.opacity = 0
    })
    node.startSpeak.children[0].on('touchstart', function () {
      // 游戏中开始发言
      _this.userSeat = USER_SEAT
      _this.gameStartSpeak(node, pageNode, socket)
      node.startSpeak.children[0].active = false
      node.startSpeak.children[1].active = true
      node.startSpeak.children[2].active = false
      game.selfSpeak.active = true
      game.selfSpeak.children[0].getComponent('cc.Animation').play('self_speak')
    })

    node.startSpeak.children[1].on('touchstart', function () {
      // 游戏中暂停发言
      _this.userSeat = USER_SEAT
      _this.voiceTouchEnd(node, pageNode, socket)
      node.startSpeak.children[0].active = false
      node.startSpeak.children[1].active = false
      node.startSpeak.children[2].active = true
      game.selfSpeak.active = false
      game.selfSpeak.children[0].getComponent('cc.Animation').stop('self_speak')
    })

    node.startSpeak.children[2].on('touchstart', function () {
      // 游戏中继续发言
      _this.userSeat = USER_SEAT
      _this.gameStartSpeak(node, pageNode, socket)
      node.startSpeak.children[0].active = false
      node.startSpeak.children[1].active = true
      node.startSpeak.children[2].active = false
      game.selfSpeak.active = true
      game.selfSpeak.children[0].getComponent('cc.Animation').play('self_speak')
    })

    node.mvp.children[2].on('touchstart', function () {
      // 关闭MVP弹框
      node.mvp.active = false
      game.dialogNode.children[0].active = false
    })
    node.protect.children[0].on('touchstart', function () {
      // 关闭首刀保护弹窗
      node.protect.active = false
      game.dialogNode.children[0].active = false
    })
    game.dialogNode.children.forEach(function (v, i) {
      // 阻止弹窗的冒泡
      v.on('touchstart', function (e) {
        e.stopPropagation()
      })
    })
    game.dialogNode.children[8].children[0].children[4].children[1].children[4].on('touchstart', function () {
      // 设置关闭密码
      game.dialogNode.children[8].children[0].children[4].children[1].active = false
      game.dialogNode.children[8].children[0].children[4].children[2].active = true
      http.post({
        url: HTTPURL + '/wolf101/enter/pwdstatus',
        data: {
          type: 0,
          roomId: GAME_ROOMID
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          cc.log(data)
          data = JSON.parse(data)
          cc.log(data)
          if (data.code == 200) {

          }
        }
      })
    })

    game.dialogNode.children[8].children[0].children[4].children[2].children[4].on('touchstart', function () {
      // 设置开启密码
      game.dialogNode.children[8].children[0].children[4].children[2].active = false
      game.dialogNode.children[8].children[0].children[4].children[1].active = true
      http.post({
        url: HTTPURL + '/wolf101/enter/pwdstatus',
        data: {
          type: 1,
          roomId: GAME_ROOMID
        },
        header: {
          sign: GAME_INPUT
        },
        success: function (data) {
          cc.log(data)
          data = JSON.parse(data)
          cc.log(data)
          if (data.code == 200) {

          }
        }
      })
    })
    game.dialogNode.children[22].on('touchstart', function () {
      // 关闭下注弹窗
      game.dialogNode.children[22].active = false
      game.dialogNode.children[0].active = false
    })

    game.dialogNode.children[21].on('touchstart', function () {
      // 关闭下注弹窗
      game.dialogNode.children[21].active = false
      game.dialogNode.children[0].active = false
    })

    game.dialogNode.children[20].children[5].on('touchstart', function () {
      // 全押
      game.dialogNode.children[20].children[4].children[0].getComponent('cc.EditBox').string = parseInt(USER_UDNUM)
      _this.quizUd = parseInt(USER_UDNUM)
    })

    game.dialogNode.children[20].children[6].on('touchstart', function () {
      // 押一半
      game.dialogNode.children[20].children[4].children[0].getComponent('cc.EditBox').string = parseInt(USER_UDNUM / 2)
      _this.quizUd = parseInt(USER_UDNUM / 2)
    })

    game.dialogNode.children[18].children[2].on('touchstart', function () {
      // 关闭竞猜失败
      game.dialogNode.children[18].active = false
      game.dialogNode.children[0].active = false
    })

    game.dialogNode.children[19].children[4].on('touchstart', function () {
      // 关闭竞猜成功
      game.dialogNode.children[19].active = false
      game.dialogNode.children[0].active = false
    })

    game.gameTop.children[1].on('touchstart', function () {
      // 设置里查看密码
      if (GAME_ROOMMAIN) {
        // 房主显示密码和公屏打字
        game.dialogNode.children[8].children[0].children[2].active = true
        if (ROOM_PASSWORD != 0) {
          // 密码不能为0
          game.dialogNode.children[8].children[0].children[4].active = true
        } else {
          game.dialogNode.children[8].children[0].children[4].active = false
        }
        if (GAME_START) {
          // 游戏开始后不能设置公屏打字
          game.dialogNode.children[8].children[0].children[2].active = false
        } else {
          game.dialogNode.children[8].children[0].children[2].active = true
        }
      } else {
        game.dialogNode.children[8].children[0].children[2].active = false
        game.dialogNode.children[8].children[0].children[4].active = false
      }
    })

    cc.find('pingpiao', game.dialogNode).children[1].on('touchstart', function () {
      cc.find('pingpiao', game.dialogNode).active = false
      game.dialogNode.children[0].active = false
    })
  },
  observeChange: function (game, num) {
    let _this = this
    setTimeout(function () {
      let width, distance
      if (num === 1) {
        width = 698 - game.observe.width
      } else {
        width = game.observe.width - 166
      }
      distance = width > 20 ? 20 : width
      game.observe.width += distance * num
      game.observe.children[1].width += distance * num
      let list = game.observe.children[1].children[0]
      list.width += distance * num
      list.children[0].width += distance * num

      if (width !== 0) {
        _this.observeChange(game, num)
      } else {
        _this.require = false
      }
    }, 16)
  },
  restorePollWolf (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string,
      _this = this
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    webSocket.pollWolf.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      if (_this.wolfBtnClick) {
        siteNode.getComponent('site').restorePollWolf(value, true)
      } else {
        siteNode.getComponent('site').restorePollWolf(value, false)
      }
    })
    _this.wolfBtnClick = false
  },
  restorePollWitch (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false

    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    webSocket.pollWitch.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollWitch(value)
    })
  },
  restorePollProphet (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    webSocket.pollProphet.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollProphet(value)
    })
  },
  restorePollGuard (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    webSocket.pollGuard.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollGuard(value)
    })
  },
  restorePollHunter (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)

    webSocket.pollHunter.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollHunter(value)
    })
  },
  restorePollMovePolice (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    USER_CONTROL_STATE = null
    webSocket.pollMovePolice.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollMovePolice(value)
    })
  },
  restorePollPolice (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    USER_CONTROL_STATE = null
    webSocket.pollPolice.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollPolice(value)
    })
  },
  restorePollDayList: function (webSocket, game, node) {
    let label = node.roleControlConfirm.children[0].children[0],
      str = label.getComponent(cc.Label).string
    node.roleControlConfirm.active = false
    label.getComponent(cc.Label).unschedule(label.getComponent(cc.Label).callback)
    USER_CONTROL_STATE = null
    webSocket.pollDayList.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollDayList(value)
    })
  },

  voiceTouchEnd: function (node, pageNode, socket) {
    // 松开停止

    let voice = node.voice.getComponent('cc.Animation'),
      siteNode = pageNode.siteNode[this.userSeat]
    voice.stop('sound_in')
    voice.play('sound_out')

    if (this.userSeat > 0 && this.userSeat < 7) {
      socket.emit('room.userTalk', {
        type: 0
      })
      if (!GAME_START) {
        siteNode.userTalkLeft.children[0].active = false
        siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').stop('speak')
      } else {
        siteNode.userTalkLeft.children[1].active = false
        siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
      }
    } else {
      socket.emit('room.userTalk', {
        type: 0
      })
      if (!GAME_START) {
        siteNode.userTalkRight.children[0].active = false
        siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').stop('speak')
      } else {
        siteNode.userTalkRight.children[1].active = false
        siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
      }
    }
    this.userSeat = 0
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
  // playMusic: function(webSocket, game, num, time) {
  //     cc.audioEngine.play(game.audio[num], false, time);
  // },
  enterRoom: function (socket, game) {
    http.post({
      url: HTTPURL + '/wolf100/enter/normal',
      data: {
        roomId: GAME_ROOMID
      },
      header: {
        sign: GAME_INPUT
      },
      success: function (data) {
        data = JSON.parse(data)
        if (data.code === 200) {
          if (data.data.roomId) {
            GAME_ROOMID = data.data.roomId
            socket.emit('room.enter', {
              roomId: GAME_ROOMID,
              roomType: 1,
              longLeave: LONGLEAVE
            })
            game.gameReady[0].active = false
          }
          if (data.data.punish) {
            // 裁决之刃惩罚时间
          }
        } else {
          game.creatPopUp(data.msg)
        }
      }
    })
  },
  getShortRoomId: function (pageNode, game) {
    let _this = this
    http.post({
      url: HTTPURL + '/wolf100/enter/getroom',
      data: {
        roomId: GAME_ROOMID
      },
      header: {
        sign: GAME_INPUT
      },
      success: function (data) {
        data = JSON.parse(data)
        if (data.code === 200) {
          let label = pageNode.node.roomId.getComponent(cc.Label)
          label.string = data.data.mappingId + '房间'
          _this.shortRoomId = data.data.mappingId
        } else {
          game.creatPopUp(data.msg)
        }
      }
    })
  },
  gameStartSpeak: function (node, pageNode, socket) {
    this.userSeat = USER_SEAT
    // let ms = new Date().getTime();
    // if (ms - _this.timeInterval < 500) {
    //     return;
    // } else {
    //     _this.timeInterval = ms;
    // }
    // let ws = socket.getWs();
    // if (cc.sys.isObjectValid(ws) && ws) {
    //     //检查对象有效
    //     if (ws.readyState && ws.readyState !== 1) {
    //         console.log('readyState');
    //         return;
    //     }
    // } else {
    //     return;
    // }

    let voice = node.voice.getComponent('cc.Animation')
    let siteNode = pageNode.siteNode[this.userSeat]
    voice.play('sound_in')
    if (this.userSeat > 0 && this.userSeat < 7) {
      if (!GAME_START) {
        siteNode.userTalkLeft.children[0].active = true
        siteNode.userTalkLeft.children[0].children[0].getComponent('cc.Animation').play('speak')
        socket.emit('room.userTalk', {
          type: 1
        })
      } else {
        siteNode.userTalkLeft.children[1].active = true
        siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').play('speak_start')
        socket.emit('room.speak', {
          type: SPEAK_TYPE
        })
        socket.emit('room.userTalk', {
          type: 1
        })
      }
    } else {
      if (!GAME_START) {
        siteNode.userTalkRight.children[0].active = true
        siteNode.userTalkRight.children[0].children[0].getComponent('cc.Animation').play('speak')
        socket.emit('room.userTalk', {
          type: 1
        })
      } else {
        siteNode.userTalkRight.children[1].active = true
        siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').play('speak_start')
        socket.emit('room.speak', {
          type: SPEAK_TYPE
        })
        socket.emit('room.userTalk', {
          type: 1
        })
      }
    }
    if (GAME_INAPP) {
      COMMONOBJ.appUserStartSpeak()
    }
    if (GAME_NATIVE) {
      callNativeMethod({
        methodNameAndroid: 'appUserStartSpeak',
        methodNameIOS: 'appUserStartSpeak',
        methodSignature: '()V',
        parameters: []
      })
    }
  },
  getUdNumer: function (game, type) {
    http.post({
      url: HTTPURL + '/wolf100/room/getUserUnum',
      header: {
        sign: GAME_INPUT
      },
      success: function (data) {
        data = JSON.parse(data)
        if (data.code === 200) {
          USER_UDNUM = data.data.num
          game.dialogNode.children[20].active = true
          game.dialogNode.children[20].children[2].children[0].getComponent('cc.Label').string = data.data.num
          if (type === 1) {
            game.dialogNode.children[20].children[0].children[1].active = true
            game.dialogNode.children[20].children[0].children[0].active = false
          } else {
            game.dialogNode.children[20].children[0].children[0].active = true
            game.dialogNode.children[20].children[0].children[1].active = false
          }
        } else {
          game.creatPopUp(data.msg)
        }
      }
    })
  },
  sendMassage: function (game, webSocket) {
    if (GAME_NATIVE && this.message.trim()) {
      let ms = new Date().getTime()
      console.log(ms - this.sendMsgInterval)
      if (ms - this.sendMsgInterval < 3000) {
        game.creatPopUp('请休息一下')
        return
      } else {
        this.sendMsgInterval = ms
      }
      if (game.newVersion == 0) {
        // 发送后判断谁能看
        callNativeMethod({
          methodNameAndroid: 'appSendMessage',
          methodNameIOS: 'appSendMessage:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [this.message]
        })
      }

      if (game.newVersion >= 1) {
        // 发送前确认谁能看
        let uidList = this.canSeeUidList(webSocket)

        callNativeMethod({
          methodNameAndroid: 'appSendMessage',
          methodNameIOS: 'appSendMessage:uidList:',
          methodSignature: '(Ljava/lang/String;Ljava/lang/String;)V',
          parameters: [this.message, uidList.join('&')]
        })
      }
    }

    this.message = ''
    game.input.children[0].children[0].getComponent(cc.EditBox).string = ''
  },
  canSeeUidList: function (webSocket) {
    let uidList = []

    if (GAME_START) {
      // 游戏开始
      let treeUidList = []
      // let livingPerson = []
      let diePerson = []
      let wolfLivingList = []

      for (let i = 0; i < webSocket.roomUserInfo.length; i++) {
        if (webSocket.roomUserInfo[i]) {
          if (webSocket.roomUserInfo[i].isdie && parseInt(webSocket.roomUserInfo[i].isdie) > 0) {
            diePerson.push(webSocket.roomUserInfo[i].uid)
          } else {
            if (parseInt(webSocket.roomUserInfo[i].role) === 1) {
              wolfLivingList.push(webSocket.roomUserInfo[i].uid)
            }
            // livingPerson.push(webSocket.roomUserInfo[i].uid);
          }
        }
      }

      if (USER_ONTREE || GAME_USERDIE) {
        // 树上用户或者死亡用户
        for (let i = 0; i < webSocket.treeList.length; i++) {
          if (webSocket.treeList[i]) {
            treeUidList.push(webSocket.treeList[i].uid)
          }
        }
        uidList = diePerson.concat(treeUidList)
      } else {
        // 在座位上的活着的玩家
        if (GAME_ISNIGHT) {
          uidList = wolfLivingList
        } else {
          uidList.push(-2)
        }
      }
    } else {
      // 游戏未开始
      uidList.push(-2)
    }
    return uidList
  }
}

module.exports = ready
