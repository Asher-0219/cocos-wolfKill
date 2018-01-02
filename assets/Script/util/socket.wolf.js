/**
 * @author zct
 * websocket
 */
let listeners = {},
  isConnect = true,
  socket, socketSign, wsUrl, active

function _emit (data) {
  let action = data.action
  if (!data.action) {
    action = 'Heartbeat'
  }
  let handler = listeners[action]

  if (typeof handler === 'function') {
    if (action != 'Heartbeat' && action != 'ping_value') {
      // if (true) {
      console.log(data)
      if (GAME_INAPP) {
        COMMONOBJ.appLog(JSON.stringify(data))
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appLog',
          methodNameIOS: 'appLog:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [JSON.stringify(data)]
        })
      }
      if (false) {
        if (data.action != 'room.userDelTalk' || data.action != 'room.userTalk' || data.action != 'game.change_time') {
          let obj = {
            'fnName': 'game_addChatMessage',
            'uid': GAME_UID,
            'msg': JSON.stringify(data),
            'uidArr': [
              '-1'
            ],
            'type': '2',
            'avatar': 'http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w.jpg',
            'nickName': 'closur'
          }
          jsCommonFn(JSON.stringify(obj))
        }
      }
      if (data.uuid) {
        let reply = {
          action: 'receipt',
          data: data.uuid
        }
        console.log(reply)
        socket.send(JSON.stringify(reply))
      }
    }
    handler(data)
  } else {
    console.warn(data)
    throw data.action + ':Check if the method is correct'
  }
}

function _formatMsg (data) {
  let arr = [],
    obj = {},
    str = ''
  for (let key in data) {
    arr.push(key)
  }
  arr.sort()
  for (let i = 0; i < arr.length; i++) {
    let key = arr[i]
    obj[key] = data[key]
    str += key + '=' + data[key] + '&'
  }
  str += 'sign=' + socketSign
  let sign = MD5(str).toUpperCase()
  obj.sign = sign
  return JSON.stringify(obj)
}

function _onOpen (event) {
  isConnect = true
  console.log('socket连接成功')
  console.log(event)
}

function _onMessage (event) {
  active = true
  let data = event.data
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
  _emit(data)
}

function _onError (event) {
  console.log('socket连接出现错误')
  console.log(event)
}

function _onClose (event) {
  isConnect = true
  active = false
  console.log('socket连接已关闭')
  console.log(event)
}

function _connect () {
  try {
    socket = new WebSocket(wsUrl)
    socket.onopen = _onOpen
    socket.onmessage = _onMessage
    socket.onerror = _onError
    socket.onclose = _onClose
  } catch (e) {
    _reConnect()
  }
}

function _reConnect () {
  isConnect = false
  _connect()
}

class SocketWolf {
  constructor (url) {
    wsUrl = url
    _connect()
    // socket = new WebSocket(wsUrl);
    // socket.onopen = _onOpen;
    // socket.onmessage = _onMessage;
    // socket.onerror = _onError;
    // socket.onclose = _onClose;
  }

  on (action, handler) {
    listeners[action] = handler
  }

  emit (action, data) {
    if (action !== 'Heartbeat') {
      data.action = action
      data = _formatMsg(data)
      if (action !== 'ping') {
        console.log(data)
      }
      if (GAME_INAPP) {
        COMMONOBJ.appLog(data)
      }
      if (GAME_NATIVE) {
        callNativeMethod({
          methodNameAndroid: 'appLog',
          methodNameIOS: 'appLog:',
          methodSignature: '(Ljava/lang/String;)V',
          parameters: [data]
        })
      }
      if (false) {
        if (action != 'room.userDelTalk' && action != 'room.userTalk' && action != 'ping') {
          let obj = {
            'fnName': 'game_addChatMessage',
            'uid': GAME_UID,
            'msg': data,
            'uidArr': [
              '-1'
            ],
            'type': '2',
            'avatar': 'http://appfile.xys.ren/avatar1/2016/11/29819452931478655826.jpg@1e_1c_0i_1o_1x_90Q_100w.jpg',
            'nickName': 'closur'
          }
          jsCommonFn(JSON.stringify(obj))
        }
      }
    } else {
      data = JSON.stringify(data)
    }
    try {
      socket.send(data)
    } catch (e) {

    }
  }

  emitHandle (action, data) {
    console.log(data)
    listeners[action](data)
  }

  setSocketSign (str) {
    socketSign = str
  }

  getWs () {
    return socket
  }

  reConnect () {
    _reConnect()
  }

  close (cb) {
    cb && cb()
    socket.close()
  }

  getConnect () {
    return isConnect
  }

  getActive () {
    return active
  }
}

module.exports = SocketWolf
