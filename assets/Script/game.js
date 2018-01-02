const webSocket = require('./module/connectsocket')
const readyGo = require('./module/readygo')
// const quiz = require('./module/quiz')
const pageNode = require('./module/getPageNode')
const util = require('./util/util')
const msgCtrl = require('./module/msgCtrl')

cc.Class({
  extends: cc.Component,

  properties: {
    siteLeft: {
      default: null,
      type: cc.Node
    },
    siteRight: {
      default: null,
      type: cc.Node
    },
    site12Prefab: {
      default: null,
      type: cc.Prefab
    },
    siteLength: 12,
    chatContent: {
      default: null,
      type: cc.Node
    },
    messageLeft: {
      default: null,
      type: cc.Prefab
    },
    messageRight: {
      default: null,
      type: cc.Prefab
    },
    messageTips: {
      default: null,
      type: cc.Prefab
    },
    popUpParent: {
      default: null,
      type: cc.Node
    },
    popUpPrefab: {
      default: null,
      type: cc.Prefab
    },
    gameReady: {
      default: [],
      type: cc.Node
    },
    gameControl: {
      default: null,
      type: cc.Node
    },
    gameTop: {
      default: null,
      type: cc.Node
    },
    dialogNode: {
      default: null,
      type: cc.Node
    },
    siteArr: [],
    webSocket: null,
    readyGo: null,
    audio: {
      url: cc.AudioClip,
      default: []
    },
    kickUserSeat: null,
    observe: {
      default: null,
      type: cc.Node
    },
    avatar: {
      default: null,
      type: cc.Prefab
    },
    barrageTop: {
      default: null,
      type: cc.Prefab
    },
    barrageDown: {
      default: null,
      type: cc.Prefab
    },
    input: {
      default: null,
      type: cc.Node
    },
    policeIcon: {
      default: null,
      type: cc.Node
    },
    voteResult: {
      default: null,
      type: cc.Prefab
    },
    votePerson: {
      default: null,
      type: cc.Prefab
    },
    voteGiveUp: {
      default: null,
      type: cc.Prefab
    },
    voteItem: {
      default: null,
      type: cc.Prefab
    },
    quizResult: {
      default: null,
      type: cc.Node
    },
    godSp: null,
    barrage: [],
    detectionTime: 0, // 检测断网间隔
    msgQueue: [], // 消息数组
    newVersion: 0, // 当前与客户端交互版本
    quiz: {
      default: null,
      type: cc.Node
    },
    mvpResult: {
      default: null,
      type: cc.Prefab
    },
    selfSpeak: {
      default: null,
      type: cc.Node
    },
    netease: true, // 聊天室是否连接上
    barrageBox: {
      default: null,
      type: cc.Node
    }
  },
  // use this for initialization
  onLoad: function () {
    cc.game.setFrameRate(30)
    // cc.view.enableAntiAlias(false);
    cc.view.enableRetina(true)
    cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0
    if (COMMONOBJ) {
      COMMONOBJ.appLog('我进入了cococs')
      console.log('我进入了cocos')
      GAME_INAPP = true
      this.gameReady[0].active = false
    }
    if (cc.sys.OS_ANDROID == cc.sys.os || cc.sys.OS_IOS == cc.sys.os) {
      let className = callNativeMethod({
        methodNameAndroid: 'appGetNativeJsPath',
        methodNameIOS: 'appGetNativeJsPath',
        methodSignature: '()Ljava/lang/String;',
        parameters: []
      })
      if (className) {
        CLASSNAME = className
        GAME_NATIVE = true
        this.gameReady[0].active = false

        callNativeMethod({
          methodNameAndroid: 'appLog',
          methodNameIOS: 'appLog:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: ['cocos onLoad了']
        })

        callNativeMethod({
          methodNameAndroid: 'appLoadFinish',
          methodNameIOS: 'appLoadFinish',
          methodSignature: '()V',
          parameters: []
        })
      }
    }
    // this.siteInit();
    // pageNode.init(this);
    // msgCtrl.init(this,671,30);
    // webSocket.init(this, pageNode,msgCtrl);
    // this.webSocket = webSocket;
    // readyGo.init(this, webSocket, pageNode);
    // this.readyGo = readyGo;
    GAME_MODULE.game = this
    if (GAME_INAPP) {
      COMMONOBJ.appLog('我要调用appEnterGame方法了')
      console.log('调用appEnterGame方法')
      let str = COMMONOBJ.appEnterGame()
      console.log(str)
      this.initUserData(COMMONOBJ.appEnterGame())
    }
    if (GAME_NATIVE) {
      let data = callNativeMethod({
        methodNameAndroid: 'appEnterGame',
        methodNameIOS: 'appEnterGame',
        methodSignature: '()Ljava/lang/String;',
        parameters: []
      })
      LONGLEAVE = 1
      this.initUserData(data)
    }
    let that = this
    setTimeout(function () {
      that.netease = false
    }, 5000)
  },
  start: function () {
    this.siteInit()
    pageNode.init(this)
    msgCtrl.init(this, 630, 30)
    webSocket.init(this, pageNode, msgCtrl)
    this.webSocket = webSocket
    readyGo.init(this, webSocket, pageNode)
    this.readyGo = readyGo
    let label = pageNode.node.roomId.getComponent(cc.Label)
    label.string = GAME_ROOMID
    if (GAME_NATIVE) {
      readyGo.getShortRoomId(pageNode)
    }
    // quiz.roomPollPolice(webSocket.socket);
    // quiz.speakSpeakSkip1(webSocket.socket);
    // quiz.campaignRespeak(webSocket.socket)
    // GAME_UID = 298194;
    // GAME_USERDIE = true;
    // webSocket.roomUserInfo[4] = {isdie: 0, uid: 298194, seat: 1};
    // let obj0 = {
    //     "fnName": "game_addChatMessage",
    //     "uid": "298194",
    //     "msg": "海陆空",
    //     "uidArr": [
    //         "-1"
    //     ],
    //     "type": "0",
    //     "avatar": "http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w.jpg",
    //     "nickName": "closur"
    // }
    // jsCommonFn(JSON.stringify(obj0));
  },
  siteInit: function () {
    for (let i = 0; i < this.siteLength; i++) {
      let site = cc.instantiate(this.site12Prefab),
        node, pos
      if (i < this.siteLength / 2) {
        node = this.siteLeft
        pos = 0
      } else {
        node = this.siteRight
        pos = 1
      }
      node.addChild(site)
      site.getComponent('site').init({
        order: i + 1,
        pos: pos,
        game: this
      })
      this.siteArr.push(site)
    }
  },
  addChatMessage: function (obj) {
    if (obj.type === '0' && obj.uid.indexOf('game') !== -1) {
      obj.type = 2
    }
    this.msgQueue.push(obj)
    // msgCtrl.showMsg(this, obj, webSocket.treeList, webSocket.roomUserInfo, -1)
  },
  sendQueueMessage: function () {
    if (webSocket.enterFinish && this.msgQueue.length > 0) {
      msgCtrl.showMsg(this, this.msgQueue.shift(), webSocket.treeList, webSocket.roomUserInfo, -1)
    }
  },
  creatPopUp: function (str) {
    let popUp = cc.instantiate(this.popUpPrefab)
    this.popUpParent.addChild(popUp)
    popUp.getComponent('popup').init({
      text: str
    })
  },
  initUserData: function (obj) {
    obj = JSON.parse(obj)
    console.log(obj)
    GAME_UID = obj.uid
    GAME_SIGN = obj.sign
    GAME_INPUT = obj.input
    GAME_ROOMID = obj.roomId
    if (obj.newVersion) {
      this.newVersion = obj.newVersion
    }
    // let label = pageNode.node.roomId.getComponent(cc.Label);
    // label.string = GAME_ROOMID;
  },
  gameBarrageTop: function (data) {
    this.addBarrage(this.barrageTop, 0, data)
  },
  gameBarrageDown: function (data) {
    this.addBarrage(this.barrageDown, 1, data)
  },
  addBarrage: function (obj, index, data) {
    let barrage = cc.instantiate(obj)
    barrage.getComponent('barrage').initY = barrage.getComponent('barrage').initY - SCROLL_HEIGHT
    this.barrageBox.addChild(barrage)
    barrage.getComponent('barrage').init(this, data)

    // let barrageBox = cc.find('Canvas/barrageBox');
    // barrageBox.children[index].addChild(barrage);
    // barrage.children[0].getComponent('cc.Label').string = data.title;
    // barrage.children[1].getComponent('cc.Label').string = data.content;
    // let animState = barrage.getComponent('cc.Animation');
    // animState.play('barrage');
    // animState.on('finished', function() {
    //     barrage.destroy();
    // })
  },
  refreshView: function () {
    let _this = this
    webSocket.roomUserInfo.forEach(function (value, index) {
      if (value) {
        let order = value.seat - 1,
          siteNode = _this.siteArr[order]
        siteNode.getComponent('site').roomUserQuit(value)
      }
    })

    webSocket.treeList.forEach(function (value, index) {
      if (value) {
        for (let i = 1; i < content.children.length; i++) {
          let content = pageNode.node.standUp.parent.parent
          if (content.children[i].uid == data.data.uid) {
            content.children[i].destroy()
            break
          }
        }
      }
    })

    webSocket.roomInfo = {}
    webSocket.roomUserInfo = []
    webSocket.userRoleInfo = {}
    webSocket.reconnection = false
    webSocket.changeTime = null
    webSocket.treeList = []

    msgCtrl.allMsg = []
    msgCtrl.displayMsg = []
    msgCtrl.autoScroll = true
    msgCtrl.nowOffset = 0
    msgCtrl.contentH = 0
    this.chatContent.removeAllChildren()
    this.chatContent.height = msgCtrl.height

    readyGo.speakRequire = false
    this.input.children[0].children[0].getComponent(cc.EditBox).string = ''
    let num = this.observe.width
    if (num > 166) {
      _this.observeChange(this, -1)
    }

    pageNode.node.exitGame.parent.active = false
    pageNode.node.exitGame.parent.parent.children[0].active = false

    if (GAME_NATIVE) {
      callNativeMethod({
        methodNameAndroid: 'appLoadFinish',
        methodNameIOS: 'appLoadFinish',
        methodSignature: '()V',
        parameters: []
      })
      let data = callNativeMethod({
        methodNameAndroid: 'appEnterGame',
        methodNameIOS: 'appEnterGame',
        methodSignature: '()Ljava/lang/String;',
        parameters: []
      })
      LONGLEAVE = 1
      this.initUserData(data)
    }
    GAME_SOCKET = false
    readyGo.getShortRoomId(pageNode)
  },
  personCanSpeak: function () {
    // 检测用户能否发言
    if (USER_ONTREE) {
      this.input.children[0].active = true
      this.input.children[1].active = true
      this.input.children[2].active = false
    } else {
      if (GAME_START) {
        // let isdie = this.personIsDie(GAME_UID);
        let index = util.findProperty(webSocket.roomUserInfo, 'uid', GAME_UID),
          isdie = false
        if (index != -1 && webSocket.roomUserInfo[index].isdie) {
          isdie = true
        }
        if (isdie) {
          this.input.children[0].active = true
          this.input.children[1].active = true
          this.input.children[2].active = false
        } else {
          if (GAME_ISNIGHT) {
            if (USER_ROLE == 1) {
              this.input.children[0].active = true
              this.input.children[1].active = true
              this.input.children[2].active = false
            } else {
              this.input.children[0].active = false
              this.input.children[2].active = true
              this.input.children[1].active = false
            }
          } else {
            if (GAME_VOTE) {
              this.input.children[0].active = false
              this.input.children[2].active = true
              this.input.children[1].active = false
            } else {
              this.input.children[0].active = true
              this.input.children[2].active = false
              this.input.children[1].active = true
            }
          }
        }
      } else {
        this.input.children[0].active = true
        this.input.children[2].active = false
        this.input.children[1].active = true
      }
    }
  },
  brokenNetwork: function (siteNode) {
    // 网络情况不好，暂时掉线
    this.input.children[0].active = false
    this.input.children[2].active = true
    this.input.children[1].active = false
    if (siteNode) {
      if (siteNode.userTalkLeft.children[0].active) {
        if (GAME_NATIVE) {
          callNativeMethod({
            methodNameAndroid: 'appUserStopSpeak',
            methodNameIOS: 'appUserStopSpeak',
            methodSignature: '()V',
            parameters: []
          })
        }
      }
    }
  },
  exitTheGame: function () {
    if (GAME_START) {
      if (USER_ONTREE) {
        this.dialogNode.children[4].children[2].getComponent('cc.Label').string = '确定要退出吗'
      } else {
        this.dialogNode.children[4].children[2].getComponent('cc.Label').string = '中途退出游戏将受到“裁决之刃”惩罚'
      }
    } else {
      this.dialogNode.children[4].children[2].getComponent('cc.Label').string = '确定要退出吗'
    }
  },
  // called every frame, uncomment this function to activate update callback
  update: function (dt) {
    if (!GAME_SOCKET && this.webSocket !== null) {
      // 发送消息
      this.sendQueueMessage()
      // 检测socket
      let socket = this.webSocket.socket
      let ws = socket.getWs()
      let siteNode = pageNode.siteNode[USER_SEAT]
      if (cc.sys.isObjectValid(ws) && ws) {
        // 检查对象有效
        let isConnect = socket.getConnect()
        if (ws.readyState && ws.readyState !== 1 && isConnect) {
          this.input.children[0].active = false
          this.input.children[2].active = true
          this.input.children[1].active = false
          this.brokenNetwork(siteNode)
          socket.reConnect()
        }
        if (ws.readyState && ws.readyState == 1) {
          if (this.detectionTime >= 6) {
            if (!socket.getActive()) {
              console.log('socket断开了')
              socket.close(null)
              this.brokenNetwork(siteNode)
              socket.reConnect()
            }
            webSocket.heartBeat = false
            this.detectionTime = 0
          }
          this.detectionTime += dt
        }
      } else {
        this.brokenNetwork(siteNode)
        socket.reConnect()
      }
    }
    this.personCanSpeak()
    this.exitTheGame()
  }
})
