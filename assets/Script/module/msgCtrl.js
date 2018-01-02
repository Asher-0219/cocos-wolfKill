const util = require('../util/util')

let msgCtrl = {
  msgLeftPoll: null,
  msgRightPoll: null,
  msgTipPoll: null,
  msgVotePoll: null,
  avatarPoll: null,
  height: 671,
  contentH: 0,
  allMsg: [],
  displayMsg: [],
  pollName: {
    message_left: 'msgLeftPoll',
    message_right: 'msgRightPoll',
    tips_msg_bac: 'msgTipPoll',
    vote_result: 'msgVotePoll',
    result_item: 'voteItemPoll',
    vote_result_bac: 'avatarPoll',
    result_giveUp: 'voteGiveUpPoll',
    mvp_result: 'mvpResultPoll'
  },
  autoScroll: true,
  space: 0,
  nowOffset: 0,
  isScrolling: false,
  i: 0,
  j: 0,
  init (game, height, space) {
    this.msgLeftPoll = new cc.NodePool()
    this.msgRightPoll = new cc.NodePool()
    this.msgTipPoll = new cc.NodePool()
    this.msgVotePoll = new cc.NodePool()
    this.avatarPoll = new cc.NodePool()
    this.voteItemPoll = new cc.NodePool()
    this.voteGiveUpPoll = new cc.NodePool()
    this.mvpResultPoll = new cc.NodePool()
    this.height = height
    this.space = space
    game.chatContent.parent.parent.on('scrolling', function (event) {
      if (game.chatContent.childrenCount > 0) {
        let scrollView = game.chatContent.parent.parent.getComponent(cc.ScrollView),
          offset = scrollView.getScrollOffset().y
        if (offset < 0) offset = 0
        if (offset > (game.chatContent.height - this.height)) {
          offset = game.chatContent.height - this.height
        }
        if (offset !== this.nowOffset) {
          this.isScrolling = true
          this.nowOffset = offset
          if ((offset + this.height * 1.5) < game.chatContent.height) {
            this.autoScroll = false
          } else {
            this.autoScroll = true
          }
          let offsetTop = -offset + this.height,
            offsetBottom = -offset - this.height * 2
          this.setBottomMsg(offsetBottom, game)
          this.setTopMsg(offsetTop, game)
        }
      }
    }, this)
  },
  setBottomMsg (offsetBottom, game, cb) {
    if (this.displayMsg.length > 0) {
      let index = this.displayMsg[this.displayMsg.length - 1],
        data = this.allMsg[index],
        chatIndex = util.findProperty(game.chatContent.children, 'y', data.y),
        height
      if (chatIndex != -1) {
        height = game.chatContent.children[chatIndex].height
        if ((data.y - height / 2 - 30) > offsetBottom && this.allMsg[index + 1]) {
          if (this.allMsg[index + 1]) {
            this.displayMsg.push(index + 1)
            this.creatVariousMsg(true, this.allMsg[index + 1].msg, game, game.webSocket.roomUserInfo, index + 1)
          }
        }
        if ((data.y + height / 2) < offsetBottom) {
          this.displayMsg.pop()
          let poll = this.pollName[game.chatContent.children[chatIndex].name]
          this.putPoll(poll, game.chatContent.children[chatIndex])

          if (!this.autoScroll && !this.isScrolling) {
            this.setBottomMsg(offsetBottom, game)
          }
        }
      }
    }
  },
  setTopMsg (offsetTop, game) {
    if (this.displayMsg.length > 0) {
      let index = this.displayMsg[0],
        data = this.allMsg[index],
        chatIndex = util.findProperty(game.chatContent.children, 'y', data.y),
        height
      if (chatIndex != -1) {
        height = game.chatContent.children[chatIndex].height
        if ((data.y + height / 2) < offsetTop && this.allMsg[index - 1]) {
          if (this.allMsg[index - 1]) {
            this.displayMsg.unshift(index - 1)
            this.creatVariousMsg(true, this.allMsg[index - 1].msg, game, game.webSocket.roomUserInfo, index - 1)
          }
        }
        if ((data.y - height / 2 - this.space) > offsetTop) {
          if (chatIndex != -1) {
            this.displayMsg.shift()
            let poll = this.pollName[game.chatContent.children[chatIndex].name]
            this.putPoll(poll, game.chatContent.children[chatIndex])
          }
          if (this.autoScroll) {
            this.setTopMsg(offsetTop, game)
          }
        }
      }
    }
  },
  showMsg (game, obj, treeList, roomUserInfo, index) {
    let canSee
    if (obj.newVersion && obj.newVersion == 'true') {
      canSee = this.newCanSee(obj)
    } else {
      canSee = this.canSee(obj, treeList, roomUserInfo)
    }
    if (parseInt(game.newVersion) === 0) {
      // 接收后判断是否显示
      canSee = this.canSee(obj, treeList, roomUserInfo)
    }
    if (game.newVersion >= 1) {
      // 接收前已确定是否显示
      canSee = this.newCanSee(obj, treeList, roomUserInfo)
    }
    // let canSee = this.canSee(obj, treeList, roomUserInfo);
    this.creatVariousMsg(canSee, obj, game, roomUserInfo, index)
  },
  newCanSee (obj, treeList, roomUserInfo) {
    let canSee = false
    if (!obj.uidArr) {
      // ios可能没有传递obj.uidArr
      canSee = this.canSee(obj, treeList, roomUserInfo)
      return canSee
    }

    if (parseInt(obj.type) === 0 && (obj.uidArr.length <= 0 || obj.uidArr[0] === '')) {
      // 老版本可能传过来一个空数组,还有可能传递只有''的字符串
      canSee = this.canSee(obj, treeList, roomUserInfo)
      return canSee
    }

    if (obj.uidArr && obj.uidArr.length > 0) {
      for (let i = 0; i < obj.uidArr.length; i++) {
        if (parseInt(obj.type) === 0) {
          // 用户发送的消息
          // if (obj.uidArr[i] == GAME_UID || obj.uidArr[i] == -2) {
          //   canSee = true
          //   break
          // }
          // if (obj.uidArr[i] == GAME_UID || obj.uidArr[i] == -1) {
          //   // 老版本发送的消息
          //   canSee = this.canSee(obj, treeList, roomUserInfo)
          //   break
          // }
          if (obj.uidArr[i] == GAME_UID) {
            canSee = true
            break
          } else {
            if (obj.uidArr[i] == -2) {
              canSee = true
              break
            }
            if (obj.uidArr[i] == -1) {
              // 老版本发送的消息
              canSee = this.canSee(obj, treeList, roomUserInfo)
              break
            }
          }
        } else {
          // 上帝发送的消息
          if (obj.uidArr[i] == GAME_UID || obj.uidArr[i] == -1) {
            canSee = true
            break
          }
        }
      }
    }
    return canSee
  },
  canSee (obj, treeList, roomUserInfo) {
    let canSee = false
    if (obj.type == 0) {
      let index = util.findProperty(roomUserInfo, 'uid', obj.uid)
      if (USER_ONTREE || GAME_USERDIE) {
        if (GAME_ISNIGHT) {
          if (index !== -1) {
            if (roomUserInfo[index].isdie && parseInt(roomUserInfo[index].isdie) > 0) {
              canSee = true
            }
          } else {
            canSee = true
          }
        } else {
          canSee = true
        }
      } else {
        // 在座位上活着的玩家
        if (GAME_START) {
          // 发消息的人是否活着或者在树上
          let livingOrTree = false
          if (index !== -1) {
            if (roomUserInfo[index].isdie && parseInt(roomUserInfo[index].isdie) > 0) {
              livingOrTree = true
            }
          } else {
            livingOrTree = true
          }
          if (GAME_ISNIGHT) {
            if (USER_ROLE == 1 && !livingOrTree) {
              canSee = true
            }
          } else {
            if (!livingOrTree) {
              canSee = true
            }
          }
          // if (!GAME_ISNIGHT) {
          //   if (!livingOrTree) {
          //     canSee = true
          //   }
          // } else {
          //   if (!livingOrTree) {
          //     canSee = true
          //   }
          //   let index = util.findProperty(roomUserInfo, 'uid', obj.uid)
          //   if (index != -1) {
          //     if (!roomUserInfo[index].isdie || (roomUserInfo[index].isdie && parseInt(roomUserInfo[index].isdie) == 0)) {
          //       if (GAME_ISNIGHT) {
          //         if (USER_ROLE == 1) {
          //           canSee = true
          //         }
          //       } else {
          //         canSee = true
          //       }
          //     }
          //   }
          // }
        } else {
          canSee = true
        }
      }
    } else {
      if (obj.uidArr && obj.uidArr.length > 0) {
        for (let i = 0, length = obj.uidArr.length; i < length; i++) {
          let uid = obj.uidArr[i]
          if (uid == GAME_UID || uid == -1) {
            canSee = true
            break
          }
        }
      }
    }
    return canSee
  },
  creatVariousMsg (canSee, obj, game, roomUserInfo, allMsgIndex) {
    if (canSee) {
      let message, tips, vote
      if (obj.type == 0) {
        if (allMsgIndex == -1) {
          let index = util.findProperty(roomUserInfo, 'uid', obj.uid)
          if (index != -1) {
            if (roomUserInfo[index].isdie && parseInt(roomUserInfo[index].isdie) > 0) {
              // 座位上死的人发消息
              this.gameBarrageTop(game, obj)
            } else {
              if (obj.uid == GAME_UID) {
                // 自己发的消息
                message = this.getPoll(this.msgRightPoll, game.messageRight)
              } else {
                message = this.getPoll(this.msgLeftPoll, game.messageLeft)
              }
            }
          } else {
            // 树上的人发消息
            this.gameBarrageTop(game, obj)
          }
        } else {
          if (obj.uid == GAME_UID) {
            // 自己发的消息
            message = this.getPoll(this.msgRightPoll, game.messageRight)
          } else {
            message = this.getPoll(this.msgLeftPoll, game.messageLeft)
          }
        }
      } else if (obj.type == 2) {
        // 上帝消息
        message = this.getPoll(this.msgLeftPoll, game.messageLeft)
      } else if (obj.type == 3) {
        // 提示消息
        tips = this.getPoll(this.msgTipPoll, game.messageTips)
        this.addTipsMessage(tips, obj, game, allMsgIndex)
      } else if (obj.type == 1) {
        // 投票信息
        vote = this.getPoll(this.msgVotePoll, game.voteResult)
        this.addVoteResult(vote, obj, game, allMsgIndex)
      } else if (obj.type == 99) {
        // mvp信息
        let mvp = this.getPoll(this.mvpResultPoll, game.mvpResult)
        this.addMvpResult(mvp, obj, game, allMsgIndex)
      }

      if (message) {
        this.addLRMessage(message, obj, game, roomUserInfo, allMsgIndex)
      }
    }
  },
  addLRMessage (message, obj, game, roomUserInfo, allMsgIndex) {
    let label1 = message.children[1].children[1].children[0].getComponent(cc.Label),
      label2 = message.children[1].children[1].children[1].getComponent(cc.Label),
      label3 = message.children[1].children[2].children[0].getComponent(cc.Label),
      label4 = message.children[1].children[2].children[1].getComponent(cc.Label),
      avatarNode = message.children[0].children[0].children[0],
      nickNode = message.children[1].children[0].children[1],
      seatNode = message.children[1].children[0].children[0].children[0]
    // 昵称
    nickNode.getComponent(cc.Label).string = obj.nickName

    seatNode.parent.active = true
    label3.node.parent.active = true
    label1.node.parent.active = true
    label2.node.active = true
    label4.node.active = true
    label4.node.width = 0
    label3.node.width = 320
    label2.node.width = 0
    label1.node.width = 320

    if (obj.type == 2) {
      nickNode.color = cc.hexToColor('#42BEFB')
      seatNode.parent.active = false
      label1.node.parent.active = false
      label3.string = obj.msg
      label4.string = obj.msg
    } else {
      nickNode.color = cc.hexToColor('#93B8E3')
      // 座位号
      roomUserInfo.forEach(function (value, index, array) {
        if (value && value.uid == obj.uid) {
          seatNode.getComponent(cc.Label).string = value.seat
        }
      })
      label3.node.parent.active = false
      label1.string = obj.msg
      label2.string = obj.msg
    }
    // message.opacity = 0;
    game.chatContent.addChild(message)
    // let msgIndex = this.addMsgToChatContent(game,game.chatContent,message);
    if (obj.type == 2) {
      if (label4.node.width < 315) {
        label3.node.width = label4.node.width + 5
      }
      label1.node.parent.active = false
      label4.node.active = false
      label3.node.parent.getComponent(cc.Layout)._updateLayout()
    } else {
      if (label2.node.width < 315) {
        label1.node.width = label2.node.width + 5
      }
      label2.node.active = false
      label3.node.parent.active = false
      label1.node.parent.getComponent(cc.Layout)._updateLayout()
    }
    message.children[1].children[0].getComponent(cc.Layout)._updateLayout()
    message.children[1].getComponent(cc.Layout)._updateLayout()
    message.getComponent(cc.Layout)._updateLayout()
    // message.parent.getComponent(cc.Layout)._updateLayout();
    if (allMsgIndex != -1) {
      let _this = this
      message.setPosition(this.allMsg[allMsgIndex].x, this.allMsg[allMsgIndex].y)
      setTimeout(function () {
        if (message) {
          message.opacity = 255
        }
      }, 100)
    } else {
      this.setMsgPosition(game, game.chatContent, message, obj)
      this.scrollToBottom(message, true, game)
    }

    // 头像
    if (obj.avatar) {
      if (obj.type == 2) {
        if (game.godSp) {
          avatarNode.getComponent(cc.Sprite).spriteFrame = game.godSp
        } else {
          util.loadImage(obj.avatar, avatarNode, function (sp) {
            game.godSp = sp
          })
        }
      } else {
        let index = util.findProperty(roomUserInfo, 'uid', obj.uid),
          sprite = avatarNode.getComponent(cc.Sprite)
        if (index != -1) {
          let seat = parseInt(roomUserInfo[index].seat),
            sp = game.siteArr[seat - 1].getComponent('site').sp
          if (sp) {
            try {
              avatarNode.getComponent(cc.Sprite).spriteFrame = sp
            } catch (e) {
              cc.error(e)
              util.loadImage(obj.avatar, avatarNode)
            }
          } else {
            util.loadImage(obj.avatar, avatarNode)
          }
        } else {
          util.loadImage(obj.avatar, avatarNode)
        }
      }
    }
  },
  addTipsMessage (tip, obj, game, allMsgIndex) {
    tip.children[0].getComponent(cc.Label).string = obj.msg
    game.chatContent.addChild(tip)
    tip.getComponent(cc.Layout)._updateLayout()
    if (allMsgIndex != -1) {
      tip.setPosition(this.allMsg[allMsgIndex].x, this.allMsg[allMsgIndex].y)
    } else {
      this.setMsgPosition(game, game.chatContent, tip, obj)
      this.scrollToBottom(tip, false, game)
    }
  },
  addMvpResult (mvp, obj, game, allMsgIndex) {
    mvp.children[0].getComponent('cc.Label').string = obj.msg
    game.chatContent.addChild(mvp)
    if (allMsgIndex !== -1) {
      mvp.setPosition(this.allMsg[allMsgIndex].x, this.allMsg[allMsgIndex].y)
    } else {
      this.setMsgPosition(game, game.chatContent, mvp, obj)
      this.scrollToBottom(mvp, false, game)
    }
  },
  scrollToBottom (message, show, game) {
    let _this = this
    let scrollView = game.chatContent.parent.parent.getComponent(cc.ScrollView)
    if (game.chatContent.height > this.height) {
      if (_this.autoScroll) {
        this.isScrolling = false
        scrollView.scrollToOffset(cc.p(0, scrollView.getMaxScrollOffset().y), 0.1)
        // scrollView.scrollToBottom(0.1);
        let offset = scrollView.getMaxScrollOffset().y
        if (offset > game.chatContent.height - _this.height) {
          offset = game.chatContent.height - _this.height
        }
        if (offset < 0) {
          offset = 0
        }
        // this.nowOffset = offset;
        let offsetTop = -offset + _this.height
        if (_this.allMsg.length > 0 && _this.displayMsg.length > 0) {
          _this.setTopMsg(offsetTop, game)
        }
      } else {
        if (_this.allMsg.length > 0 && _this.displayMsg.length > 0) {
          let offsetBottom = -_this.nowOffset - _this.height * 2
          _this.setBottomMsg(offsetBottom, game)
        }
      }
    }

    scrollView.scheduleOnce(function () {
      if (show) {
        message.opacity = 255
      }
    })
  },
  addVoteResult (vote, obj, game, allMsgIndex) {
    let data = obj.msg,
      votedPerson = {},
      _this = this
    if (typeof data !== 'object') {
      data = JSON.parse(obj.msg)
    }
    if (allMsgIndex == -1) {
      this.pollResult(data.list, game)
    }
    vote.children[0].children[0].getComponent(cc.Label).string = data.msg
    data.list.forEach(function (value, index, array) {
      if (votedPerson[value.poll] && value.seat != 0) {
        _this.addVotePerson(value, votedPerson[value.poll].children[0], game)
      } else {
        if (value.poll > 0 && value.seat != 0) {
          votedPerson[value.poll] = _this.getPoll(_this.voteItemPoll, game.voteItem)
          votedPerson[value.poll].children[2].children[1].children[0].getComponent(cc.Label).string = value.poll
          // 添加投票人
          _this.addVotePerson(value, votedPerson[value.poll].children[0], game)
          // 将投票节点插入
          vote.children[1].addChild(votedPerson[value.poll])

          let spriteVoted = votedPerson[value.poll].children[2].children[0].children[0].children[0],
            sp = game.siteArr[parseInt(value.poll) - 1].getComponent('site').sp
          if (sp) {
            try {
              spriteVoted.getComponent(cc.Sprite).spriteFrame = sp
            } catch (e) {
              cc.log(e)
              let avatar = game.webSocket.roomUserInfo[parseInt(value.poll) - 1].avatar
              util.loadImage(avatar, spriteVoted)
            }
          } else {
            let avatar = game.webSocket.roomUserInfo[parseInt(value.poll) - 1].avatar
            util.loadImage(avatar, spriteVoted)
          }
        } else if (value.poll == 0 && value.seat != 0) {
          votedPerson[value.poll] = _this.getPoll(_this.voteGiveUpPoll, game.voteGiveUp)
          _this.addVotePerson(value, votedPerson[value.poll].children[0], game)
        }
      }
    })
    if (votedPerson['0']) {
      vote.children[1].addChild(votedPerson['0'])
    }
    game.chatContent.addChild(vote)
    vote.children[1].getComponent(cc.Layout)._updateLayout()
    for (let i = 0; i < vote.children[1].children; i++) {
      vote.children[1].children[i].children[0].getComponent(cc.Layout)._updateLayout()
      vote.children[1].children[i].getComponent(cc.Layout)._updateLayout()
    }
    vote.children[1].getComponent(cc.Layout)._updateLayout()
    vote.getComponent(cc.Layout)._updateLayout()
    if (allMsgIndex != -1) {
      vote.setPosition(this.allMsg[allMsgIndex].x, this.allMsg[allMsgIndex].y)
    } else {
      _this.setMsgPosition(game, game.chatContent, vote, obj)
      _this.scrollToBottom(vote, false, game)
    }
  },
  addVotePerson (value, node, game) {
    // 添加投票人
    let votePerson = this.getPoll(this.avatarPoll, game.votePerson)
    votePerson.children[1].children[0].getComponent(cc.Label).string = value.seat

    let spriteVotePerson = votePerson.children[0].children[0].children[0],
      sp = game.siteArr[value.seat - 1].getComponent('site').sp
    if (sp) {
      try {
        spriteVotePerson.getComponent(cc.Sprite).spriteFrame = sp
      } catch (e) {
        cc.log(e)
        let avatar = game.webSocket.roomUserInfo[value.seat - 1].avatar
        util.loadImage(avatar, spriteVotePerson)
      }
    } else {
      let avatar = game.webSocket.roomUserInfo[value.seat - 1].avatar
      util.loadImage(avatar, spriteVotePerson)
    }

    node.addChild(votePerson)
  },
  gameBarrageTop (game, obj) {
    let index = util.findProperty(game.webSocket.roomUserInfo, 'uid', obj.uid),
      title
    if (index != -1) {
      title = '【' + game.webSocket.roomUserInfo[index].seat + ' 玩家】' + obj.nickName
      game.gameBarrageDown({
        title: title,
        content: obj.msg
      })
    } else {
      title = '【游客】' + obj.nickName
      game.gameBarrageTop({
        title: title,
        content: obj.msg
      })
    }
  },
  pollResult (data, game) {
    data.forEach(function (value, index, array) {
      if (value.seat > 0 && value.poll != -1) {
        let order = value.seat - 1,
          siteNode = game.siteArr[order]
        siteNode.getComponent('site').roomPollResult(value)
      }
    })
  },
  putPoll (poll, node) {
    try {
      switch (poll) {
        case 'msgLeftPoll':
          if (this[poll].size() > 15) {
            node.destroy()
          } else {
            this[poll].put(node)
          }
          break
        case 'msgRightPoll':
          if (this[poll].size() > 10) {
            node.destroy()
          } else {
            this[poll].put(node)
          }
          break
        case 'msgTipPoll':
          if (this[poll].size() > 8) {
            node.destroy()
          } else {
            this[poll].put(node)
          }
          break
        case 'msgVotePoll':
          let length = node.children[1].children.length
          for (let i = length - 1; i >= 0; i--) {
            let subNode = node.children[1].children[i]
            let subLength = subNode.children[0].children.length
            for (let j = subLength - 1; j >= 0; j--) {
              if (this['avatarPoll'].size() >= 12) {
                subNode.children[0].children[j].destroy()
              } else {
                this['avatarPoll'].put(subNode.children[0].children[j])
              }
            }
            if (subNode.name === 'result_item') {
              if (this['voteItemPoll'].size() > 4) {
                subNode.destroy()
              } else {
                this['voteItemPoll'].put(subNode)
              }
            }
            if (subNode.name === 'result_giveUp') {
              if (this['voteGiveUpPoll'].size() > 1) {
                subNode.destroy()
              } else {
                this['voteGiveUpPoll'].put(subNode)
              }
            }
          }
          if (this[poll].size() >= 2) {
            node.destroy()
          } else {
            this[poll].put(node)
          }
          break
        case 'mvpResultPoll':
          if (this[poll].size() > 1) {
            node.destroy()
          } else {
            this[poll].put(node)
          }
          break
        default:
          // node.destroy();
          break
      }
    } catch (e) {
      console.error(e)
    }
  },
  getPoll (poll, prefab) {
    let reNode
    if (poll.size() > 0) {
      reNode = poll.get()
    }
    if (!reNode || reNode.name == '') {
      let node = cc.instantiate(prefab)
      poll.put(node)
      reNode = poll.get()
    }
    return reNode
  },
  addMsgToChatContent (game, parent, children) {
    parent.addChild(children)
    return parent.childrenCount - 1
  },
  setMsgPosition (game, parent, children, obj) {
    let scrollView = game.chatContent.parent.parent.getComponent(cc.ScrollView)
    if (this.contentH == 0) {
      this.contentH += children.height
    } else {
      this.contentH += (children.height + 30)
    }

    if (this.contentH > this.height) {
      parent.height = this.contentH
    }
    let length = this.allMsg.length,
      width = children.width / 2,
      childrenY
    if (obj.type == 3 || obj.type == 1 || obj.type == '99') {
      width = parent.width / 2
    }
    if (length > 0) {
      // this.scrollToBottom(children, true, game);
      let height = this.allMsg[length - 1].h,
        y = this.allMsg[length - 1].y
      childrenY = y - height / 2 - children.height / 2 - this.space
      children.setPosition(width, childrenY)
    } else {
      childrenY = -children.height / 2 - 10
      children.setPosition(width, childrenY)
    }
    this.displayMsg.push(this.allMsg.length)
    this.allMsg[this.allMsg.length] = {
      x: width,
      y: childrenY,
      h: children.height,
      w: children.width,
      msg: obj
    }
  }
}

module.exports = msgCtrl
