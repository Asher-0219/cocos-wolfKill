const pageNode = {
  node: {},
  siteNode: [],
  init (game) {
    this.node.start = game.gameControl.children[0].children[0]
    this.node.ready = game.gameControl.children[0].children[2]
    this.node.roomId = cc.find('game_top_left/top_room_bac/top_room_text', game.gameTop) // 房间号
    this.node.cancle = game.gameControl.children[0].children[1] // 取消准备
    this.node.readyGame = game.gameControl.children[0].children[2] // 准备
    this.node.startGame = game.gameControl.children[0].children[0] // 开始游戏
    this.node.exitGame = game.dialogNode.children[4].children[0] // 退出确定按钮
    this.node.panicBuy = game.dialogNode.children[2] // 抢购身份dialog
    this.node.panicBuyTime = this.node.panicBuy.children[0].children[1] // 抢购倒计时
    this.node.voice = game.gameControl.children[4] // 语音按钮
    this.node.seat = cc.find('role_card/role_pos_bac/role_pos_text', game.gameControl) // 游戏位置
    this.node.gameTime = game.node.children[4].children[6] // 左上角游戏时间
    this.node.roleConfirm = game.dialogNode.children[3] // 身份确认
    this.node.roleConfirmTime = this.node.roleConfirm.children[1] // 身份确认时间
    this.node.gameChat = cc.find('Canvas/chat_bac') // 聊天区域
    this.node.gameCountTime = this.node.gameChat.children[3].children[0] // 游戏倒计时
    this.node.gameChatSign = this.node.gameChat.children[2].children[1] // 顶部提示
    this.node.policeLeft = game.dialogNode.children[7].children[1] // 警左发言
    this.node.policeRight = game.dialogNode.children[7].children[0] // 警左发言
    this.node.policeOrder = game.dialogNode.children[7] // 发言顺序弹框
    this.node.policeCampaign = game.dialogNode.children[10].children[2] // 竞选警长
    this.node.canclePoliceCampaign = game.dialogNode.children[10].children[1] // 取消竞选警长wa
    this.node.PoliceCampaignBox = game.dialogNode.children[10] // 竞选警长弹框
    this.node.roleControlConfirm = game.gameControl.children[2] // 角色操作是确定或放弃
    this.node.giveUp = game.gameControl.children[1].children[0] // 放弃竞选
    this.node.policeSuccess = game.dialogNode.children[6] // 竞选成功弹框
    this.node.escPoliceSuccess = game.dialogNode.children[6].children[2] // 竞选成功确定
    this.node.turnSelfSpeak = game.gameControl.children[1] // 轮到自己发言
    this.node.dumpSkip = game.gameControl.children[1].children[1] // 过麦
    this.node.seeRole = game.dialogNode.children[5].children[0] // 预言家查人弹窗确定按钮
    this.node.inviteFriend = game.gameControl.children[0].children[3] // 邀请好友
    this.node.userInfoDialog = game.dialogNode.children[12] // 个人信息弹窗
    this.node.deathInfo = game.dialogNode.children[14] // 死亡信息弹窗
    this.node.standUp = game.observe.children[1].children[0].children[0].children[0].children[0].children[1] // 站起
    this.node.wolfBoom = game.gameControl.children[5] // 自爆按钮
    this.node.sendMassage = game.input.children[1] // 发送消息按钮
    this.node.barrage = cc.find('Canvas/BarrageTop') // 弹幕
    this.node.roleCard = game.gameControl.children[3] // 角色卡片
    this.node.roleCardInfo = game.dialogNode.children[13] // 角色卡片信息
    this.node.policeIcon = game.policeIcon // 警徽icon
    this.node.inputFalse = game.input.children[2] // 禁止输入
    this.node.gulpMain = game.dialogNode.children[16] // 检查房主状态弹窗
    this.node.report = this.node.userInfoDialog.children[0].children[1] // 举报按钮
    this.node.setSound = game.dialogNode.children[8].children[0]
    this.node.startSpeak = game.gameControl.children[7] // 游戏中说话按钮
    this.node.mvp = game.dialogNode.children[17] // mvp弹框
    this.node.protect = game.dialogNode.children[23] // 首刀保护
  },
  getSiteNode (site, order) {
    if (!this.siteNode[order]) {
      this.siteNode[order] = {}
    }
    let node = this.siteNode[order]
    this.siteNode[order].siteBac = site.children[0] // 背景
    this.siteNode[order].nickname = cc.find('site_bac/sitelabel/nick_name', site) // 昵称
    this.siteNode[order].avatar = site.children[0].children[0].children[1].children[0].children[0] // 头像
    this.siteNode[order].ready = site.children[0].children[3] // 准备区域
    this.siteNode[order].readied = node.ready.children[0] // 准备icon
    this.siteNode[order].isMain = node.ready.children[1] // 房主icon
    this.siteNode[order].empty = node.siteBac.children[1] // 空状态
    this.siteNode[order].guess = node.siteBac.children[9].children[0] // 预判身份
    this.siteNode[order].guessLeft = cc.find('guess_left', node.siteBac) // 1-6
    this.siteNode[order].guessRight = cc.find('guess_right', node.siteBac) // 7-12
    this.siteNode[order].control = node.siteBac.children[4] // 角色操作
    this.siteNode[order].control1 = node.siteBac.children[6] // 狼人投票选项
    this.siteNode[order].control10 = node.siteBac.children[4].children[0].children[9] // 被猎人射杀标志
    this.siteNode[order].control2 = node.siteBac.children[4].children[0].children[8] // 预言家
    this.siteNode[order].control3 = node.siteBac.children[4].children[0].children[4] // 守卫
    this.siteNode[order].control4 = node.siteBac.children[4].children[0].children[3] // 女巫救人
    this.siteNode[order].control5 = node.siteBac.children[4].children[0].children[7] // 女巫毒人
    this.siteNode[order].control6 = node.siteBac.children[4].children[0].children[6] // 猎人
    this.siteNode[order].control7 = node.siteBac.children[4].children[0].children[10] // 投票警长
    this.siteNode[order].control8 = node.siteBac.children[4].children[0].children[1] // 投票死亡标志
    this.siteNode[order].control9 = node.siteBac.children[4].children[0].children[2] // 移交警徽
    this.siteNode[order].control11 = node.siteBac.children[4].children[0].children[11] // 白天投票
    this.siteNode[order].userRole = cc.find('user_role', node.siteBac) // 身份角色
    this.siteNode[order].campaign = node.siteBac.children[8] // 竞选
    this.siteNode[order].polickOn = node.siteBac.children[8].children[1] // 竞选警长标志
    this.siteNode[order].policekOut = node.siteBac.children[8].children[2] // 退选警长
    this.siteNode[order].policeIcon = node.siteBac.children[8].children[3] // 警长标志
    this.siteNode[order].policeAgain = node.siteBac.children[17] // 警长票数相同再次发言标志
    this.siteNode[order].wolfVote = node.siteBac.children[5] // 狼人投票反馈
    this.siteNode[order].speakTime = cc.find('count_time', node.siteBac) // 讲话倒计时
    this.siteNode[order].userTalkLeft = cc.find('speak_left', node.siteBac) // 左边讲话
    this.siteNode[order].userTalkRight = cc.find('speak_right', node.siteBac) // 右边讲话
    this.siteNode[order].sitDown = node.empty.children[1]
    this.siteNode[order].boomIcon = node.siteBac.children[4].children[0].children[14] // 自爆标志
    this.siteNode[order].leaveIcon = node.siteBac.children[4].children[0].children[0] // 离开标志
    this.siteNode[order].userPollLeft = cc.find('vote_left', node.siteBac) // 左边投票
    this.siteNode[order].userPollRight = cc.find('vote_right', node.siteBac) // 右边投票
    this.siteNode[order].ruleOrder = node.siteBac.children[10].children[0].children[0] // 座位位置
    this.siteNode[order].protect = node.siteBac.children[4].children[0].children[15] // 首刀保护
    this.siteNode[order].wifi = cc.find('wifi', node.siteBac) // 座位上的WIFI
  }
}

module.exports = pageNode
