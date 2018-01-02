window.GAME_MODULE = {}
window.GAME_SIGN = null
window.GAME_UID = null
window.GAME_ROOMID = null
window.GAME_INAPP = false
window.GAME_NATIVE = false
window.GAME_INPUT = null
window.GAME_USERDIE = false // 是否死亡
window.GAME_ROOMMAIN = false // 是否房主
window.GAME_SOCKET = false // socket连接是否断开
window.COMMONOBJ = window.wolfKillFunction
window.CLASSNAME = 'org/cocos2dx/wolfkill/AppActivity'
window.CLASSNAMEIOS = 'RootViewController'
window.HTTPURL = 'http://120.27.194.197/game/public/index.php'
// window.HTTPURL = 'https://game.xys.ren'
window.GAME_ACCOUNT = {
  u1: { account: 1739519, sign: 'crjGidLHFiyvsyPklRVU^h@J5woMjQV#', input: '4e47WDoMTPw%2FpLsCXAUyIfsT04lYqW2%2BM9vF1X9i%2FDXDkt7WywB6kfdP8dpZgFzmPL6Tnu9Ve23DHEB9dUWrngAnU4Yu5%2FmFjg%2BXlZOVKSGgF8ABCOC%2BpMJLNlKHEinlX9F0aDZm' },
  u2: { account: 2137948, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: '5d7dPr26VUWnM0wiuk3qE8orV8rNDl9v7GMIUwP6FvP9LPFMzK%2FkXbIQEc3W2o0BB5Zd1rbjsbh6c2b3NlDAxaFpUtUts48oZtf200cEDHUE3eZuFfMYmpVPFhGapklYDTZxZIfk' },
  u3: { account: 2138127, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'e8bcUn6ZbguoIpAHo0vWo7TrbD0Ls19Uu6nsDOWEO1znrWJRmfc1%2FwLfZWWzxpdLJImgDyvQbCAL5UXGW%2BxiinlfdWSpjKXxG9zpDM8UAsYNqlW8PSXag0RL362r6k915lk58jdN' },
  u4: { account: 2138144, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'bb2dQXpNcSygoQVcsOcWVh1SgCwZSjsJPtGNdxhU6p8MyCriD4J0WIjU0amYpwsplMf%2FA4DtgDKLYAPh8A77VIK3FnTDnfs1pDsJrDCvFtr9w%2Fb9QWxOgddMEvRlAc%2Bc%2FlHSlygR' },
  u5: { account: 2138232, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: '94dfPbCrUnmBYzHr0o3fhe%2FRvkzt19kDPpjvx3ROQvU106yXmHaCpegf0A2BPD2AdjZ%2FWgbErSJoJoqRDc5TruqzGt6TOd%2BRrLOec9fIA5zTFpaqeAwhevnHOpAaeB5dIFoJO3ns' },
  u6: { account: 2138262, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'a577cfbG2zQ7uLAO6mhns6G5Mr2l6sPATBUdF2TeYMApkrlfm7h3trCZc0tQEKGuLVGQ4M5bEZih7LSpXMFBf7MRVb%2BGM7WRPyGpc8arLEIbZTIfSQsTEV7GXSfYIiZPwDfiIKPL' },
  u7: { account: 2138370, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: '7c7cuOMRAfB5t482aOg0elNDgI6kg4dvZo0yMjieNEeNy49BN1hlFC3AnG%2Bv6S8CPtP6BWO%2FK2ZJXbFO77hItoJjtPDp0VgzCC7tZvOe6b%2FGo9R3V3ERhJ9Wn4i3lagcobgQcJVy' },
  u8: { account: 2137981, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'bb536ZztTkW2QL%2FDEzgTrKKPe4Poj%2Fuu2cNxowgWZtMyhtq8IUpgGWaZyJp19PW5X2e%2Fv5jgce%2BYobyQzJyola0%2BaP%2FXh%2BHx7jk0%2Bkj8gxAaCnHk13V6qSQnwtRSradZDyHX44dd' },
  u9: { account: 2138183, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: '907ekHf%2FWsRy6Js7BSYRuIb4pbZvmO8mMTR48Yn4hIaTITPPQAAdp%2FkNmrUYHXsvoECD9ZeO7kXciqXCfHY0DY00pEKcjX47zvBE8QRO4DdVmr8Gx0dohN%2B2ymzec%2Bh197fc6aw7' },
  u10: { account: 2138275, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'dddb0MN5Z%2BTnroOfqHmdmASks5k%2BqsJPWWLNDfoUSnzykvFxlxbIzOmcyEBFHxKj8JefXQX5MY%2FCkF%2FJIh2xoQLgx8IQGEYunOhB9kVgmjgwf5mPZpc8EO9A4oWPSRSHGRZf3IVD' },
  u11: { account: 2138328, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: '7009h58skniC6JUCWYQ0ACHP1iRyfTuAwtrLZoTTaDoh2EH%2FwcZLfTyE0OSb%2FVXxyh4saNwzjye7ujamZVLqecgd63DBrVnArQvbl1z8L6ErTwta7TElDjH2tchOoQtNmaIZicgW' },
  u12: { account: 2138469, sign: 'd2yXABPSs$218JZNNoR2ZuldEgqOTZrF', input: 'a014mvW9kn1Sxsrr2fI0dh3ezg8H7klxoIfHgvCK2wPtD4dvc37V54vX3rz0DC1g%2B3fMUheIez7FAfSfXj3mi4WCTD%2BE8aaTJxN%2FRLymNUQOfuk4E8%2F7tBmOKAMtLS4GSxDuySHS' },
  t1: { account: 5641589, sign: 'FkDgfUT@IctCZanfFroPpbw6jwR#8v@y', input: 'd6ddTW0yg5xhsFWOSbuc%2BYdWRWjxpUck4oU6KtoMS45eadr%2BPLXTctX1qD7l5CBJ3%2BIbNcWSoR6uTV1zsyefoywwl%2FUT9dERWerVnUi%2BCD42tOfvc8gOIGmhZwRHPbTSeF92AVIM' },
  t2: { account: 5641768, sign: '3^mvpjuTd3fUwERM1UArgUHr&XWEM#dp', input: '292bnreFYhLNlGPXHwC0Do6RpGGEDcn2dHObZAFfiQj3ieJZkCvIUtvBY%2BnI5AwLNfs01JeyXe5sswiFiSXGsQ29B13M25pQ3tXUFoLeyVMgk%2B6ahnw%2BYamdJQ6AccWQ6zXx30sR' },
  t3: { account: 2139076, sign: '!Dk0Zfr3e%7V2yW@#t1ic!Psh^@1o@oB', input: '57d93ryxoYYLNf7VUgufap8sfnG91o3b%2BsUhMFdfaAURRXVK04zMgXJ4r9LuiAoI6i7%2Bm4JJ%2BF%2Ffegf1xgNm8iI%2Bufcbbn%2BThv2%2FfUIk1rnuU3M0ezBPVFfg4yTbkbwyhRYY1RFP' },
  t4: { account: 5641852, sign: 't3RrlbBy4VKr*a#%wEKG^&tRDexE0!2v', input: '996fMt0AlXDf07oGMNpihcw9Gok%2FSZed2et7XlEluseDlZ4LzlGypgWWhB9%2BSjCxK5R8BZcC%2BSuaCOE7kJfVhwejsIUt%2FgADctzRVRwhY0jLn9QG4c46u1Ql9cImcP7MnR0%2FeRi8' },
  t5: { account: 5641910, sign: '1ix4f4GMgAaaTqMYQhvIHGs$bE948vGA', input: '49d2at7%2Fpl5H0yEib0FyN78McWg4YfRdFgupQ9Daa41%2F1Ynu9sorCa4efCMb5UKoBGuA%2F8414NuUS9Yh0%2BQyGsAiepM%2BG0BOBJd91HI7v%2FlSCM8F5M94xjQd72KtS4o2LyTPem%2Bh' },
  t6: { account: 5642013, sign: 'wrh2Wx8fPN2%TWDbdB4Sxic^0MNtVKzR', input: '6930NXRjSpnIJKszfEKDD%2BATLBFnyPGH8fR7afXwh3t92uehBTsXJzlz3oikq%2B8wnSq6fY8xurdeWgvjga4gh6kXRZ9uZoyeylrpz9WHtIimxNy35LLrUe2YZuPZtOlU5fZFc0XB' },
  t7: { account: 5642113, sign: 'lZKI0&9HiQ40j3j%hs3D8#%M*tJdEtMz', input: 'f5b2PGGTU%2B%2FmGnGMWiyIp6WZ3Qyr2cVLtwA34FEoi%2B5n6mIs%2BnKY0GKij1Zsi7p0W5%2BEA7SiRo9aX2hxFYIyJbc37wRtEoKoaNlg90iv6jakdtTkfnBckjFaFHOqFEO6tukRx9Lg' },
  t8: { account: 5642297, sign: 'gx98Zqj2xxh&1C8wcXci9B@NjkQfHSRu', input: '54b5WUE6vFHLPBEUl1yxZ9LWnBIAEnJQ2UNsQJOqVMY1Ay4vNAp23Wg3HnsdDxz7lD3AULL5Nk3xEhP5gZ0UFBgEGjzErVBtbQqSZoVdYngyYUP4qb4nHfYtHSM70tTaAtGJTQ1B' },
  t9: { account: 5642368, sign: '$#NT1ecChFGvt5VlM1kmyD7Sba*n9$$z', input: '21113OGaQnKO8BmvdF52d269fnuJ%2FMz5WeyA8%2BXbzgXFavIkJiyEQYFm9TaTmlmNJTDEHCJuE3f4ee8eFqEFb3aFlNVVRbJHaTGRwmrjwAYKtIb3RlS9joZOXGBtezVE3pEJTpmy' },
  t10: { account: 5642494, sign: 'e%Wv9aGe40vtBOFzg7PeSARiMQ1X8yPw', input: '2f04IFvSiGrPGHeItoNAS8KFjXvjFgXaGh4VetajPaORtrlbY8Tt7S5QAwOomy7o%2Fu8BRwxqvb8SDJhtn57h4Te%2FTqQmQNAl0%2B%2BwpO9ITt4bqTbuioi1gF2kNiVuIYzUmMson0K1' },
  t11: { account: 5642605, sign: 'x&d@Est8Ob^gjQY41ObUYpA&^1opEdgK', input: '7a30gwJbZoSfnY640zsq4NOmjEm%2B0e2reQciwgU%2BnS0qg3%2FYhYfdpbOidRRaN2gA9FpzvreOWU%2BIv2XSjtwCyd0ucsWxOkd%2BbKhpU%2FrFe68m8t5CWou7dGTWqNmgrrG%2BYeIi8IE7' },
  t12: { account: 5642645, sign: 'buJxcY^hicHV0WVLn9bj25$FMngUa92f', input: '6b1dgdaa4De%2Bggt3BLnvGobk49MyLUoEElF7kaJ0uYNAIPYtxp%2FRRx%2Bj75hdwOHbbLzicN9qekzR%2FYTmdLyvEObLhr5rmlmAO%2BrXFFm2ZHx7hb9LMglinf57wM9NzjkVTxpg3O%2Fd' }
}
window.LONGLEAVE = 0 // 是否从页面外重连
window.LONGLEAVEWEB = false // web页面重连标志
window.NETEASE = 'fce368c9b42cd39e84db40e6e8073e25'
window.NUMBER_CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']
window.USER_SEAT = null // 自己座位号
window.USER_ROLE = null // 角色
window.USER_CONTROL_STATE = null // 当前操作
window.USER_ONTREE = false // 是否在树上
window.CANSITEDOWN = 1 // 是否可以坐下
window.SPEAK_TYPE = null // 发言类型
window.GAME_START = false // 游戏是否开始
window.GAME_ISNIGHT = false // 是否晚上
window.GAME_VOTE = false // 是否投票阶段
window.GAME_MUSIC = true // 是否开启音乐
window.GAME_SOUND = true // 是否开启音效
window.USER_WINTIMES = null // 连胜次数
window.PING = null // 用户PING值
window.ROOM_PASSWORD = 0 // 房间密码
window.USER_UDNUM = null // 我的U豆数量
window.USER_QUIZNUM = 0 // 下注数量
window.USER_QUIZ = false // 是否下注
window.GAME_TEXT = true // 公屏打字
window.GAME_BARRAGE = true // 观摩弹幕
window.SCROLL_HEIGHT = 0 // 页面抬起高度
window.VOTE_TYPE = {
  wolf: 11,
  prophet: 12,
  guard: 13,
  witchSave: 14,
  witchPosion: 15,
  hunter: 17,
  police: 19,
  votePolice: 20,
  voteDieInDay: 1,
  transferEmblem: 21,
  policeRightSpeak: 22,
  policeLeftSpeak: 23,
  wolfBoom: 10
}

