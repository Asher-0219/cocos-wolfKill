const quiz = {
  roomStart (socket) {
    socket.emitHandle('room.start', {
      data: {
        list: [{
          roleId: 1,
          price: 15,
          roleIcon: ''
        },
        {
          roleId: 2,
          price: 15,
          roleIcon: ''
        }
        ]
      }
    })
  },
  roomAllotRole (socket) {
    socket.emitHandle('room.allotRole', {
      data: {
        list: [{
          seat: 5,
          role: 1
        }]
      }
    })
  },
  roomPollWolf (socket) {
    socket.emitHandle('room.pollWolf', {
      data: [{
        seat: 2,
        isPoll: 1,
        canPoll: 1
      },
      {
        seat: 3,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 4,
        isPoll: 1,
        canPoll: 1
      },
      {
        seat: 5,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 6,
        isPoll: 1,
        canPoll: 1
      },
      {
        seat: 7,
        isPoll: 1,
        canPoll: 0
      }
      ]
    })
  },
  roomPollProphet (socket) {
    socket.emitHandle('room.pollProphet', {
      data: [{
        seat: 2,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 3,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 4,
        isPoll: 0,
        canPoll: 1
      },
      {
        seat: 5,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 6,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 7,
        isPoll: 1,
        canPoll: 0
      }
      ]
    })
  },
  roomPollGuard (socket) {
    socket.emitHandle('room.pollGuard', {
      data: [{
        seat: 2,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 3,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 4,
        isPoll: 1,
        canPoll: 1
      },
      {
        seat: 5,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 6,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 7,
        isPoll: 1,
        canPoll: 0
      }
      ]
    })
  },
  roomPollWitch (socket) {
    socket.emitHandle('room.pollWitch', {
      data: [{
        seat: 2,
        isPoll: 1,
        canPoll: 0
      },
      {
        seat: 3,
        isPoll: 2,
        canPoll: 0
      },
      {
        seat: 4,
        isPoll: 2,
        canPoll: 1
      },
      {
        seat: 5,
        isPoll: 2,
        canPoll: 0
      },
      {
        seat: 6,
        isPoll: 2,
        canPoll: 0
      },
      {
        seat: 7,
        isPoll: 1,
        canPoll: 0
      }
      ]
    })
  },
  roomStartGameNight (socket) {
    socket.emitHandle('room.startGameNight', {

    })
  },
  votePollNotice (socket) {
    socket.emitHandle('vote.pollNotice', {
      data: {
        seat: 4,
        poll: 4,
        oldPoll: 0,
        polltype: 11
      }
    })
  },
  voteTellResult (socket) {
    console.log('voteTellResult')
    socket.emitHandle('vote.tellResult', {
      data: {
        gameOver: 2,
        list: [{
          seat: 1,
          role: 1,
          isdie: 1
        }, {
          seat: 3,
          role: 2,
          isdie: 1
        }, {
          seat: 5,
          role: 2,
          isdie: 1
        }, {
          seat: 7,
          role: 1,
          isdie: 1
        } ]
      }
    })
  },
  roomPollPolice (socket) {
    socket.emitHandle('room.pollPolice', {
      data: [{
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 1
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 2
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 3
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 4
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 5
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 6
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 7
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 8
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 9
      },
      {
        canPoll: 1,
        identity: 0,
        isPoll: 0,
        seat: 10
      }
      ]
    })
  },
  voteDecisionCampaign (socket) {
    socket.emitHandle('vote.decisionCampaign', {
      data: {
        seat: 8
      }
    })
  },
  roomPollMovePolice (socket) {
    socket.emitHandle('room.pollMovePolice', {
      data: [{
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 2
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 3
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 4
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 5
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 6
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 7
      },
      {
        canPoll: 0,
        identity: 0,
        isPoll: 1,
        seat: 8
      }
      ]
    })
  },
  roomEnter (socket) {
    socket.emitHandle('room.enter', {
      'code': 200,
      'msg': '',
      'data': {
        'roomId': 9086120,
        'list': [{
          'isSpeak': 1,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138370',
          'nickname': '',
          'isready': 1,
          'seat': 3,
          'isMain': 0
        }, {
          'isSpeak': 1,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2137981',
          'nickname': '柯树111',
          'isready': 1,
          'seat': 12,
          'isMain': 0
        }, {
          'isSpeak': 1,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138183',
          'nickname': '',
          'isready': 1,
          'seat': 7,
          'isMain': 0
        }, {
          'isSpeak': 1,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2137948',
          'nickname': '',
          'isready': 1,
          'seat': 2,
          'isMain': 1
        }],
        'isStart': '0'
      },
      'action': 'room.enter',
      'sign': '625D6869D6ECC10AE1C43B493B6EC5C5'
    })
  },
  roomReEnter (socket) {
    socket.emitHandle('room.reEnter', {
      'code': 200,
      'msg': '',
      'data': {
        'roomId': 9084213,
        'list': [{
          'seat': '5',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w_100h.jpg',
          'uid': '298194',
          'nickname': 'closur',
          'isMain': 1,
          'isdie': '0',
          'roleID': '1',
          'isPolice': 0
        }, {
          'seat': '1',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138469',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '7',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138370',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '10',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2137981',
          'nickname': '柯树111',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '9',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138183',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '3',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138275',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '11',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '1739519',
          'nickname': '',
          'isMain': 0,
          'isdie': '1',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '4',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138328',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 1,
          'isPolice': 0
        }],
        'action': 'room.reEnter'
      },
      'action': 'room.reEnter',
      'sign': '1987E69A0816027A02E12DCCC0B90498'
    })
  },
  tellResult (socket) {
    socket.emitHandle('vote.tellResult', {
      'code': 200,
      'data': {
        'gameOver': 1,
        'list': [{
          'seat': '5',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w_100h.jpg',
          'uid': '298194',
          'nickname': 'closur',
          'isMain': 1,
          'isdie': '0',
          'roleID': '1',
          'isPolice': 0
        }, {
          'seat': '1',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138469',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '7',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138370',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '10',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2137981',
          'nickname': '柯树111',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '9',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138183',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '3',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138275',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '11',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '1739519',
          'nickname': '',
          'isMain': 0,
          'isdie': '1',
          'roleID': 0,
          'isPolice': 0
        }, {
          'seat': '4',
          'isSpeak': 0,
          'avatar': 'http://appfile.xys.ren/upload/3/avatar243.png@1e_1c_0i_1o_1x_90Q_100w_100h.png',
          'uid': '2138328',
          'nickname': '',
          'isMain': 0,
          'isdie': '0',
          'roleID': 1,
          'isPolice': 0
        }]
      }
    })
  },
  roomAllotRole (socket) {
    socket.emitHandle('room.allotRole', {
      'code': 200,
      'msg': '狼成员信息',
      'data': {
        'list': [{
          'seat': '2',
          'role': '1',
          'name': '狼人',
          'icon': 'http://120.27.186.151/interface/img.php?file=avatar1/2016/11/30959686281478138019.jpg',
          'word': '每个夜晚可以杀死一个人'
        },
        {
          'seat': '1',
          'role': '1',
          'name': '狼人',
          'icon': 'http://120.27.186.151/interface/img.php?file=avatar1/2016/11/30959686281478138019.jpg',
          'word': '每个夜晚可以杀死一个人'
        }
        ]
      },
      'action': 'room.allotRole',
      'sign': '345FE25C87814807150D18A24CB4321A'
    })
  },
  speakSpeakSkip (socket) {
    socket.emitHandle('speak.speak_skip', {
      'code': 200,
      'msg': '',
      'data': {
        'list': [{
          'seat': '6',
          'isSpeak': 0
        },
        {
          'seat': '5',
          'isSpeak': 0
        },
        {
          'seat': '7',
          'isSpeak': 0
        },
        {
          'seat': '8',
          'isSpeak': 0
        },
        {
          'seat': '12',
          'isSpeak': 0
        },
        {
          'seat': '10',
          'isSpeak': 1
        },
        {
          'seat': '9',
          'isSpeak': 0
        }
        ],
        'time': 60
      },
      'action': 'speak.speak_skip',
      'sign': '42C47877653C90B5E01677D4A75D88D8'
    })
  },
  speakSpeakSkip1 (socket) {
    socket.emitHandle('speak.speak_skip', {
      'code': 200,
      'msg': '',
      'data': {
        'list': [{
          'seat': '6',
          'isSpeak': 0
        },
        {
          'seat': '5',
          'isSpeak': 0
        },
        {
          'seat': '7',
          'isSpeak': 0
        },
        {
          'seat': '8',
          'isSpeak': 0
        },
        {
          'seat': '12',
          'isSpeak': 1
        },
        {
          'seat': '10',
          'isSpeak': 0
        },
        {
          'seat': '9',
          'isSpeak': 0
        }
        ],
        'time': 60
      },
      'action': 'speak.speak_skip',
      'sign': '42C47877653C90B5E01677D4A75D88D8'
    })
  },
  campaignRespeak (socket) {
    socket.emitHandle('vote.campaignRespeak', {
      'code': 200,
      'msg': '2号与5号出现平票',
      'action': 'vote.campaignRespeak',
      'sign': '42C47877653C90B5E01677D4A75D88D8'
    })
  }

}

module.exports = quiz

// {
//   "isSpeak": 1,
//   "avatar": "http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w_100h.jpg",
//   "uid": "298194",
//   "nickname": "closur",
//   "isready": 1,
//   "seat": 11,
//   "isMain": 0
// },
