const SocketWolf = require('../util/socket.wolf')
const util = require('../util/util')
const http = require('../util/http')
const webSocket = {
  socket: null, // socket对象
  roomInfo: {}, // 房间信息(现在基本没用)
  roomUserInfo: [], // 座位上玩家信息列表
  panicBuyId: {}, // 购买身份牌ID
  userRoleInfo: {}, // 用户角色信息(现在基本没用)
  pollWolf: null, // 狼人可杀人信息
  pollWitch: null, // 女巫可投票信息
  pollProphet: null, // 预言家可验人信息
  pollGuard: null, // 守卫可守人信息
  pollPolice: null, // 可选警长信息
  pollHunter: null, // 猎人可枪人信息
  pollMovePolice: null, // 可移交警徽信息
  pollDayList: null, // 白天投票信息
  music: [], // 音乐(现在基本没用)
  changeTime: null, // 倒计时时间(现在没用)
  treeList: [], // 树上观战人信息列表
  deathNum: 0, // 死亡人数(现在没用)
  heartBeat: false, // 是否收到心跳消息
  deathNight: false, // 晚上是否有人死亡
  password: null,
  enterFinish: false, // 房间内信息获取完成
  playingEnter: false, // 游戏中重连
  speakFailTimes: 0, // 上麦失败提交次数
  init (game, pageNode, msgCtrl) {
    // 121.43.104.3:8090
    const socket = new SocketWolf('ws://120.55.94.156:8090')
    // const socket = new SocketWolf('ws://101.37.226.173:8090')
    const _this = this
    const node = pageNode.node
    this.socket = socket

    socket.on('Heartbeat', function (data) {
      // 心跳
      _this.heartBeat = true
      util.ping('http://wtf.xys.ren/ping.php', function (value) {
        PING = value
      })
      socket.emit('ping', {
        ping: PING
      })
    })

    socket.on('requit', function (data) {})

    socket.on('reconnection', function (data) {
      // 断线重连
      // socket.emit('room.reEnter', {
      //     roomId: data.data.roomid,
      //     longLeave: LONGLEAVE
      // })
      // _this.reconnection = true;
      // node.roomId.getComponent(cc.Label).string = data.data.roomid + '房间';
      // GAME_START = true;
      // cc.audioEngine.stopAll();
    })

    socket.on('room.reEnter', function (data) {
      // 游戏中进入房间 重新连入
      if (data.data.list.length > 0) {
        // data.data.list.forEach(function(value, index, array) {
        //     let order = value.seat - 1,
        //         siteNode = game.siteArr[order];
        //     _this.userRoleInfo[order] = value;
        //     _this.roomUserInfo[order] = value;
        //     siteNode.getComponent('site').roomReEnter(value);
        // })
        if (data.data.istyping) {
          game.input.active = false
          node.setSound.children[2].children[1].children[2].getComponent(cc.Toggle).uncheck()
        } else {
          game.input.active = true
          node.setSound.children[2].children[1].children[1].getComponent(cc.Toggle).check()
        }
        game.gameReady[0].active = false
        if (data.code != 200) {
          game.creatPopUp(data.msg)
        } else {
          if (data.data.list) {
            // if (data.data.isStart == 1) {
            //     GAME_START = true;
            // }
            GAME_START = true
            if (data.data.hasOwnProperty('canSetdown')) {
              CANSITEDOWN = parseInt(data.data.canSetdown)
              if (CANSITEDOWN !== 1) {
                game.creatPopUp('您的游戏等级未满5级,暂时无法加入高阶场的游戏')
              }
            }

            if (data.data.list.length > 0) {
              data.data.list.forEach(function (value, index, array) {
                if (value.seat != 0) {
                  let order = value.seat - 1,
                    siteNode = game.siteArr[order]
                  _this.roomUserInfo[order] = value
                  siteNode.getComponent('site').roomReEnter(value)
                  if (value.uid == GAME_UID) {
                    USER_ONTREE = false
                    USER_SEAT = value.seat
                    _this.userRoleInfo[order] = value
                  }
                } else {
                  if (value.uid == GAME_UID) {
                    _this.onTreeSelf(node, value, game)
                    game.quizResult.active = true
                    game.quiz.children[0].children[1].children[0].children[0].children[0].active = false
                    game.quiz.children[0].children[1].children[0].children[0].children[1].active = true
                    game.quiz.children[0].children[1].children[0].children[4].children[0].active = false
                    game.quiz.children[0].children[1].children[0].children[4].children[1].active = true
                    game.dialogNode.children[0].active = true
                    game.dialogNode.children[22].active = true
                    game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '未押注'
                  } else {
                    let ava = cc.instantiate(game.avatar)
                    if (value.avatar) {
                      util.loadImage(value.avatar, ava.children[0].children[0], null)
                    }
                    ava.uid = value.uid
                    node.standUp.parent.parent.addChild(ava)
                  }
                  _this.treeList.push(value)
                  game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人'
                }
              })
            }
            _this.enterFinish = true
          }
        }
      }
    })

    socket.on('connect', function (data) {
      // 连接
      // socket.emit('login', {
      //     uid: GAME_UID
      // })
      if (GAME_INAPP) {
        socket.setSocketSign(GAME_SIGN)
        socket.emit('login', {
          uid: GAME_UID
        })
      }
      if (GAME_NATIVE) {
        socket.setSocketSign(GAME_SIGN)
        socket.emit('login', {
          uid: GAME_UID
        })
      }

      if (!GAME_NATIVE && LONGLEAVEWEB) {
        LONGLEAVEWEB = false
        socket.emit('login', {
          uid: GAME_UID
        })
      }
    })

    socket.on('login', function (data) {
      // 登录
      // socket.emit('room.create',{
      //     type:1
      // })
      if (GAME_INAPP) {
        socket.emit('room.enter', {
          roomId: GAME_ROOMID,
          roomType: 1,
          longLeave: LONGLEAVE
        })
      }
      if (GAME_NATIVE) {
        socket.emit('room.enter', {
          roomId: GAME_ROOMID,
          roomType: 1,
          longLeave: LONGLEAVE
        })
        if (LONGLEAVE === 0) {
          _this.playingEnter = true
        }
      }
      if (!GAME_NATIVE && !LONGLEAVEWEB) {
        LONGLEAVEWEB = true
        socket.emit('room.enter', {
          roomId: GAME_ROOMID,
          roomType: 1,
          longLeave: LONGLEAVE
        })
      }
    })

    socket.on('room.create', function (data) {
      // 创建房间
      _this.roomInfo = data.data
      socket.emit('room.enter', {
        roomId: data.data.roomId,
        roomType: 1
      })
      // GAME_ROOMID = data.data.roomId;
      game.gameReady[0].active = false
      // node.roomId.getComponent(cc.Label).string = data.data.roomId + ' 房间';
    })

    socket.on('room.enter', function (data) {
      // 进入房间
      LONGLEAVE = 0
      if (data.code !== 200) {
        // 进入房间失败
        game.creatPopUp(data.msg)
        setTimeout(function () {
          util.quitGame(_this.socket)
        }, 2000)
        return
      }
      _this.getPassword(function (data) {
        console.log(data)
        ROOM_PASSWORD = data
        if (data && data != 0) {
          data.toString()
          let pwdList = data.split('')
          game.dialogNode.children[8].children[0].children[2].active = true
          pwdList.forEach(function (v, i) {
            game.dialogNode.children[8].children[0].children[2].children[1].children[i].children[0].getComponent('cc.Label').string = v
            game.dialogNode.children[8].children[0].children[2].children[2].children[i].children[0].getComponent('cc.Label').string = v
          })
          game.dialogNode.children[8].children[0].children[2].children[1].active = true
        } else {
          game.dialogNode.children[8].children[0].children[2].active = false
        }
      })

      if (data.data.isStart == 1) {
        GAME_START = true
      }
      if (data.data.hasOwnProperty('canSetdown')) {
        CANSITEDOWN = parseInt(data.data.canSetdown)
        if (CANSITEDOWN !== 1) {
          game.creatPopUp('您的游戏等级未满5级,暂时无法加入高阶场的游戏')
        }
      }

      _this.roomUserInfo.forEach(function (value, index) {
        if (value) {
          let uindex = util.findProperty(data.data.list, 'uid', value.uid)
          if (uindex == -1 || (uindex !== -1 && value.seat != data.data.list[uindex].seat)) {
            let order = value.seat - 1,
              siteNode = game.siteArr[order]
            _this.roomUserInfo[index] = null
            siteNode.getComponent('site').roomUserQuit(value)
          }
        }
        // _this.treeList.length = 0;
        // let content = node.standUp.parent.parent;
        // for (let i = 1; i < content.children.length; i++) {
        //     content.children[i].destroy();
        //     break;
        // }
        // game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人';
      })
      _this.treeList.forEach(function (value, index) {
        let tindex = util.findProperty(data.data.list, 'uid', value.uid)
        if (tindex == -1) {
          let content = node.standUp.parent.parent
          for (let i = 1; i < content.children.length; i++) {
            if (content.children[i].uid == value.uid) {
              _this.treeList.splice(index, 1)
              content.children[i].destroy()
            }
          }
        }
      })
      game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人'
      _this.enterRoom(data, game, node)
      _this.enterFinish = true
    })

    socket.on('room.userEnter', function (data) {
      // 其它用户进入房间
      LONGLEAVE = 0
      _this.enterRoom(data, game, node)
    })

    socket.on('room.quit', function (data) {
      // 用户退出
      // let siteNode = game.siteArr[USER_SEAT - 1];
      // _this.roomUserInfo[USER_SEAT - 1] = null;
      // siteNode.getComponent('site').roomUserQuit(data.data);
      if (game.netease) {
        setTimeout(function () {
          util.quitGame(socket)
        }, 5000)
      } else {
        util.quitGame(socket)
      }
    })

    socket.on('room.userQuit', function (data) {
      // 用户退出房间
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      if (data.data.seat != 0) {
        _this.roomUserInfo[order] = null
        siteNode.getComponent('site').roomUserQuit(data.data)
      } else {
        let index = _this.isHasElementOne(_this.treeList, data.data.uid)
        if (index != -1) {
          _this.treeList.splice(index, 1)
          let content = node.standUp.parent.parent
          for (let i = 1; i < content.children.length; i++) {
            if (content.children[i].uid == data.data.uid) {
              content.children[i].destroy()
              break
            }
          }
        }
        game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人'
      }
    })

    socket.on('room.roomMainQuit', function (data) {
      // 房主变更
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      _this.roomInfo.isMain = 1
      if (data.data.seat == USER_SEAT) {
        node.cancle.active = false
        node.startGame.active = true
        node.readyGame.active = false
        GAME_ROOMMAIN = true
      }
      if (data.data.seat) {
        if (data.data.seat != 0) {
          siteNode.getComponent('site').roomMainQuit(data.data)
        }
      }
    })

    socket.on('room.ready', function (data) {
      // 准备/取消准备
      let order = data.data.seat - 1
      let siteNode = game.siteArr[order]
      siteNode.getComponent('site').roomReady(data.data)
    })

    socket.on('room.start', function (data) {
      // 开始游戏
      if (data.code == 200) {
        // 清除公屏信息
        msgCtrl.allMsg = []
        msgCtrl.displayMsg = []
        msgCtrl.autoScroll = true
        msgCtrl.nowOffset = 0
        msgCtrl.contentH = 0
        game.chatContent.removeAllChildren()
        game.chatContent.height = msgCtrl.height
        game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '未押注'
        GAME_TEXT = data.data.typing
        if (!USER_ONTREE) {
          if (data.data.list) {
            node.panicBuy.children[1].children.forEach(function (v, i) {
              node.panicBuy.children[1].children[i].active = false
            })
            game.dialogNode.active = true
            game.dialogNode.children[0].active = true
            node.panicBuy.active = true
            data.data.list.forEach(function (v, i) {
              node.panicBuy.children[1].children[v.roleId - 1].active = true
              node.panicBuy.children[1].children[v.roleId - 1].children[1].children[0].getComponent(cc.Label).string = v.price_ud + 'U豆'
              node.panicBuy.children[1].children[v.roleId - 1].children[2].children[0].getComponent(cc.Label).string = v.price + 'U币'
            })
            let label = node.panicBuyTime.getComponent(cc.Label),
              time = 5
            label.string = '倒计时(' + time + ')'
            node.panicBuy.active = true
            // node.panicBuyTime.getComponent(cc.Label).unscheduleAllCallbacks();
            label.unscheduleAllCallbacks()
            label.callback = function () {
              time--
              label.string = '倒计时(' + time + ')'
              if (time <= 0) {
                node.panicBuy.active = false
                game.dialogNode.children[0].active = false
                // game.dialogNode.active = false;
                label.unschedule(label.callback)
              }
            }
            label.schedule(label.callback, 1)
          }
        }
        if (USER_ONTREE) {
          game.quizResult.active = true
        }
        if (data.data.istyping && !USER_ONTREE) {
          game.input.active = false
        } else {
          game.input.active = true
        }
        game.gameControl.children[0].active = false
        node.voice.active = false
        node.startSpeak.children[0].active = false
        node.startSpeak.children[1].active = false
        node.startSpeak.children[2].active = false
        // 取消头像上的准备icon
        _this.roomUserInfo.forEach(function (value, index, array) {
          if (value) {
            let order = value.seat - 1,
              siteNode = game.siteArr[order]
            siteNode.getComponent('site').roomStart(value)
          }
        })
      } else {
        game.creatPopUp(data.msg)
      }
    })

    socket.on('shop.buyRole', function (data) {
      // 抢购角色
      game.creatPopUp(data.msg)
      if (data.code == 200) {
        game.dialogNode.children[0].active = false
        node.panicBuy.active = false
      }
    })

    socket.on('room.allotRole', function (data) {
      // 分配角色
      node.panicBuy.active = false
      game.dialogNode.children[0].active = false
      data.data.list.forEach(function (value, index, array) {
        let order = value.seat - 1,
          siteNode = game.siteArr[order]
        _this.userRoleInfo[order] = value
        siteNode.getComponent('site').roomAllotRole(value)
      })
    })

    socket.on('room.pollWolf', function (data) {
      // 狼人可投票信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollWolf = data.data
      _this.roleControl(data, game, 'roomPollWolf')
      _this.roleControlCountTime(game, node, '确定', 30, true, 'restorePollWolf')
    })

    socket.on('room.pollProphet', function (data) {
      // 预言家可投票信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollProphet = data.data
      _this.roleControl(data, game, 'roomPollProphet')
      _this.roleControlCountTime(game, node, '确定', 30, false, 'restorePollProphet')
    })

    socket.on('room.pollGuard', function (data) {
      // 守卫可投票信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollGuard = data.data
      _this.roleControl(data, game, 'roomPollGuard')
      _this.roleControlCountTime(game, node, '确定', 30, false, 'restorePollGuard')
    })

    socket.on('room.pollWitch', function (data) {
      // 女巫可投票信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollWitch = data.data
      _this.roleControl(data, game, 'roomPollWitch')
      _this.roleControlCountTime(game, node, '放弃', 15, true, 'restorePollWitch')
    })

    socket.on('room.pollHunter', function (data) {
      // 猎人可开枪信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollHunter = data.data
      _this.roleControl(data, game, 'roomPollHunter')
      _this.roleControlCountTime(game, node, '放弃', 10, true, 'restorePollHunter')
    })

    socket.on('room.pollPolice', function (data) {
      // 可投票选警长信息
      game.creatPopUp('请直接点击玩家头像操作')
      if (_this.pollPolice) {
        game.readyGo.restorePollPolice(game.webSocket, game, node)
      }
      _this.pollPolice = data.data
      _this.roleControl(data, game, 'roomPollPolice')
      USER_CONTROL_STATE = VOTE_TYPE.votePolice
      GAME_VOTE = true
    })

    socket.on('room.pollMovePolice', function (data) {
      // 可移交警徽信息
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollMovePolice = data.data
      _this.roleControl(data, game, 'roomPollMovePolice')
      USER_CONTROL_STATE = VOTE_TYPE.transferEmblem
    })

    socket.on('room.pollDaylist', function (data) {
      // 白天可投票信息
      // _this.playMusic(8, game, 1);
      if (GAME_NATIVE && GAME_MUSIC) {
        callNativeMethod({
          methodNameAndroid: 'appPlayVoice',
          methodNameIOS: 'appPlayVoice:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['toupiao']
        })
      }
      game.creatPopUp('请直接点击玩家头像操作')
      _this.pollDayList = data.data
      _this.roleControl(data, game, 'roomPollDayList')
      USER_CONTROL_STATE = VOTE_TYPE.voteDieInDay
      GAME_VOTE = true
    })

    socket.on('room.roleNum', function (data) {
      // 游戏开始后下发对局角色
      let roleInfo = node.gameChat.children[4].children[0]
      // node.gameChat.children[4].children[0];
      roleInfo.getComponent(cc.Label).string = data.msg
      GAME_START = true
    })

    socket.on('vote.wolfKill', function (data) {
      // 给所有狼人下发所有狼人杀人信息
      game.readyGo.restorePollWolf(game.webSocket, game, node)
    })

    socket.on('room.startGameNight', function (data) {
      // 天黑开始游戏
      game.node.children[1].opacity = 255
      game.node.children[2].opacity = 255

      let day = NUMBER_CN[data.data.days - 1],
        isNight
      if (data.data.isnight == 1) {
        isNight = '黑夜'
        node.gameChatSign.getComponent(cc.Label).string = '天黑了'
      } else {
        isNight = '白天'
      }
      GAME_ISNIGHT = true
      // cc.audioEngine.pauseAllEffects();
      if (data.data.days == 1) {
        if (!USER_ONTREE) {
          game.dialogNode.children[0].active = true
          game.dialogNode.children[21].active = true
        } else {
          game.dialogNode.children[0].active = true
          game.dialogNode.children[22].active = true
        }
        setTimeout(function () {
          // _this.playMusic(6, game, 1);
          if (GAME_NATIVE && GAME_MUSIC) {
            callNativeMethod({
              methodNameAndroid: 'appPlayVoice',
              methodNameIOS: 'appPlayVoice:',
              methodSignature: '(Ljava/lang/String;)V',
              parameters: ['tianhei']
            })
          }
          game.quiz.children[0].children[1].children[0].children[0].children[0].active = false
          game.quiz.children[0].children[1].children[0].children[0].children[1].active = true
          game.quiz.children[0].children[1].children[0].children[4].children[0].active = false
          game.quiz.children[0].children[1].children[0].children[4].children[1].active = true
          game.node.children[2].getComponent('cc.Animation').play('Time_day')
        }, 5000)
      } else {
        // _this.playMusic(6, game, 1);
        if (GAME_NATIVE && GAME_MUSIC) {
          callNativeMethod({
            methodNameAndroid: 'appPlayVoice',
            methodNameIOS: 'appPlayVoice:',
            methodSignature: '(Ljava/lang/String;)V',
            parameters: ['tianhei']
          })
        }
        game.node.children[2].getComponent('cc.Animation').play('Time_day')
      }

      node.gameTime.getComponent(cc.Label).string = '第' + data.data.days + '天 ' + isNight
      // for (let i = 0; i < 12; i++) {
      //     let siteNode = game.siteArr[i];
      //     siteNode.getComponent('site').roomStartGameNight();
      // }
      _this.roomUserInfo.forEach(function (value, index, array) {
        if (value) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          siteNode.getComponent('site').roomStartGameNight()
        }
      })
    })

    socket.on('game.change_time', function (data) {
      // 改变倒计时
      node.gameChatSign.getComponent(cc.Label).string = data.msg
      if (data.data > 0) {
        let label = node.gameCountTime.getComponent(cc.Label)
        label.string = data.data + 's'
        _this.changeTime = data.data
        node.gameCountTime.parent.active = true
        label.unscheduleAllCallbacks()
        label.callback = function () {
          data.data--
          label.string = data.data + 's'
          if (data.data <= 0) {
            node.gameCountTime.parent.active = false
            label.unschedule(label.callback)
          }
        }
        label.schedule(label.callback, 1)
      }
    })

    socket.on('vote.GameDay', function (data) {
      // 天亮了
      game.node.children[1].opacity = 255
      if (data.data.days == 1) {
        if (!USER_ONTREE) {
          game.dialogNode.children[0].active = false
          game.dialogNode.children[21].active = false
        } else {
          game.dialogNode.children[0].active = false
          game.dialogNode.children[22].active = false
        }
      }
      let day = NUMBER_CN[data.data.days - 1],
        isNight
      if (data.data.isnight == 1) {
        isNight = '黑夜'
      } else {
        isNight = '白天'
      }
      GAME_ISNIGHT = false
      GAME_VOTE = false
      // cc.audioEngine.pauseAllEffects();
      // _this.playMusic(7, game, 1);
      if (GAME_NATIVE && GAME_SOUND) {
        callNativeMethod({
          methodNameAndroid: 'appPlayVoice',
          methodNameIOS: 'appPlayVoice:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['tianliang']
        })
      }
      game.node.children[1].getComponent('cc.Animation').play('Time_night')
      node.gameTime.getComponent(cc.Label).string = '第' + data.data.days + '天 ' + isNight
      // for (let i = 0; i < 12; i++) {
      //     let siteNode = game.siteArr[i];
      //     siteNode.getComponent('site').voteGameDay();
      // }
      _this.roomUserInfo.forEach(function (value, index, array) {
        if (value) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          siteNode.getComponent('site').voteGameDay()
        }
      })
    })

    socket.on('vote.pollNotice', function (data) {
      // 狼人杀人反馈
      let nowOrder = data.data.poll - 1,
        lastOrder = data.data.oldPoll - 1,
        siteNode = game.siteArr[nowOrder]

      if (data.data.poll != data.data.oldPoll) {
        if (data.data.oldPoll != 0) {
          let siteNodeLess = game.siteArr[lastOrder]
          siteNodeLess.getComponent('site').votePollNoticeLess(data.data)
        }
        siteNode.getComponent('site').votePollNotice(data.data)
      }
    })

    socket.on('vote.notwolfKill', function (data) {
      // 狼人没有杀人反馈
      game.readyGo.restorePollWolf(game.webSocket, game, node)
    })

    socket.on('vote.seeRole', function (data) {
      // 预言家反馈
      // data.seat  data.isdie
      _this.roleControlCountTime(game, node, '确定', 30, false, 'restorePollProphet')
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order],
        seeRole = game.dialogNode.children[5]
      // game.dialogNode.children[0].active = true;
      // seeRole.active = true;
      data.data.avatar = _this.roomUserInfo[order].avatar
      siteNode.getComponent('site').voteSeeRole(data.data)
    })

    socket.on('vote.notseeRole', function (data) {
      // 预言家没有验人反馈
      _this.roleControlCountTime(game, node, '确定', 30, false, 'restorePollProphet')
      if (data.data.seat == 0) {
        game.readyGo.restorePollProphet(game.webSocket, game, node)
      }
    })

    socket.on('vote.saveRole', function (data) {
      // 守卫守人反馈
      let order = parseInt(data.data.poll) - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollGuard(data.data)
    })

    socket.on('vote.notsaveRole', function (data) {
      // 守卫没有守人反馈

      if (data.data.seat == 0) {
        game.readyGo.restorePollGuard(game.webSocket, game, node)
      }
    })

    socket.on('vote.hunterKill', function (data) {
      // 猎人开枪反馈
      let order = parseInt(data.data.poll) - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').voteHunterKill(data.data)
    })

    socket.on('vote.nothunterKill', function (data) {
      // 猎人没有开枪反馈
      game.readyGo.restorePollHunter(game.webSocket, game, node)
    })

    socket.on('vote.dowitchPoll', function (data) {
      // 女巫毒救人反馈
      let order = parseInt(data.data.seat) - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').restorePollWitch(data.data)
      game.readyGo.restorePollWitch(game.webSocket, game, node)
    })

    socket.on('vote.notdowitchPoll', function (data) {
      // 女巫没有毒救人反馈
      game.readyGo.restorePollWitch(game.webSocket, game, node)
    })

    socket.on('vote.todayPoll', function (data) {
      // 白天投票反馈

    })

    socket.on('vote.overPoll', function (data) {
      // 白天投票结果反馈
      GAME_VOTE = false
      if (data.data) {
        let order = data.data.seat - 1,
          siteNode = game.siteArr[order]
        if (data.data.seat == USER_SEAT) {
          GAME_USERDIE = true
        }
        if (data.data.isdie) {
          siteNode.getComponent('site').voteOverPoll(data.data)
        }
      }
    })

    socket.on('vote.pollPolice', function (data) {
      // 投票警长成功
    })

    socket.on('room.giveupCampaign', function (data) {
      // 弃选警长
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').roomGiveupCampaign(data.data)
    })

    socket.on('vote.decisionCampaign', function (data) {
      // 谁当选了警长
      for (let i = 0; i < 12; i++) {
        let siteNode = game.siteArr[i]
        siteNode.getComponent('site').voteDecisionCampaign(data.data)
      }
      node.giveUp.active = false
      GAME_VOTE = false
    })

    socket.on('vote.handleSpeackorder', function (data) {
      // 移交警徽反馈
    })

    socket.on('vote.policeBadge', function (data) {
      // 移交警徽处理
      let order1 = data.data.poll - 1,
        siteNode1 = game.siteArr[order1],
        order2 = data.data.seat - 1,
        siteNode2 = game.siteArr[order2]
      siteNode1.getComponent('site').votePoliceBadge(data.data)
      siteNode2.getComponent('site').votePoliceBadge(data.data)
    })

    socket.on('vote.notpoliceBadge', function (data) {
      // 撕掉警徽
      for (let i = 0; i < 12; i++) {
        let siteNode = game.siteArr[i]
        siteNode.getComponent('site').voteNotPoliceBadge()
      }
    })

    socket.on('vote.otherDieInfo', function (data) {
      // 此角色是猎人
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').voteOtherDieInfo(data.data)
    })

    socket.on('vote.poll', function (data) {
      // 角色投票

    })

    socket.on('vote.tellResult', function (data) {
      // 判断人数 是否竞选 跳过竞选  公布结果
      _this.roomUserInfo.forEach(function (value, index, array) {
        if (value) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          siteNode.getComponent('site').restorePollDay()
        }
      })
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appStopVoice',
          methodNameIOS: 'appStopVoice',
          methodSignature: '()V',
          parameters: []
        })
      }
      if (data.data.gameOver !== 0) {
        game.dialogNode.children[20].active = false
        game.quiz.children[0].children[1].children[0].children[0].children[0].active = true
        game.quiz.children[0].children[1].children[0].children[0].children[1].active = false
        game.quiz.children[0].children[1].children[0].children[4].children[0].active = true
        game.quiz.children[0].children[1].children[0].children[4].children[1].active = false
        game.quizResult.children[0].children[0].getComponent('cc.Label').string = 0
        game.quizResult.children[1].children[0].getComponent('cc.Label').string = 0
        game.quiz.children[0].children[1].children[1].getComponent('cc.Label').string = '0:0'
        game.quiz.children[0].children[0].children[2].getComponent('cc.Label').string = '0U豆'
        game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '游戏开始可以进行押注'
        game.quiz.children[0].children[0].children[1].active = false
        game.quiz.children[0].children[0].children[2].active = false
      }
      if (data.data.gameOver == 0) {
        // 游戏未结束
        if (!data.data.list) {
          console.log('昨晚是平安夜')
          // 昨晚是平安夜
        } else {
          // let deathList = [];
          if (data.data.list.length != 0) {
            let num = 0
            data.data.list.forEach(function (value, index) {
              let order = value.seat - 1
              if (value.isdie > 0 && !_this.roomUserInfo[order].isdie) {
                let siteNode = game.siteArr[order]
                _this.roomUserInfo[order].isdie = value.isdie
                _this.deathNight = true
                if (value.seat == USER_SEAT) {
                  GAME_USERDIE = true
                }
                if (num == 0) {
                  // 第一个弹窗
                  num++
                  siteNode.getComponent('site').lastNightResult(_this.roomUserInfo[order])
                } else {
                  // 第二个弹窗
                  setTimeout(function () {
                    siteNode.getComponent('site').lastNightResult(_this.roomUserInfo[order])
                  }, 3000 * num)
                  num++
                }
              } else {
                _this.deathNight = false
              }
            })
          }
        }
      } else {
        _this.roomUserInfo.forEach(function (value, index, array) {
          if (value) {
            value.isdie = 0
          }
        })
        if (data.data.gameOver == 1) {
          // 好人胜利
          let role = _this.gameResult(data.data)
          _this.gameOver(game, node, data.data)
          // 好人胜利
          if (USER_ROLE == 1) {
            // 狼人失败
            game.dialogNode.children[9].active = true
            game.dialogNode.children[9].children[1].active = true
            game.dialogNode.children[9].children[2].active = false
            game.dialogNode.children[9].children[0].active = false
            game.dialogNode.children[9].children[3].active = false
            _this.gameResultRole(role.goodArr, 1, 1, game, socket)
            _this.gameResultRole(role.wolfArr, 1, 3, game, socket)
            _this.gameResultTime(game, data.data.gameOver)
            // _this.playMusic(1, game, 1);
            if (GAME_NATIVE && GAME_SOUND) {
              callNativeMethod({
                methodNameAndroid: 'appPlayVoice',
                methodNameIOS: 'appPlayVoice:',
                methodSignature: '(Ljava/lang/String;)V',
                parameters: ['loser']
              })
            }
          } else {
            // 好人胜利
            game.dialogNode.children[9].active = true
            game.dialogNode.children[9].children[2].active = true
            game.dialogNode.children[9].children[0].active = false
            game.dialogNode.children[9].children[1].active = false
            game.dialogNode.children[9].children[3].active = false
            _this.gameResultRole(role.goodArr, 2, 1, game, socket)
            _this.gameResultRole(role.wolfArr, 2, 3, game, socket)
            _this.gameResultTime(game, data.data.gameOver)
            // _this.playMusic(4, game, 1);
            if (GAME_NATIVE && GAME_SOUND) {
              callNativeMethod({
                methodNameAndroid: 'appPlayVoice',
                methodNameIOS: 'appPlayVoice:',
                methodSignature: '(Ljava/lang/String;)V',
                parameters: ['success']
              })
            }
          }
        } else if (data.data.gameOver == 2) {
          // 狼人胜利
          let role = _this.gameResult(data.data)
          _this.gameOver(game, node, data.data)
          // 狼人胜利
          if (USER_ROLE == 1) {
            // 狼人胜利
            game.dialogNode.children[9].active = true
            game.dialogNode.children[9].children[0].active = true
            game.dialogNode.children[9].children[1].active = false
            game.dialogNode.children[9].children[2].active = false
            game.dialogNode.children[9].children[3].active = false
            _this.gameResultRole(role.wolfArr, 0, 1, game, socket)
            _this.gameResultRole(role.goodArr, 0, 3, game, socket)
            _this.gameResultTime(game, data.data.gameOver)
            // _this.playMusic(4, game, 1);
            if (GAME_NATIVE && GAME_SOUND) {
              callNativeMethod({
                methodNameAndroid: 'appPlayVoice',
                methodNameIOS: 'appPlayVoice:',
                methodSignature: '(Ljava/lang/String;)V',
                parameters: ['success']
              })
            }
          } else {
            // 好人失败
            game.dialogNode.children[0].active = true
            game.dialogNode.children[9].active = true
            game.dialogNode.children[9].children[3].active = true
            game.dialogNode.children[9].children[0].active = false
            game.dialogNode.children[9].children[1].active = false
            game.dialogNode.children[9].children[2].active = false
            _this.gameResultRole(role.wolfArr, 3, 1, game, socket)
            _this.gameResultRole(role.goodArr, 3, 3, game, socket)
            _this.gameResultTime(game, data.data.gameOver)
            // _this.playMusic(1, game, 1);
            if (GAME_NATIVE && GAME_SOUND) {
              callNativeMethod({
                methodNameAndroid: 'appPlayVoice',
                methodNameIOS: 'appPlayVoice:',
                methodSignature: '(Ljava/lang/String;)V',
                parameters: ['loser']
              })
            }
          }
        }
        USER_ROLE = null
        GAME_START = false
        GAME_USERDIE = false
        USER_CONTROL_STATE = null
        GAME_ISNIGHT = false
        GAME_VOTE = false
        USER_WINTIMES = null
      }
    })

    socket.on('speak.speak_skip', function (data) {
      // 白天发言，谁能发言
      SPEAK_TYPE = 1
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appStopVoice',
          methodNameIOS: 'appStopVoice',
          methodSignature: '()V',
          parameters: []
        })
      }
      data.data.list.forEach(function (value, index, array) {
        if (value.seat != 0) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          value.changeTime = 60
          if (value.isSpeak) {
            siteNode.getComponent('site').speakSpeakSkip(value)
            if (value.seat == USER_SEAT) {
              node.voice.active = true
              node.turnSelfSpeak.active = true
              node.turnSelfSpeak.children[1].active = true

              if (GAME_USERDIE) {
                game.gameControl.children[6].active = false
              }
              // if(_this.userRoleInfo[order].role==1){
              //     node.turnSelfSpeak.children[2].active = true;
              // }
            } else {
              node.voice.active = false
              node.startSpeak.children[0].active = false
              node.startSpeak.children[1].active = false
              node.startSpeak.children[2].active = false
              node.turnSelfSpeak.active = false
              node.turnSelfSpeak.children[1].active = false
              // node.turnSelfSpeak.children[2].active = false;
              if (GAME_USERDIE) {
                game.gameControl.children[6].active = true
              }
            }
          } else {
            siteNode.getComponent('site').speakSpeakSkipTurn(value)
            siteNode.getComponent('site').hideUserTalk(value)
          }
        }
      })
    })

    socket.on('speak.campaign_skip', function (data) {
      // 竞选警长发言
      SPEAK_TYPE = 2
      data.data.list.forEach(function (value, index, array) {
        let order = value.seat - 1,
          siteNode = game.siteArr[order]
        value.changeTime = 60
        if (value.isSpeak) {
          siteNode.getComponent('site').speakSpeakSkip(value)
          if (value.seat == USER_SEAT) {
            node.voice.active = true
            node.turnSelfSpeak.active = true
            node.turnSelfSpeak.children[1].active = true
          } else {
            if (node.voice.active) {
              node.voice.active = false
              node.startSpeak.children[0].active = false
              node.startSpeak.children[1].active = false
              node.startSpeak.children[2].active = false
              node.turnSelfSpeak.active = false
              node.turnSelfSpeak.children[1].active = false
            }
          }
        } else {
          siteNode.getComponent('site').speakSpeakSkipTurn(value)
          siteNode.getComponent('site').hideUserTalk(value)
        }
      })
    })

    socket.on('speak.diespeak_skip', function (data) {
      // 遗言
      SPEAK_TYPE = 3
      data.data.list.forEach(function (value, index, array) {
        if (value.seat != 0) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          value.changeTime = 60
          if (value.isSpeak) {
            siteNode.getComponent('site').speakSpeakSkip(value)
            if (value.seat == USER_SEAT) {
              node.voice.active = true
              node.turnSelfSpeak.active = true
              node.turnSelfSpeak.children[1].active = true
              game.gameControl.children[6].active = false
            } else {
              if (node.voice.active) {
                siteNode.getComponent('site').hideUserTalk(value)
                node.voice.active = false
                node.startSpeak.children[0].active = false
                node.startSpeak.children[1].active = false
                node.startSpeak.children[2].active = false
                node.turnSelfSpeak.active = false
                node.turnSelfSpeak.children[1].active = false
                game.gameControl.children[6].active = true
              }
            }
          } else {
            siteNode.getComponent('site').speakSpeakSkipTurn(value)
          }
        }
      })
    })

    socket.on('speak.speak_over', function (data) {
      // 发言结束
      if (SPEAK_TYPE == 2) {
        node.giveUp.active = false
      }
      SPEAK_TYPE = null
      for (let i = 0; i < 12; i++) {
        let siteNode = game.siteArr[i]
        siteNode.getComponent('site').hideUserTalk(data.data)
        node.turnSelfSpeak.active = false
        node.turnSelfSpeak.children[1].active = false
        node.voice.active = false
        node.startSpeak.children[0].active = false
        node.startSpeak.children[1].active = false
        node.startSpeak.children[2].active = false
        if (GAME_USERDIE) {
          game.gameControl.children[6].active = true
        }
      }
      _this.roomUserInfo.forEach(function (value, index, array) {
        if (value) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          siteNode.getComponent('site').speakSpeakSkipTurn({})
        }
      })
    })

    socket.on('todayPoll', function (data) {
      // 给当前客户端发白天票人阶段投了谁

    })

    socket.on('vote.startGameDay', function (data) {
      // 开始竞选警长
      if (!USER_ONTREE) {
        game.dialogNode.children[0].active = true
        game.dialogNode.children[10].active = true
        let labelNode = game.dialogNode.children[10].children[1].children[0],
          label = labelNode.getComponent(cc.Label),
          time = 10
        label.string = '取消(' + time + 's)'
        label.unscheduleAllCallbacks()
        label.callback = function () {
          time--
          label.string = '取消(' + time + 's)'
          if (time <= 0) {
            game.dialogNode.children[0].active = false
            game.dialogNode.children[10].active = false
            label.unschedule(label.callback)
          }
        }
        label.schedule(label.callback, 1)
      }
    })

    socket.on('room.campaign', function (data) {
      // 竞选警长反馈

    })

    socket.on('room.newCampaign', function (data) {
      // 竞选警长反馈
      game.dialogNode.children[0].active = false
      game.dialogNode.children[10].active = false
      if (data.data) {
        if (data.data.length != 0) {
          data.data.forEach(function (value, index, array) {
            let order = value - 1,
              siteNode = game.siteArr[order]
            siteNode.getComponent('site').roomCampaign(value)
          })
        }
      }
    })

    // socket.on('vote.decisionCampaign', function(data) {
    //     //警长选举结果
    //     game.dialogNode.children[6].active = true;
    // })

    socket.on('room.pollSpeackorder', function (data) {
      // 警左警右发言
      game.dialogNode.children[0].active = true
      game.dialogNode.children[7].active = true
      let label = game.dialogNode.children[7].children[0].children[0].getComponent('cc.Label')
      if (_this.deathNight) {
        label.string = '死右(10s)'
        game.dialogNode.children[7].children[1].children[0].getComponent('cc.Label').string = '死左'
      } else {
        game.dialogNode.children[7].children[1].children[0].getComponent('cc.Label').string = '警左'
        label.string = '警右(10s)'
      }
      let time = 10
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        if (_this.deathNight) {
          label.string = '死右(' + time + 's)'
        } else {
          label.string = '警右(' + time + 's)'
        }
        if (time <= 0) {
          game.dialogNode.children[0].active = false
          game.dialogNode.children[7].active = false
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    })

    socket.on('room.userTalk', function (data) {
      // 有人说话了
      if (data.code == 200) {
        let order = data.data.seat - 1,
          siteNode = game.siteArr[order]
        siteNode.getComponent('site').roomUserTalk(data.data)
      }
    })

    socket.on('room.userDelTalk', function (data) {
      // 有人停止说话了
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      if (siteNode) {
        siteNode.getComponent('site').roomUserDelTalk(data.data)
      }
    })

    socket.on('room.kickGamer', function (data) {
      // 踢掉某人
      if (data.code != 200) {
        game.creatPopUp(data.msg)
      } else {
        if (data.data.seat) {
          let order = data.data.seat - 1,
            siteNode = game.siteArr[order]
          console.log(order)
          siteNode.getComponent('site').roomUserQuit(data.data)
        } else {
          util.quitGame(socket)
          // cc.game.end();
        }
      }
    })

    socket.on('room.timeUpdata', function (data) {
      // let order = USER_SEAT - 1;
      // let siteNode = game.siteArr[order];
      // data.changeTime = data.data.time;
      // siteNode.getComponent('site').speakSpeakSkip(data);
    })

    socket.on('standup', function (data) {
      // 站起
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').roomStandUp(_this.roomUserInfo[order])
      _this.roomUserInfo[order].isMain = 0
      _this.roomUserInfo[order].seat = 0
      if (GAME_UID == data.data.uid) {
        USER_ONTREE = true
        USER_SEAT = 0
        GAME_ROOMMAIN = false
      }
      // _this.treeList[order] = _this.roomUserInfo[order];
      _this.treeList.push(_this.roomUserInfo[order])
      _this.roomUserInfo[order] = null
      game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人'
    })

    socket.on('sitdown', function (data) {
      // 坐下
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order],
        index
      index = _this.isHasElementOne(_this.treeList, data.data.uid)
      if (index != -1) {
        _this.treeList[index].seat = data.data.seat
        if (GAME_UID == data.data.uid) {
          USER_ONTREE = false
          USER_SEAT = data.data.seat
        }
        _this.roomUserInfo[order] = _this.treeList[index]
        siteNode.getComponent('site').roomSitdown(_this.roomUserInfo[order])
        _this.treeList.splice(index, 1)
        // _this.treeList[index] = null;
        game.observe.children[0].children[0].getComponent(cc.Label).string = _this.treeList.length + '人'
      }
    })
    socket.on('room.pollWoflBoom', function (data) {
      // 狼人可自爆信息
      data.data.forEach(function (value, index, array) {
        let order = value.seat - 1,
          siteNode = game.siteArr[order]
        siteNode.getComponent('site').roomPollWoflBoom(value)
      })
    })
    socket.on('room.pollWoflEnd', function (data) {
      // 狼人自爆阶段结束
      if (data.data.length != 0) {
        data.data.forEach(function (value, index, array) {
          let order = value.seat - 1,
            siteNode = game.siteArr[order]
          siteNode.getComponent('site').roomPollWoflEnd(value)
        })
      }
    })
    socket.on('room.closeInfo', function (data) {
      // 断线
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').roomCloseInfo(data.data)
    })
    socket.on('vote.woflBoom', function (data) {
      // 狼人自爆成功
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      if (data.data.seat == USER_SEAT) {
        GAME_USERDIE = true
      }
      siteNode.getComponent('site').voteWoflBoom(data.data)
    })

    socket.on('room.reEnterInfo', function (data) {
      // 重连标志
      if (data.data.seat != 0) {
        let order = data.data.seat - 1,
          siteNode = game.siteArr[order]
        siteNode.getComponent('site').roomReEnterInfo(data.data)
      }
    })

    socket.on('groupMainStatus', function (data) {
      // 检查房主状态
      node.gulpMain.active = true
      node.gulpMain.children[0].children[0].getComponent('cc.Label').string = data.data.content
      let label = node.gulpMain.children[1].children[0].getComponent('cc.Label')
      label.string = '好的(30s)'
      let time = 30
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        label.string = '好的(' + time + ')'
        if (time <= 0) {
          node.gulpMain.active = false
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    })

    socket.on('groupMain.delgroupMain', function (data) {
      // 房主挂机被踢出
      util.quitGame(socket)
    })

    socket.on('groupMain.delResponse', function (data) {
      // 请重新登录
      if (data.code == 222) {
        util.quitGame(socket)
      }
    })

    socket.on('room.dumpSkipFail', function (data) {
      // 过麦失败
      game.creatPopUp(data.msg)
    })

    socket.on('room.speakFail', function (data) {
      // 上麦失败
      if (_this.speakFailTimes <= 3) {
        setTimeout(function () {
          socket.emit('room.speak', {
            type: SPEAK_TYPE
          })
        }, 2000)
        _this.speakFailTimes++
      } else {
        _this.speakFailTimes = 0
      }
    })

    socket.on('room.dumpSkipSuccess', function (data) {
      // 过麦
      if (data.data.seat != 0) {
        let order = data.data.seat - 1,
          siteNode = game.siteArr[order]
        if (data.data.seat == USER_SEAT) {
          node.voice.active = false
          node.startSpeak.children[0].active = false
          node.startSpeak.children[1].active = false
          node.startSpeak.children[2].active = false
          node.dumpSkip.active = false
          siteNode.getComponent('site').speakSpeakSkipTurn(data.data)
          siteNode.getComponent('site').hideUserTalk()
        }
      }
    })

    socket.on('vote.userWintimes', function (data) {
      // 连胜次数
      USER_WINTIMES = data.data
    })

    socket.on('vote.handleMvp', function (data) {
      // MVP获得者
      for (let i = 0; i < 12; i++) {
        let siteNode = game.siteArr[i]
        if (USER_SEAT == i + 1) {
          siteNode.getComponent('site').voteHandleMvp(data)
        }
      }
    })

    socket.on('room.protect', function (data) {
      // 首刀保护
      let order = data.data.seat - 1,
        siteNode = game.siteArr[order]
      if (data.data.seat != 0 && !USER_ONTREE) {
        data.data.avatar = _this.roomUserInfo[order].avatar
        siteNode.getComponent('site').roomProtect(data.data)
      }
    })

    socket.on('ping_value', function (data) {
      // PING值变化
      let order = data.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site').pingValue(data)
    })

    socket.on('room.userGuessChange', function (data) {
      // 押注数量变化
      let wolfNum = data.data.wolfNum
      let manNum = data.data.manNum
      game.quizResult.children[0].children[0].getComponent('cc.Label').string = wolfNum
      game.quizResult.children[1].children[0].getComponent('cc.Label').string = manNum
      game.quiz.children[0].children[1].children[1].getComponent('cc.Label').string = manNum + ':' + wolfNum
    })

    socket.on('room.getGuess', function (data) {
      // 游戏结束后的竞猜结果  初始化竞猜
      game.quiz.children[0].children[1].children[0].children[0].children[0].active = true
      game.quiz.children[0].children[1].children[0].children[0].children[1].active = false
      game.quiz.children[0].children[1].children[0].children[4].children[0].active = true
      game.quiz.children[0].children[1].children[0].children[4].children[1].active = false
      game.quizResult.children[0].children[0].getComponent('cc.Label').string = 0
      game.quizResult.children[1].children[0].getComponent('cc.Label').string = 0
      game.quiz.children[0].children[1].children[1].getComponent('cc.Label').string = '0:0'
      game.quiz.children[0].children[0].children[2].getComponent('cc.Label').string = '0U豆'
      game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '游戏开始可以进行押注'
      game.quiz.children[0].children[0].children[1].active = false
      game.quiz.children[0].children[0].children[2].active = false
      if (data.data.isWin == 1) {
        // 竞猜胜利
        game.dialogNode.children[19].active = true
        game.dialogNode.children[19].children[3].getComponent('cc.Label').string = '押注数量:' + data.data.putNum + 'U豆'
        game.dialogNode.children[19].children[2].children[1].getComponent('cc.Label').string = data.data.getNum
        game.dialogNode.children[0].active = true
        if (data.data.winType == 0) {
          game.dialogNode.children[19].children[0].children[0].active = true
          game.dialogNode.children[19].children[0].children[1].active = false
        } else {
          game.dialogNode.children[19].children[0].children[1].active = true
          game.dialogNode.children[19].children[0].children[0].active = false
        }
      } else {
        // 竞猜失败
        game.dialogNode.children[18].active = true
        game.dialogNode.children[18].children[3].getComponent('cc.Label').string = '押注数量:' + data.data.putNum + 'U豆'
        game.dialogNode.children[0].active = true
        if (data.data.winType == 0) {
          game.dialogNode.children[18].children[0].children[1].active = true
          game.dialogNode.children[18].children[0].children[0].active = false
        } else {
          game.dialogNode.children[18].children[0].children[0].active = true
          game.dialogNode.children[18].children[0].children[1].active = false
        }
      }
    })

    socket.on('room.userPutGuess', function (data) {
      // 下注后返回
      if (data.code == 200) {
        // 下注成功
        game.dialogNode.children[20].active = false
        USER_QUIZ = true
        USER_QUIZNUM = data.data.num
        game.quiz.children[0].children[0].children[1].active = true
        game.quiz.children[0].children[0].children[2].active = true
        game.quiz.children[0].children[0].children[2].getComponent('cc.Label').string = data.data.num + 'U豆'
        game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '已押注'
        if (data.data.winType == 0) {
          // 押注狼人
          game.quiz.children[0].children[1].children[0].children[0].children[1].active = false
          game.quiz.children[0].children[1].children[0].children[0].children[0].active = true
          game.quiz.children[0].children[0].children[1].children[0].getComponent('cc.Label').string = '狼人赢'
        } else {
          // 押注神民
          game.quiz.children[0].children[1].children[0].children[4].children[1].active = false
          game.quiz.children[0].children[1].children[0].children[4].children[0].active = true
          game.quiz.children[0].children[0].children[1].children[0].getComponent('cc.Label').string = '神民赢'
        }
      } else {
        // 下注失败
        game.creatPopUp(data.msg)
      }
    })

    socket.on('room.notPutGuess', function (data) {
      // 不能下注 按钮变为不可点击状态
      game.dialogNode.children[20].active = false
      game.quiz.children[0].children[1].children[0].children[0].children[0].active = true
      game.quiz.children[0].children[1].children[0].children[0].children[1].active = false
      game.quiz.children[0].children[1].children[0].children[4].children[0].active = true
      game.quiz.children[0].children[1].children[0].children[4].children[1].active = false
    })

    socket.on('vote.campaignRespeak', function (data) {
      // 平票
      let pp = cc.find('pingpiao', game.dialogNode)
      pp.active = true
      game.dialogNode.children[0].active = true
      pp.children[0].getComponent('cc.Label').string = data.msg
      let time = 3
      let label = pp.children[1].children[0].getComponent('cc.Label')
      label.string = '确定(3s)'
      label.unscheduleAllCallbacks()
      label.callback = function () {
        time--
        label.string = '确定(' + time + 's)'
        if (time <= 0) {
          game.dialogNode.children[0].active = false
          pp.active = false
          label.unschedule(label.callback)
        }
      }
      label.schedule(label.callback, 1)
    })
  },
  reConnect: function (game, pageNode) {
    this.init(game, pageNode)
  },
  enterRoom: function (data, game, node) {
    let _this = this
    if (data.code == 200) {
      if (data.data.list) {
        data.data.list.forEach(function (value, index, array) {
          let order = value.seat - 1
          let siteNode = game.siteArr[order]
          if (order >= 0) {
            // 座位上的人
            if (value.uid == GAME_UID) {
              USER_ONTREE = false
            }
            let uIndex = util.findProperty(_this.roomUserInfo, 'uid', value.uid)
            let treeIndex = util.findProperty(_this.treeList, 'uid', value.uid)
            _this.roomUserInfo[order] = value
            siteNode.getComponent('site').userSite(value, data.data.isStart)
            if (value.isMain > 0) {
              if (value.seat == USER_SEAT) {
                GAME_ROOMMAIN = true
              }
              siteNode.getComponent('site').roomMainQuit()
            }
            if (treeIndex != -1) {
              let content = node.standUp.parent.parent
              for (let i = 1; i < content.children.length; i++) {
                if (content.children[i].uid == value.uid) {
                  _this.treeList.splice(treeIndex, 1)
                  content.children[i].destroy()
                }
              }
              game.observe.children[0].children[0].getComponent('cc.Label').string = _this.treeList.length + '人'
            }
          } else {
            // 树上的人
            let tIndex = util.findProperty(_this.treeList, 'uid', value.uid)
            if (value.uid == GAME_UID) {
              USER_ONTREE = true
              if (data.data.isStart == 1) {
                game.quizResult.active = true
                game.quiz.children[0].children[1].children[0].children[0].children[0].active = false
                game.quiz.children[0].children[1].children[0].children[0].children[1].active = true
                game.quiz.children[0].children[1].children[0].children[4].children[0].active = false
                game.quiz.children[0].children[1].children[0].children[4].children[1].active = true
                game.dialogNode.children[0].active = true
                game.dialogNode.children[22].active = true
                game.quiz.children[0].children[0].children[0].getComponent('cc.Label').string = '未押注'
              }
            }
            if (tIndex == -1) {
              _this.treeList.push(value)
              if (value.uid == GAME_UID) {
                _this.onTreeSelf(node, value, game)
              } else {
                let ava = cc.instantiate(game.avatar)
                if (value.avatar) {
                  util.loadImage(value.avatar, ava.children[0].children[0], null)
                }
                ava.uid = value.uid
                node.standUp.parent.parent.addChild(ava)
              }
              game.observe.children[0].children[0].getComponent('cc.Label').string = _this.treeList.length + '人'
            }
            // if (tIndex != -1) {
            //     _this.treeList.push(value);
            //     if (value.uid == GAME_UID) {
            //         _this.onTreeSelf(node, value);
            //         USER_ONTREE = true;
            //     } else {
            //         let ava = cc.instantiate(game.avatar);
            //         if (value.avatar) {
            //             // cc.loader.load({
            //             //     url: value.avatar,
            //             //     type: 'jpg'
            //             // }, function(err, texture) {
            //             //     let sp = new cc.SpriteFrame(texture),
            //             //         sprite = ava.children[0].children[0].getComponent(cc.Sprite),
            //             //         w = sprite.node.width,
            //             //         h = sprite.node.height;
            //             //     sprite.spriteFrame = sp;
            //             //     sprite.node.width = w;
            //             //     sprite.node.height = h;
            //             // });
            //             util.loadImage(value.avatar, ava.children[0].children[0], null);
            //         }
            //         ava.uid = value.uid;
            //         node.standUp.parent.parent.addChild(ava);
            //     }
            // }
          }
        })
      }
      // if (!_this.roomInfo.roomId) {
      // _this.roomInfo.roomId = data.data.roomId;
      // node.roomId.getComponent(cc.Label).string = data.data.roomId + ' 房间';
      // }
    } else {
      game.creatPopUp(data.msg)
      setTimeout(function () {
        util.quitGame(_this.socket)
      }, 2000)
    }
    // if (_this.roomInfo.isMain) {
    //     node.startGame.active = true;
    // } else {
    //     node.cancle.active = true;
    // }
  },
  roleControl: function (data, game, fn) {
    data.data.forEach(function (value, index, array) {
      let order = value.seat - 1,
        siteNode = game.siteArr[order]
      siteNode.getComponent('site')[fn](value)
    })
  },
  getPassword: function (callback) {
    http.post({
      url: HTTPURL + '/wolf100/room/getPwd',
      data: {
        roomId: GAME_ROOMID
      },
      header: {
        sign: GAME_INPUT
      },
      success: function (data) {
        data = JSON.parse(data)
        if (data.code == 200) {
          if (typeof callback === 'function') {
            callback(data.data.pwd)
          }
        } else {
          // game.creatPopUp(data.msg);
        }
      }
    })
  },
  gameResult: function (data) {
    let _this = this
    let newArr = data.list
    let role = {
      wolfArr: [],
      goodArr: []
    }
    newArr.forEach(function (value, index, array) {
      let order = value.seat - 1
      if (_this.roomUserInfo[order]) {
        if (_this.roomUserInfo[order].avatar) {
          newArr[index].avatar = _this.roomUserInfo[order].avatar
        }
      }
      if (newArr[index].role == 1) {
        role.wolfArr.push(newArr[index])
      } else {
        role.goodArr.push(newArr[index])
      }
    })
    return role
  },
  gameResultRole: function (node, index, pos, game, socket) {
    node.forEach(function (v, i) {
      let order = v.role - 1
      game.dialogNode.children[9].children[index].on('touchstart', function (e) {
        e.stopPropagation()
      })
      if (pos == 1) {
        if (!USER_ONTREE) {
          game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[4].active = true
        } else {
          game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[4].active = false
        }
        // 显示点赞按钮
        game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[4].children[0].active = true
        game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[4].children[1].active = false
        // 座位号
        game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[3].children[1].getComponent('cc.Label').string = v.seat
        // 投票竞选MVP
        game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].on('touchstart', function () {
          // 点赞选MVP
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[4].children[0].active = false
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[4].children[1].active = true
          let pollSeat = game.dialogNode.children[9].children[index].children[0].children[1].children[1].children[i].children[3].children[1].getComponent('cc.Label').string
          http.post({
            url: HTTPURL + '/wolf100/poll/poll',
            data: {
              type: 25,
              seat: pollSeat
            },
            header: {
              sign: GAME_INPUT
            },
            success: function (data) {
              data = JSON.parse(data)
              if (data.code == 200) {

              } else {
                // game.creatPopUp(data.msg);
              }
            }
          })
        })
      }
      // 连胜显示
      if (USER_WINTIMES) {
        game.dialogNode.children[9].children[index].children[0].children[0].active = true
        game.dialogNode.children[9].children[index].children[0].children[0].children[0].children[0].getComponent('cc.Label').string = USER_WINTIMES
      } else {
        game.dialogNode.children[9].children[index].children[0].children[0].active = false
      }
      // 初始化角色
      game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[2].children.forEach(function (val, index) {
        val.active = false
      })
      // 初始化座位背景
      game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[3].children[0].children.forEach(function (val, index) {
        val.active = false
      })
      // 显示几个人
      game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].active = true
      // 座位背景
      game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[3].children[0].children[order].active = true
      // 角色
      game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[2].children[order].active = true

      // 头像
      if (v.avatar) {
        util.loadImage(v.avatar, game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[0].children[1].children[0].children[0], null)
      }

      // 自己
      if (v.seat == USER_SEAT) {
        game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[0].children[0].children[1].active = true
      }

      // 死亡标志
      if (v.isdie > 0 && v.role != 6) {
        game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].active = true
        if (v.isdie == 1 || v.isdie == 4) {
          // 被刀死亡或者被票死
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[0].active = true
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[1].active = false
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[2].active = false
        } else if (v.isdie == 2) {
          // 被猎人射杀
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[1].active = true
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[0].active = false
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[2].active = false
        } else if (v.isdie == 10) {
          // 自爆死亡
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[2].active = true
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[0].active = false
          game.dialogNode.children[9].children[index].children[0].children[pos].children[1].children[i].children[1].children[1].active = false
        }
      }
    })
  },
  gameResultTime: function (game, type) {
    let label = game.dialogNode.children[9].children[4].children[0].getComponent('cc.Label')
    game.dialogNode.children[9].children[4].on('touchstart', function () {
      game.dialogNode.children[0].active = false
      game.dialogNode.children[9].active = false
    })
    label.string = '确定(5s)'
    let time = 5
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      label.string = '确定(' + time + ')'
      if (time <= 0) {
        game.dialogNode.children[0].active = false
        game.dialogNode.children[9].active = false
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
  },
  gameOver: function (game, node, data) {
    let _this = this
    game.dialogNode.children[9].children[0].active = false
    game.dialogNode.children[9].children[1].active = false
    game.dialogNode.children[9].children[2].active = false
    game.dialogNode.children[9].children[3].active = false
    game.gameControl.children[3].active = false
    game.gameControl.children[4].active = true
    game.gameControl.children[0].active = true
    if (GAME_ROOMMAIN) {
      node.startGame.active = true
    } else {
      node.readyGame.active = true
    }
    data.list.forEach(function (v, i) {
      let order = v.seat - 1
      let siteNode = game.siteArr[order]
      siteNode.getComponent('site').gameOut(v)
    })
  },
  roleControlCountTime: function (game, node, str, time, isShow, fnName) {
    let control = game.gameControl.children[2],
      label = control.children[0].children[0].getComponent(cc.Label)
    if (isShow) {
      control.active = true
      label.string = str + '(' + time + 'S)'
    } else {
      control.active = false
    }
    label.unscheduleAllCallbacks()
    label.callback = function () {
      time--
      if (isShow) {
        label.string = str + '(' + time + 'S)'
      }
      if (time <= 0) {
        control.active = false
        game.readyGo[fnName](game.webSocket, game, node)
        label.unschedule(label.callback)
      }
    }
    label.schedule(label.callback, 1)
  },
  // playMusic: function(num, game, volume) {
  //     cc.audioEngine.play(game.audio[num], false, volume);

  // },
  isHasElementOne: function (arr, value) {
    for (let i = 0, vlen = arr.length; i < vlen; i++) {
      if (arr[i]) {
        if (arr[i].uid == value) {
          return i
        }
      }
    }
    return -1
  },
  hideUserTalkStart: function (siteNode, seat) {
    if (seat > 0 && seat < 7) {
      siteNode.userTalkLeft.children[1].active = false
      siteNode.userTalkLeft.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
    } else {
      siteNode.userTalkRight.children[1].active = false
      siteNode.userTalkRight.children[1].children[0].getComponent('cc.Animation').stop('speak_start')
    }
  },
  onTreeSelf: function (node, value, game) {
    USER_ONTREE = true
    node.standUp.active = false
    node.standUp.parent.children[0].active = true
    node.voice.active = false
    node.startSpeak.children[0].active = false
    node.startSpeak.children[1].active = false
    node.startSpeak.children[2].active = false
    node.startGame.active = false
    node.readyGame.active = false
    node.cancle.active = false
    if (value.avatar) {
      // cc.loader.load({
      //     url: value.avatar,
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
      util.loadImage(value.avatar, node.standUp.parent.children[0].children[0].children[0], null)
    }
    game.observe.children[0].children[0].getComponent('cc.Label').string = this.treeList.length + '人'

    // 如果自己在树上
    game.readyGo.require = true
    game.readyGo.observeChange(game, 1)
  }
}

module.exports = webSocket