/**
 * 客户端调用js方法
 * @param  {object} data 传递的数据
 * @property {string} fnName 处理该次数据的模块与方法，已_分割
 */
window.jsCommonFn = function (data) {
  // if(cc.sys.OS_ANDROID == cc.sys.os){
  //  data = encodeURIComponent(data);
  // }

  data = decodeURIComponent(data)

  if (cc.sys.OS_ANDROID === cc.sys.os) {
    data = data.replace(/\n/g, '\\n')
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
  data = JSON.parse(data)
  console.log(data)
  var moudle, fnName
  if (data.fnName) {
    module = data.fnName.split('_')[0]
    fnName = data.fnName.split('_')[1]
    GAME_MODULE[module][fnName](data)
  } else {
    throw 'APPFN:参数方法名不存在'
  }
}

/**
 * creator与客户端交互
 * @param  {object} obj 参数对象
 * @property  {string} methodNameAndroid 安卓方法名
 * @property  {string} methodNameIOS     ios方法名
 * @property  {string} methodSignature   安卓方法签名
 * @property  {Array}  parameters        方法参数
 * @return {object}     调用方法返回值(可能没有)
 */
window.callNativeMethod = function (obj) {
  var className,
    data, methodName

  if (cc.sys.OS_ANDROID == cc.sys.os) {
    className = obj.className ? obj.className : CLASSNAME
    obj.parameters.unshift(className, obj.methodNameAndroid, obj.methodSignature)
    methodName = obj.methodNameAndroid
  }

  if (cc.sys.OS_IOS == cc.sys.os) {
    className = CLASSNAMEIOS
    obj.parameters.unshift(className, obj.methodNameIOS)
    methodName = obj.methodNameIOS
  }

  if (obj.methodNameAndroid !== 'appLog') {
    callNativeMethod({
      methodNameAndroid: 'appLog',
      methodNameIOS: 'appLog:',
      methodSignature: '(Ljava/lang/String;)V',
      parameters: ['cocos调用' + obj.methodNameAndroid + '方法!' + '  参数:' + obj.parameters.join(',')]
    })
  }

  try {
    if (methodName) {
      data = jsb.reflection.callStaticMethod.apply(jsb.reflection, obj.parameters)
    }
  } catch (e) {
    // console.error(e);
  }

  if (data) {
    callNativeMethod({
      methodNameAndroid: 'appLog',
      methodNameIOS: 'appLog:',
      methodSignature: '(Ljava/lang/String;)V',
      parameters: ['app返回数据:' + data]
    })
    console.log(data)
    return data
  }
}
