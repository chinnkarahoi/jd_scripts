/*
东东水果:脚本更新地址 https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js
更新时间：2021-5-18
活动入口：京东APP我的-更多工具-东东农场
东东农场活动链接：https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
互助码shareCode请先手动运行脚本查看打印可看到
一天只能帮助3个人。多出的助力码无效
==========================Quantumultx=========================
[task_local]
#jd免费水果
5 6-18/6 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js, tag=东东农场, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdnc.png, enabled=true
=========================Loon=============================
[Script]
cron "5 6-18/6 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js,tag=东东农场

=========================Surge============================
东东农场 = type=cron,cronexp="5 6-18/6 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js

=========================小火箭===========================
东东农场 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js, cronexpr="5 6-18/6 * * *", timeout=3600, enable=true

jd免费水果 搬的https://github.com/liuxiaoyucc/jd-helper/blob/a6f275d9785748014fc6cca821e58427162e9336/fruit/fruit.js
*/
const $ = new Env('东东农场');
let cookiesArr = [], cookie = '', jdFruitShareArr = [], isBox = false, notify, newShareCodes, allMessage = '';
//助力好友分享码(最多3个,否则后面的助力失败),原因:京东农场每人每天只有3次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // 这个列表填入你要助力的好友的shareCode
   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  '0a74407df5df4fa99672a037eec61f7e@dbb21614667246fabcfd9685b6f448f3@6fbd26cc27ac44d6a7fed34092453f77@61ff5c624949454aa88561f2cd721bf6@56db8e7bc5874668ba7d5195230d067a@b9d287c974cc498d94112f1b064cf934@23b49f5a106b4d61b2ea505d5a4e1056@8107cad4b82847a698ca7d7de9115f36@0ee770257df74652853af40e2e420694@45009e7831604593a38e23940c53b8ca@b06638698ccf4399a4dfecc62fd080a2',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  'b1638a774d054a05a30a17d3b4d364b8@f92cb56c6a1349f5a35f0372aa041ea0@9c52670d52ad4e1a812f894563c746ea@8175509d82504e96828afc8b1bbb9cb3@2673c3777d4443829b2a635059953a28@d2d5d435675544679413cb9145577e0f',
]
let message = '', subTitle = '', option = {}, isFruitFinished = false;
const retainWater = 100;//保留水滴大于多少g,默认100g;
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let jdFruitBeanCard = false;//农场使用水滴换豆卡(如果出现限时活动时100g水换20豆,此时比浇水划算,推荐换豆),true表示换豆(不浇水),false表示不换豆(继续浇水),脚本默认是浇水
let randomCount = $.isNode() ? 20 : 5;
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const urlSchema = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html%22%20%7D`;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      option = {};
      await shareCodesFormat();
      await jdFruit();
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdFruit() {
  subTitle = `【京东账号${$.index}】${$.nickName}`;
  try {
    await helpAuthor();
    await initForFarm();
    if ($.farmInfo.farmUserPro) {
      // option['media-url'] = $.farmInfo.farmUserPro.goodsImage;
      message = `【水果名称】${$.farmInfo.farmUserPro.name}\n`;
      console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.farmInfo.farmUserPro.shareCode}\n`);
      console.log(`\n【已成功兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`);
      message += `【已兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`;
      await masterHelpShare();//助力好友
      if ($.farmInfo.treeState === 2 || $.farmInfo.treeState === 3) {
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看`);
        }
        return
      } else if ($.farmInfo.treeState === 1) {
        console.log(`\n${$.farmInfo.farmUserPro.name}种植中...\n`)
      } else if ($.farmInfo.treeState === 0) {
        //已下单购买, 但未开始种植新的水果
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】 ${$.nickName || $.UserName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 您忘了种植新的水果`, `京东账号${$.index} ${$.nickName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果`);
        }
        return
      }
      await doDailyTask();
      await doTenWater();//浇水十次
      await getFirstWaterAward();//领取首次浇水奖励
      await getTenWaterAward();//领取10浇水奖励
      await getWaterFriendGotAward();//领取为2好友浇水奖励
      await duck();
      await doTenWaterAgain();//再次浇水
      await predictionFruit();//预测水果成熟时间
    } else {
      console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify($.farmInfo)}`);
      message = `【数据异常】请手动登录京东app查看此账号${$.name}是否正常`;
    }
  } catch (e) {
    console.log(`任务执行异常，请检查执行日志 ‼️‼️`);
    $.logErr(e);
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
    $.msg($.name, '', `${errMsg}`)
  }
  await showMsg();
}
async function doDailyTask() {
  await taskInitForFarm();
  console.log(`开始签到`);
  if (!$.farmTask.signInit.todaySigned) {
    await signForFarm(); //签到
    if ($.signResult.code === "0") {
      console.log(`【签到成功】获得${$.signResult.amount}g💧\\n`)
      //message += `【签到成功】获得${$.signResult.amount}g💧\n`//连续签到${signResult.signDay}天
    } else {
      // message += `签到失败,详询日志\n`;
      console.log(`签到结果:  ${JSON.stringify($.signResult)}`);
    }
  } else {
    console.log(`今天已签到,连续签到${$.farmTask.signInit.totalSigned},下次签到可得${$.farmTask.signInit.signEnergyEachAmount}g\n`);
  }
  // 被水滴砸中
  console.log(`被水滴砸中： ${$.farmInfo.todayGotWaterGoalTask.canPop ? '是' : '否'}`);
  if ($.farmInfo.todayGotWaterGoalTask.canPop) {
    await gotWaterGoalTaskForFarm();
    if ($.goalResult.code === '0') {
      console.log(`【被水滴砸中】获得${$.goalResult.addEnergy}g💧\\n`);
      // message += `【被水滴砸中】获得${$.goalResult.addEnergy}g💧\n`
    }
  }
  console.log(`签到结束,开始广告浏览任务`);
  if (!$.farmTask.gotBrowseTaskAdInit.f) {
    let adverts = $.farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
    let browseReward = 0
    let browseSuccess = 0
    let browseFail = 0
    for (let advert of adverts) { //开始浏览广告
      if (advert.limit <= advert.hadFinishedTimes) {
        // browseReward+=advert.reward
        console.log(`${advert.mainTitle}+ ' 已完成`);//,获得${advert.reward}g
        continue;
      }
      console.log('正在进行广告浏览任务: ' + advert.mainTitle);
      await browseAdTaskForFarm(advert.advertId, 0);
      if ($.browseResult.code === '0') {
        console.log(`${advert.mainTitle}浏览任务完成`);
        //领取奖励
        await browseAdTaskForFarm(advert.advertId, 1);
        if ($.browseRwardResult.code === '0') {
          console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${$.browseRwardResult.amount}g`)
          browseReward += $.browseRwardResult.amount
          browseSuccess++
        } else {
          browseFail++
          console.log(`领取浏览广告奖励结果:  ${JSON.stringify($.browseRwardResult)}`)
        }
      } else {
        browseFail++
        console.log(`广告浏览任务结果:   ${JSON.stringify($.browseResult)}`);
      }
    }
    if (browseFail > 0) {
      console.log(`【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\\n`);
      // message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\n`;
    } else {
      console.log(`【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`);
      // message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`;
    }
  } else {
    console.log(`今天已经做过浏览广告任务\n`);
  }
  //定时领水
  if (!$.farmTask.gotThreeMealInit.f) {
    //
    await gotThreeMealForFarm();
    if ($.threeMeal.code === "0") {
      console.log(`【定时领水】获得${$.threeMeal.amount}g💧\n`);
      // message += `【定时领水】获得${$.threeMeal.amount}g💧\n`;
    } else {
      // message += `【定时领水】失败,详询日志\n`;
      console.log(`定时领水成功结果:  ${JSON.stringify($.threeMeal)}`);
    }
  } else {
    console.log('当前不在定时领水时间断或者已经领过\n')
  }
  //给好友浇水
  if (!$.farmTask.waterFriendTaskInit.f) {
    if ($.farmTask.waterFriendTaskInit.waterFriendCountKey < $.farmTask.waterFriendTaskInit.waterFriendMax) {
      await doFriendsWater();
    }
  } else {
    console.log(`给${$.farmTask.waterFriendTaskInit.waterFriendMax}个好友浇水任务已完成\n`)
  }
  // await Promise.all([
  //   clockInIn(),//打卡领水
  //   executeWaterRains(),//水滴雨
  //   masterHelpShare(),//助力好友
  //   getExtraAward(),//领取额外水滴奖励
  //   turntableFarm()//天天抽奖得好礼
  // ])
  await getAwardInviteFriend();
  await clockInIn();//打卡领水
  await executeWaterRains();//水滴雨
  await getExtraAward();//领取额外水滴奖励
  await turntableFarm()//天天抽奖得好礼
}
async function predictionFruit() {
  console.log('开始预测水果成熟时间\n');
  await initForFarm();
  await taskInitForFarm();
  let waterEveryDayT = $.farmTask.totalWaterTaskInit.totalWaterTaskTimes;//今天到到目前为止，浇了多少次水
  message += `【今日共浇水】${waterEveryDayT}次\n`;
  message += `【剩余 水滴】${$.farmInfo.farmUserPro.totalEnergy}g💧\n`;
  message += `【水果🍉进度】${(($.farmInfo.farmUserPro.treeEnergy / $.farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${$.farmInfo.farmUserPro.treeEnergy / 10}次,还需${($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10}次\n`
  if ($.farmInfo.toFlowTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【开花进度】再浇水${$.farmInfo.toFlowTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
  } else if ($.farmInfo.toFruitTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【结果进度】再浇水${$.farmInfo.toFruitTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
  }
  // 预测n天后水果课可兑换功能
  let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水

  let waterD = Math.ceil(waterTotalT / waterEveryDayT);

  message += `【预测】${waterD === 1 ? '明天' : waterD === 2 ? '后天' : waterD + '天之后'}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果🍉`
}
//浇水十次
async function doTenWater() {
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match(`限时翻倍`) && beanCard > 0) {
    console.log(`您设置的是使用水滴换豆卡，且背包有水滴换豆卡${beanCard}张, 跳过10次浇水任务`)
    return
  }
  if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    console.log(`\n准备浇水十次`);
    let waterCount = 0;
    isFruitFinished = false;
    for (; waterCount < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit - $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
      console.log(`第${waterCount + 1}次浇水`);
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`剩余水滴${$.waterResult.totalEnergy}g`);
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          if ($.waterResult.totalEnergy < 10) {
            console.log(`水滴不够，结束浇水`)
            break
          }
          await gotStageAward();//领取阶段性水滴奖励
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log('\n今日已完成10次浇水任务\n');
  }
}
//领取首次浇水奖励
async function getFirstWaterAward() {
  await taskInitForFarm();
  //领取首次浇水奖励
  if (!$.farmTask.firstWaterInit.f && $.farmTask.firstWaterInit.totalWaterTimes > 0) {
    await firstWaterTaskForFarm();
    if ($.firstWaterReward.code === '0') {
      console.log(`【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`);
      // message += `【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`;
    } else {
      // message += '【首次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取首次浇水奖励结果:  ${JSON.stringify($.firstWaterReward)}`);
    }
  } else {
    console.log('首次浇水奖励已领取\n')
  }
}
//领取十次浇水奖励
async function getTenWaterAward() {
  //领取10次浇水奖励
  if (!$.farmTask.totalWaterTaskInit.f && $.farmTask.totalWaterTaskInit.totalWaterTaskTimes >= $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    await totalWaterTaskForFarm();
    if ($.totalWaterReward.code === '0') {
      console.log(`【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`);
      // message += `【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`;
    } else {
      // message += '【十次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取10次浇水奖励结果:  ${JSON.stringify($.totalWaterReward)}`);
    }
  } else if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    // message += `【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`;
    console.log(`【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`);
  }
  console.log('finished 水果任务完成!');
}
//再次浇水
async function doTenWaterAgain() {
  console.log('开始检查剩余水滴能否再次浇水再次浇水\n');
  await initForFarm();
  let totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  console.log(`剩余水滴${totalEnergy}g\n`);
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  console.log(`背包已有道具:\n快速浇水卡:${fastCard === -1 ? '未解锁': fastCard + '张'}\n水滴翻倍卡:${doubleCard === -1 ? '未解锁': doubleCard + '张'}\n水滴换京豆卡:${beanCard === -1 ? '未解锁' : beanCard + '张'}\n加签卡:${signCard === -1 ? '未解锁' : signCard + '张'}\n`)
  if (totalEnergy >= 100 && doubleCard > 0) {
    //使用翻倍水滴卡
    for (let i = 0; i < new Array(doubleCard).fill('').length; i++) {
      await userMyCardForFarm('doubleCard');
      console.log(`使用翻倍水滴卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  if (signCard > 0) {
    //使用加签卡
    for (let i = 0; i < new Array(signCard).fill('').length; i++) {
      await userMyCardForFarm('signCard');
      console.log(`使用加签卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match('限时翻倍')) {
    console.log(`\n您设置的是水滴换豆功能,现在为您换豆`);
    if (totalEnergy >= 100 && $.myCardInfoRes.beanCard > 0) {
      //使用水滴换豆卡
      await userMyCardForFarm('beanCard');
      console.log(`使用水滴换豆卡结果:${JSON.stringify($.userMyCardRes)}`);
      if ($.userMyCardRes.code === '0') {
        message += `【水滴换豆卡】获得${$.userMyCardRes.beanCount}个京豆\n`;
        return
      }
    } else {
      console.log(`您目前水滴:${totalEnergy}g,水滴换豆卡${$.myCardInfoRes.beanCard}张,暂不满足水滴换豆的条件,为您继续浇水`)
    }
  }
  // if (totalEnergy > 100 && $.myCardInfoRes.fastCard > 0) {
  //   //使用快速浇水卡
  //   await userMyCardForFarm('fastCard');
  //   console.log(`使用快速浇水卡结果:${JSON.stringify($.userMyCardRes)}`);
  //   if ($.userMyCardRes.code === '0') {
  //     console.log(`已使用快速浇水卡浇水${$.userMyCardRes.waterEnergy}g`);
  //   }
  //   await initForFarm();
  //   totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  // }
  // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
  let overageEnergy = totalEnergy - retainWater;
  if (totalEnergy >= ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy)) {
    //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
    isFruitFinished = false;
    for (let i = 0; i < ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log('\n浇水10g成功\n');
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          console.log(`目前水滴【${$.waterResult.totalEnergy}】g,继续浇水，水果马上就可以兑换了`)
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else if (overageEnergy >= 10) {
    console.log("目前剩余水滴：【" + totalEnergy + "】g，可继续浇水");
    isFruitFinished = false;
    for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`\n浇水10g成功,剩余${$.waterResult.totalEnergy}\n`)
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          await gotStageAward()
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log("目前剩余水滴：【" + totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务")
  }
}
//领取阶段性水滴奖励
function gotStageAward() {
  return new Promise(async resolve => {
    if ($.waterResult.waterStatus === 0 && $.waterResult.treeEnergy === 10) {
      console.log('果树发芽了,奖励30g水滴');
      await gotStageAwardForFarm('1');
      console.log(`浇水阶段奖励1领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`;
        console.log(`【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`);
      }
    } else if ($.waterResult.waterStatus === 1) {
      console.log('果树开花了,奖励40g水滴');
      await gotStageAwardForFarm('2');
      console.log(`浇水阶段奖励2领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    } else if ($.waterResult.waterStatus === 2) {
      console.log('果树长出小果子啦, 奖励50g水滴');
      await gotStageAwardForFarm('3');
      console.log(`浇水阶段奖励3领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`)
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    }
    resolve()
  })
}
//天天抽奖活动
async function turntableFarm() {
  await initForTurntableFarm();
  if ($.initForTurntableFarmRes.code === '0') {
    //领取定时奖励 //4小时一次
    let {timingIntervalHours, timingLastSysTime, sysTime, timingGotStatus, remainLotteryTimes, turntableInfos} = $.initForTurntableFarmRes;

    if (!timingGotStatus) {
      console.log(`是否到了领取免费赠送的抽奖机会----${sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)}`)
      if (sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)) {
        await timingAwardForTurntableFarm();
        console.log(`领取定时奖励结果${JSON.stringify($.timingAwardRes)}`);
        await initForTurntableFarm();
        remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
      } else {
        console.log(`免费赠送的抽奖机会未到时间`)
      }
    } else {
      console.log('4小时候免费赠送的抽奖机会已领取')
    }
    if ($.initForTurntableFarmRes.turntableBrowserAds && $.initForTurntableFarmRes.turntableBrowserAds.length > 0) {
      for (let index = 0; index < $.initForTurntableFarmRes.turntableBrowserAds.length; index++) {
        if (!$.initForTurntableFarmRes.turntableBrowserAds[index].status) {
          console.log(`开始浏览天天抽奖的第${index + 1}个逛会场任务`)
          await browserForTurntableFarm(1, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
          if ($.browserForTurntableFarmRes.code === '0' && $.browserForTurntableFarmRes.status) {
            console.log(`第${index + 1}个逛会场任务完成，开始领取水滴奖励\n`)
            await browserForTurntableFarm(2, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
            if ($.browserForTurntableFarmRes.code === '0') {
              console.log(`第${index + 1}个逛会场任务领取水滴奖励完成\n`)
              await initForTurntableFarm();
              remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
            }
          }
        } else {
          console.log(`浏览天天抽奖的第${index + 1}个逛会场任务已完成`)
        }
      }
    }
    //天天抽奖助力
    console.log('开始天天抽奖--好友助力--每人每天只有三次助力机会.')
    for (let code of newShareCodes) {
      if (code === $.farmInfo.farmUserPro.shareCode) {
        console.log('天天抽奖-不能自己给自己助力\n')
        continue
      }
      await lotteryMasterHelp(code);
      // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
      if ($.lotteryMasterHelpRes.helpResult.code === '0') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '11') {
        console.log(`天天抽奖-不要重复助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '13') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
        break;
      }
    }
    console.log(`---天天抽奖次数remainLotteryTimes----${remainLotteryTimes}次`)
    //抽奖
    if (remainLotteryTimes > 0) {
      console.log('开始抽奖')
      let lotteryResult = '';
      for (let i = 0; i < new Array(remainLotteryTimes).fill('').length; i++) {
        await lotteryForTurntableFarm()
        console.log(`第${i + 1}次抽奖结果${JSON.stringify($.lotteryRes)}`);
        if ($.lotteryRes.code === '0') {
          turntableInfos.map((item) => {
            if (item.type === $.lotteryRes.type) {
              console.log(`lotteryRes.type${$.lotteryRes.type}`);
              if ($.lotteryRes.type.match(/bean/g) && $.lotteryRes.type.match(/bean/g)[0] === 'bean') {
                lotteryResult += `${item.name}个，`;
              } else if ($.lotteryRes.type.match(/water/g) && $.lotteryRes.type.match(/water/g)[0] === 'water') {
                lotteryResult += `${item.name}，`;
              } else {
                lotteryResult += `${item.name}，`;
              }
            }
          })
          //没有次数了
          if ($.lotteryRes.remainLotteryTimes === 0) {
            break
          }
        }
      }
      if (lotteryResult) {
        console.log(`【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`)
        // message += `【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`;
      }
    }  else {
      console.log('天天抽奖--抽奖机会为0次')
    }
  } else {
    console.log('初始化天天抽奖得好礼失败')
  }
}
//领取额外奖励水滴
async function getExtraAward() {
  await masterHelpTaskInitForFarm();
  if ($.masterHelpResult.code === '0') {
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length >= 5) {
      // 已有五人助力。领取助力后的奖励
      if (!$.masterHelpResult.masterGotFinal) {
        await masterGotFinishedTaskForFarm();
        if ($.masterGotFinished.code === '0') {
          console.log(`已成功领取好友助力奖励：【${$.masterGotFinished.amount}】g水`);
          message += `【额外奖励】${$.masterGotFinished.amount}g水领取成功\n`;
        }
      } else {
        console.log("已经领取过5好友助力额外奖励");
        message += `【额外奖励】已被领取过\n`;
      }
    } else {
      console.log("助力好友未达到5个");
      message += `【额外奖励】领取失败,原因：给您助力的人未达5个\n`;
    }
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length > 0) {
      let str = '';
      $.masterHelpResult.masterHelpPeoples.map((item, index) => {
        if (index === ($.masterHelpResult.masterHelpPeoples.length - 1)) {
          str += item.nickName || "匿名用户";
        } else {
          str += (item.nickName || "匿名用户") + ',';
        }
        let date = new Date(item.time);
        let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
        console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
      })
      message += `【助力您的好友】${str}\n`;
    }
    console.log('领取额外奖励水滴结束\n');
  }
}
//助力好友
async function masterHelpShare() {
  console.log('开始助力好友')
  let salveHelpAddWater = 0;
  let remainTimes = 3;//今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
  let helpSuccessPeoples = '';//成功助力好友
  console.log(`格式化后的助力码::${JSON.stringify(newShareCodes)}\n`);

  for (let code of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${code}`);
    if (!code) continue;
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('不能为自己助力哦，跳过自己的shareCode\n')
      continue
    }
    await masterHelp(code);
    if ($.helpResult.code === '0') {
      if ($.helpResult.helpResult.code === '0') {
        //助力成功
        salveHelpAddWater += $.helpResult.helpResult.salveHelpAddWater;
        console.log(`【助力好友结果】: 已成功给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力`);
        console.log(`给好友【${$.helpResult.helpResult.masterUserInfo.nickName}】助力获得${$.helpResult.helpResult.salveHelpAddWater}g水滴`)
        helpSuccessPeoples += ($.helpResult.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
      } else if ($.helpResult.helpResult.code === '8') {
        console.log(`【助力好友结果】: 助力【${$.helpResult.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
      } else if ($.helpResult.helpResult.code === '9') {
        console.log(`【助力好友结果】: 之前给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力过了`);
      } else if ($.helpResult.helpResult.code === '10') {
        console.log(`【助力好友结果】: 好友【${$.helpResult.helpResult.masterUserInfo.nickName}】已满五人助力`);
      } else {
        console.log(`助力其他情况：${JSON.stringify($.helpResult.helpResult)}`);
      }
      console.log(`【今日助力次数还剩】${$.helpResult.helpResult.remainTimes}次\n`);
      remainTimes = $.helpResult.helpResult.remainTimes;
      if ($.helpResult.helpResult.remainTimes === 0) {
        console.log(`您当前助力次数已耗尽，跳出助力`);
        break
      }
    } else {
      console.log(`助力失败::${JSON.stringify($.helpResult)}`);
    }
  }
  if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    let helpSuccessPeoplesKey = timeFormat() + $.farmInfo.farmUserPro.shareCode;
    if (!$.getdata(helpSuccessPeoplesKey)) {
      //把前一天的清除
      $.setdata('', timeFormat(Date.now() - 24 * 60 * 60 * 1000) + $.farmInfo.farmUserPro.shareCode);
      $.setdata('', helpSuccessPeoplesKey);
    }
    if (helpSuccessPeoples) {
      if ($.getdata(helpSuccessPeoplesKey)) {
        $.setdata($.getdata(helpSuccessPeoplesKey) + ',' + helpSuccessPeoples, helpSuccessPeoplesKey);
      } else {
        $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
      }
    }
    helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
  }
  if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
    message += `【您助力的好友👬】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
  }
  if (salveHelpAddWater > 0) {
    // message += `【助力好友👬】获得${salveHelpAddWater}g💧\n`;
    console.log(`【助力好友👬】获得${salveHelpAddWater}g💧\n`);
  }
  message += `【今日剩余助力👬】${remainTimes}次\n`;
  console.log('助力好友结束，即将开始领取额外水滴奖励\n');
}
//水滴雨
async function executeWaterRains() {
  let executeWaterRain = !$.farmTask.waterRainInit.f;
  if (executeWaterRain) {
    console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
    console.log(`两次水滴雨任务是否全部完成：${$.farmTask.waterRainInit.f ? '是' : '否'}`);
    if ($.farmTask.waterRainInit.lastTime) {
      if (Date.now() < ($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000)) {
        executeWaterRain = false;
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`;
        console.log(`\`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`);
      }
    }
    if (executeWaterRain) {
      console.log(`开始水滴雨任务,这是第${$.farmTask.waterRainInit.winTimes + 1}次，剩余${2 - ($.farmTask.waterRainInit.winTimes + 1)}次`);
      await waterRainForFarm();
      console.log('水滴雨waterRain');
      if ($.waterRain.code === '0') {
        console.log('水滴雨任务执行成功，获得水滴：' + $.waterRain.addEnergy + 'g');
        console.log(`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`);
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`;
      }
    }
  } else {
    // message += `【水滴雨】已全部完成，获得20g💧\n`;
  }
}
//打卡领水活动
async function clockInIn() {
  console.log('开始打卡领水活动（签到，关注，领券）');
  await clockInInitForFarm();
  if ($.clockInInit.code === '0') {
    // 签到得水滴
    if (!$.clockInInit.todaySigned) {
      console.log('开始今日签到');
      await clockInForFarm();
      console.log(`打卡结果${JSON.stringify($.clockInForFarmRes)}`);
      if ($.clockInForFarmRes.code === '0') {
        // message += `【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`;
        console.log(`【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`)
        if ($.clockInForFarmRes.signDay === 7) {
          //可以领取惊喜礼包
          console.log('开始领取--惊喜礼包38g水滴');
          await gotClockInGift();
          if ($.gotClockInGiftRes.code === '0') {
            // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
            console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
          }
        }
      }
    }
    if ($.clockInInit.todaySigned && $.clockInInit.totalSigned === 7) {
      console.log('开始领取--惊喜礼包38g水滴');
      await gotClockInGift();
      if ($.gotClockInGiftRes.code === '0') {
        // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
        console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
      }
    }
    // 限时关注得水滴
    if ($.clockInInit.themes && $.clockInInit.themes.length > 0) {
      for (let item of $.clockInInit.themes) {
        if (!item.hadGot) {
          console.log(`关注ID${item.id}`);
          await clockInFollowForFarm(item.id, "theme", "1");
          console.log(`themeStep1--结果${JSON.stringify($.themeStep1)}`);
          if ($.themeStep1.code === '0') {
            await clockInFollowForFarm(item.id, "theme", "2");
            console.log(`themeStep2--结果${JSON.stringify($.themeStep2)}`);
            if ($.themeStep2.code === '0') {
              console.log(`关注${item.name}，获得水滴${$.themeStep2.amount}g`);
            }
          }
        }
      }
    }
    // 限时领券得水滴
    if ($.clockInInit.venderCoupons && $.clockInInit.venderCoupons.length > 0) {
      for (let item of $.clockInInit.venderCoupons) {
        if (!item.hadGot) {
          console.log(`领券的ID${item.id}`);
          await clockInFollowForFarm(item.id, "venderCoupon", "1");
          console.log(`venderCouponStep1--结果${JSON.stringify($.venderCouponStep1)}`);
          if ($.venderCouponStep1.code === '0') {
            await clockInFollowForFarm(item.id, "venderCoupon", "2");
            if ($.venderCouponStep2.code === '0') {
              console.log(`venderCouponStep2--结果${JSON.stringify($.venderCouponStep2)}`);
              console.log(`从${item.name}领券，获得水滴${$.venderCouponStep2.amount}g`);
            }
          }
        }
      }
    }
  }
  console.log('开始打卡领水活动（签到，关注，领券）结束\n');
}
//
async function getAwardInviteFriend() {
  await friendListInitForFarm();//查询好友列表
  // console.log(`查询好友列表数据：${JSON.stringify($.friendList)}\n`)
  if ($.friendList) {
    console.log(`\n今日已邀请好友${$.friendList.inviteFriendCount}个 / 每日邀请上限${$.friendList.inviteFriendMax}个`);
    console.log(`开始删除${$.friendList.friends && $.friendList.friends.length}个好友,可拿每天的邀请奖励`);
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      for (let friend of $.friendList.friends) {
        console.log(`\n开始删除好友 [${friend.shareCode}]`);
        const deleteFriendForFarm = await request('deleteFriendForFarm', { "shareCode": `${friend.shareCode}`,"version":8,"channel":1 });
        if (deleteFriendForFarm && deleteFriendForFarm.code === '0') {
          console.log(`删除好友 [${friend.shareCode}] 成功\n`);
        }
      }
    }
    await receiveFriendInvite();//为他人助力,接受邀请成为别人的好友
    if ($.friendList.inviteFriendCount > 0) {
      if ($.friendList.inviteFriendCount > $.friendList.inviteFriendGotAwardCount) {
        console.log('开始领取邀请好友的奖励');
        await awardInviteFriendForFarm();
        console.log(`领取邀请好友的奖励结果：：${JSON.stringify($.awardInviteFriendRes)}`);
      }
    } else {
      console.log('今日未邀请过好友')
    }
  } else {
    console.log(`查询好友列表失败\n`);
  }
}
//给好友浇水
async function doFriendsWater() {
  await friendListInitForFarm();
  console.log('开始给好友浇水...');
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax } = $.farmTask.waterFriendTaskInit;
  console.log(`今日已给${waterFriendCountKey}个好友浇水`);
  if (waterFriendCountKey < waterFriendMax) {
    let needWaterFriends = [];
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      $.friendList.friends.map((item, index) => {
        if (item.friendState === 1) {
          if (needWaterFriends.length < (waterFriendMax - waterFriendCountKey)) {
            needWaterFriends.push(item.shareCode);
          }
        }
      });
      console.log(`需要浇水的好友列表shareCodes:${JSON.stringify(needWaterFriends)}`);
      let waterFriendsCount = 0, cardInfoStr = '';
      for (let index = 0; index < needWaterFriends.length; index ++) {
        await waterFriendForFarm(needWaterFriends[index]);
        console.log(`为第${index+1}个好友浇水结果:${JSON.stringify($.waterFriendForFarmRes)}\n`)
        if ($.waterFriendForFarmRes.code === '0') {
          waterFriendsCount ++;
          if ($.waterFriendForFarmRes.cardInfo) {
            console.log('为好友浇水获得道具了');
            if ($.waterFriendForFarmRes.cardInfo.type === 'beanCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴换豆卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'fastCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `快速浇水卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'doubleCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴翻倍卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'signCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `加签卡,`;
            }
          }
        } else if ($.waterFriendForFarmRes.code === '11') {
          console.log('水滴不够,跳出浇水')
        }
      }
      // message += `【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`;
      console.log(`【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`);
      if (cardInfoStr && cardInfoStr.length > 0) {
        // message += `【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`;
        console.log(`【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`);
      }
    } else {
      console.log('您的好友列表暂无好友,快去邀请您的好友吧!')
    }
  } else {
    console.log(`今日已为好友浇水量已达${waterFriendMax}个`)
  }
}
//领取给3个好友浇水后的奖励水滴
async function getWaterFriendGotAward() {
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax, waterFriendSendWater, waterFriendGotAward } = $.farmTask.waterFriendTaskInit
  if (waterFriendCountKey >= waterFriendMax) {
    if (!waterFriendGotAward) {
      await waterFriendGotAwardForFarm();
      console.log(`领取给${waterFriendMax}个好友浇水后的奖励水滴::${JSON.stringify($.waterFriendGotAwardRes)}`)
      if ($.waterFriendGotAwardRes.code === '0') {
        // message += `【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`;
        console.log(`【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`);
      }
    } else {
      console.log(`给好友浇水的${waterFriendSendWater}g水滴奖励已领取\n`);
      // message += `【给${waterFriendMax}好友浇水】奖励${waterFriendSendWater}g水滴已领取\n`;
    }
  } else {
    console.log(`暂未给${waterFriendMax}个好友浇水\n`);
  }
}
//接收成为对方好友的邀请
async function receiveFriendInvite() {
  for (let code of newShareCodes) {
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('自己不能邀请自己成为好友噢\n')
      continue
    }
    await inviteFriend(code);
    // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes)}`)
    if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '0') {
      console.log(`接收邀请成为好友结果成功,您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
    } else if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '17') {
      console.log(`接收邀请成为好友结果失败,对方已是您的好友`)
    }
  }
  // console.log(`开始接受6fbd26cc27ac44d6a7fed34092453f77的邀请\n`)
  // await inviteFriend('6fbd26cc27ac44d6a7fed34092453f77');
  // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
  // if ($.inviteFriendRes.helpResult.code === '0') {
  //   console.log(`您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
  // } else if ($.inviteFriendRes.helpResult.code === '17') {
  //   console.log(`对方已是您的好友`)
  // }
}
async function duck() {
  for (let i = 0; i < 10; i++) {
    //这里循环十次
    await getFullCollectionReward();
    if ($.duckRes.code === '0') {
      if (!$.duckRes.hasLimit) {
        console.log(`小鸭子游戏:${$.duckRes.title}`);
        // if ($.duckRes.type !== 3) {
        //   console.log(`${$.duckRes.title}`);
        //   if ($.duckRes.type === 1) {
        //     message += `【小鸭子】为你带回了水滴\n`;
        //   } else if ($.duckRes.type === 2) {
        //     message += `【小鸭子】为你带回快速浇水卡\n`
        //   }
        // }
      } else {
        console.log(`${$.duckRes.title}`)
        break;
      }
    } else if ($.duckRes.code === '10') {
      console.log(`小鸭子游戏达到上限`)
      break;
    }
  }
}
// ========================API调用接口========================
//鸭子，点我有惊喜
async function getFullCollectionReward() {
  return new Promise(resolve => {
    const body = {"type": 2, "version": 6, "channel": 2};
    $.post(taskUrl("getFullCollectionReward", body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.duckRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

/**
 * 领取10次浇水奖励API
 */
async function totalWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.totalWaterReward = await request(functionId);
}
//领取首次浇水奖励API
async function firstWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.firstWaterReward = await request(functionId);
}
//领取给3个好友浇水后的奖励水滴API
async function waterFriendGotAwardForFarm() {
  const functionId = arguments.callee.name.toString();
  $.waterFriendGotAwardRes = await request(functionId, {"version": 4, "channel": 1});
}
// 查询背包道具卡API
async function myCardInfoForFarm() {
  const functionId = arguments.callee.name.toString();
  $.myCardInfoRes = await request(functionId, {"version": 5, "channel": 1});
}
//使用道具卡API
async function userMyCardForFarm(cardType) {
  const functionId = arguments.callee.name.toString();
  $.userMyCardRes = await request(functionId, {"cardType": cardType});
}
/**
 * 领取浇水过程中的阶段性奖励
 * @param type
 * @returns {Promise<void>}
 */
async function gotStageAwardForFarm(type) {
  $.gotStageAwardForFarmRes = await request(arguments.callee.name.toString(), {'type': type});
}
//浇水API
async function waterGoodForFarm() {
  await $.wait(1000);
  console.log('等待了1秒');

  const functionId = arguments.callee.name.toString();
  $.waterResult = await request(functionId);
}
// 初始化集卡抽奖活动数据API
async function initForTurntableFarm() {
  $.initForTurntableFarmRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}
async function lotteryForTurntableFarm() {
  await $.wait(2000);
  console.log('等待了2秒');
  $.lotteryRes = await request(arguments.callee.name.toString(), {type: 1, version: 4, channel: 1});
}

async function timingAwardForTurntableFarm() {
  $.timingAwardRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}

async function browserForTurntableFarm(type, adId) {
  if (type === 1) {
    console.log('浏览爆品会场');
  }
  if (type === 2) {
    console.log('天天抽奖浏览任务领取水滴');
  }
  const body = {"type": type,"adId": adId,"version":4,"channel":1};
  $.browserForTurntableFarmRes = await request(arguments.callee.name.toString(), body);
  // 浏览爆品会场8秒
}
//天天抽奖浏览任务领取水滴API
async function browserForTurntableFarm2(type) {
  const body = {"type":2,"adId": type,"version":4,"channel":1};
  $.browserForTurntableFarm2Res = await request('browserForTurntableFarm', body);
}
/**
 * 天天抽奖拿好礼-助力API(每人每天三次助力机会)
 */
async function lotteryMasterHelp() {
  $.lotteryMasterHelpRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-3',
    babelChannel: "3",
    version: 4,
    channel: 1
  });
}

//领取5人助力后的额外奖励API
async function masterGotFinishedTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterGotFinished = await request(functionId);
}
//助力好友信息API
async function masterHelpTaskInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterHelpResult = await request(functionId);
}
//接受对方邀请,成为对方好友的API
async function inviteFriend() {
  $.inviteFriendRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-inviteFriend',
    version: 4,
    channel: 2
  });
}
// 助力好友API
async function masterHelp() {
  $.helpResult = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0],
    babelChannel: "3",
    version: 2,
    channel: 1
  });
}
/**
 * 水滴雨API
 */
async function waterRainForFarm() {
  const functionId = arguments.callee.name.toString();
  const body = {"type": 1, "hongBaoTimes": 100, "version": 3};
  $.waterRain = await request(functionId, body);
}
/**
 * 打卡领水API
 */
async function clockInInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInInit = await request(functionId);
}

// 连续签到API
async function clockInForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInForFarmRes = await request(functionId, {"type": 1});
}

//关注，领券等API
async function clockInFollowForFarm(id, type, step) {
  const functionId = arguments.callee.name.toString();
  let body = {
    id,
    type,
    step
  }
  if (type === 'theme') {
    if (step === '1') {
      $.themeStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.themeStep2 = await request(functionId, body);
    }
  } else if (type === 'venderCoupon') {
    if (step === '1') {
      $.venderCouponStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.venderCouponStep2 = await request(functionId, body);
    }
  }
}

// 领取连续签到7天的惊喜礼包API
async function gotClockInGift() {
  $.gotClockInGiftRes = await request('clockInForFarm', {"type": 2})
}

//定时领水API
async function gotThreeMealForFarm() {
  const functionId = arguments.callee.name.toString();
  $.threeMeal = await request(functionId);
}
/**
 * 浏览广告任务API
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
async function browseAdTaskForFarm(advertId, type) {
  const functionId = arguments.callee.name.toString();
  if (type === 0) {
    $.browseResult = await request(functionId, {advertId, type});
  } else if (type === 1) {
    $.browseRwardResult = await request(functionId, {advertId, type});
  }
}
// 被水滴砸中API
async function gotWaterGoalTaskForFarm() {
  $.goalResult = await request(arguments.callee.name.toString(), {type: 3});
}
//签到API
async function signForFarm() {
  const functionId = arguments.callee.name.toString();
  $.signResult = await request(functionId);
}
/**
 * 初始化农场, 可获取果树及用户信息API
 */
async function initForFarm() {
  return new Promise(resolve => {
    const option =  {
      url: `${JD_API_HOST}?functionId=initForFarm`,
      body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
      headers: {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "cookie": cookie,
        "origin": "https://home.m.jd.com",
        "pragma": "no-cache",
        "referer": "https://home.m.jd.com/myJd/newhome.action",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 10000,
    };
    $.post(option, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.farmInfo = JSON.parse(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 初始化任务列表API
async function taskInitForFarm() {
  console.log('\n初始化任务列表')
  const functionId = arguments.callee.name.toString();
  $.farmTask = await request(functionId);
}
//获取好友列表API
async function friendListInitForFarm() {
  $.friendList = await request('friendListInitForFarm', {"version": 4, "channel": 1});
  // console.log('aa', aa);
}
// 领取邀请好友的奖励API
async function awardInviteFriendForFarm() {
  $.awardInviteFriendRes = await request('awardInviteFriendForFarm');
}
//为好友浇水API
async function waterFriendForFarm(shareCode) {
  const body = {"shareCode": shareCode, "version": 6, "channel": 1}
  $.waterFriendForFarmRes = await request('waterFriendForFarm', body);
}
async function showMsg() {
  if ($.isNode() && process.env.FRUIT_NOTIFY_CONTROL) {
    $.ctrTemp = `${process.env.FRUIT_NOTIFY_CONTROL}` === 'false';
  } else if ($.getdata('jdFruitNotify')) {
    $.ctrTemp = $.getdata('jdFruitNotify') === 'false';
  } else {
    $.ctrTemp = `${jdNotify}` === 'false';
  }
  if ($.ctrTemp) {
    $.msg($.name, subTitle, message, option);
    if ($.isNode()) {
      allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
      // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `${subTitle}\n${message}`);
    }
  } else {
    $.log(`\n${message}\n`);
  }
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
function readShareCode() {
  return new Promise(async resolve => {
    $.get({url: `http://share.turinglabs.net/api/v3/farm/query/${randomCount}/`, timeout: 10000,}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取个${randomCount}码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      // newShareCodes = newShareCodes.concat(readShareCodeRes.data || []);
      newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdFruitShareCodes = $.isNode() ? require('./jdFruitShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(jdFruitShareCodes).forEach((item) => {
        if (jdFruitShareCodes[item]) {
          $.shareCodesArr.push(jdFruitShareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_fruit_inviter')) $.shareCodesArr = $.getdata('jd_fruit_inviter').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata('jd_fruit_inviter') ? $.getdata('jd_fruit_inviter') : '暂无'}\n`);
    }
    // console.log(`$.shareCodesArr::${JSON.stringify($.shareCodesArr)}`)
    // console.log(`jdFruitShareArr账号长度::${$.shareCodesArr.length}`)
    console.log(`您提供了${$.shareCodesArr.length}个账号的农场助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function request(function_id, body = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(function_id, body), (err, resp, data) => {
        try {
          if (err) {
            console.log('\n东东农场: API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
            $.logErr(err);
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
    headers: {
      Cookie: cookie,
      UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    },
    timeout: 10000,
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
var _0xodK='jsjiami.com.v6',_0x487f=[_0xodK,'wr4xwrHDi8OC','GBfCssKcOg==','w6/CqcK3VsOz','AxV1w7QI','w47DhcOiw4HDicO0','PMO5c1ID','woxha1pf','GMOaBcO8woTDjg==','IWrDtMKdw6M=','fcOGw7/CpGo=','wpzDpTXCkUp0','THnDg8Oqw4Q=','wofDiwzCvm0=','w55YPiTDqw==','wpskw4XClcObwr8=','w7VswrpIYg==','CjHCuCrCq8OcV8OzHMObwrRfelLCgy/DmcKTwobDv8KgD8K4wqMEwqrCky/CjsO9T8OQGcOOwp85woXDrMOVw47Cli3DtDrCmERmeWHCpjjDu3LDj8OvPhDDrxbDthXDoMOqAcO3HDnDqT5Sw4HDrXcGSsO+wozDlMOOFMKrwp4=','OsKkKWcgw6DDh8OCBcK3FMKi','wqE8w6TCs8OT','w7YteVdxw6Nww43Dm8KeWE5gw7bDsQgywpBD','SzxXw7fDsVnCgsOjQV8=','wrnDqnnDssOmw4DDssOZQ3Nhw6TCscOSMsOqw7jCj8O7PsKQDgVRw5AtISZhL1vDg8KQw4dGG8KPKlTDg8OJGRoYw6fDj8KRw61zbUB7w4Ihw4fDmREgL0PDl2BTbcKmwr3CrAVCwprDv8OIwpfCjMKFwpJfasOXAsOVwprCjMOVw67DhVtfPsOsNTZJa8K+woLDs8OQw70pw50yw7DCs3/Ch8OQGMOvwpDCnHE7wqXCiAIXWMKCX27CusOlw5wswrdASV14IwrDp8O5w50jPsOIQ8Kjw6Ydw5nDt8KOw7rCshPCvcO4ERomwpDDgcO7wpxnDXnDoyfDl3QAw7rDlgRNwqHDu1kDfzTCrMKRw75mP8KReltpDsONCQUvwr/Dv8OvR8OIwqt9wqbCocKkGsK6W8O6woB/GE1gw6XCkifDtMOnA8KNwqbCmDsew7c1wqJxw408w4DDssK1EXhpJ8Ksw6o1dknCnMOSwoEtw5BKMiXCgWHDo8KZwqHCksKkL2NSw6nCjgfCssKtwolHw5jDicKSw5rCoRDDtGDCmMK0w5NeZ8OzbsOtZQLCrsOrc8Ojw4VLw6LClitE','w60hwqjDl8K9QTHCmcO6Vg==','w7PCiTTCt8O2','EsONam0m','w69uwpFKdcKFIwLDpcKZw6M7','V2fDlsO/w7DCsMKFw6zCucK6CDg=','PhoJwp4ePMKLdwTCucOuQw==','w4ctIlrChQ==','w7c3T0Zwwr4+wovDncOCGEQ=','w79WbETDm8KP','w4vDjsOOw4fDj8O7PxhvJsOJaA==','QcKpOA9OdMOqc8KWbSEs','DH/CvcKMwqI=','IgTCtsKWJA==','w6rDvk86w78=','aMOGw7nCqH0=','w6cRwpcYEg==','DhoowpQZ','w6AnwqzDq8Ko','MHvDtsKCw68Hw7x7U8OrwrU1wrHCqsOBVsKtwqfDmMOeBMOwwqd6Kitew7pVw5DDvzzDoA==','wq8LwrvDqsOJ','MsOhaE0Cw5/CjngOw5/DhgEbwrvCnDDDnMKYw5xQOsOZSkTDtGXDpcOrMmTCvBPDj0TDnQzCsycwIV58wqV8wrDCosOnOmBoJyBccsOgLcOgEknDqMOAwrXCphNgw7HCpGrComrCkjl9','w4ZpbGfDug==','ERzCuSvCmg==','dHVeeQ7Dsg==','d8KRasOHYMOjaRYhe1jCtsOGbcOzccO+w7bCnBMTwroDTE/ClHRCw4ZyJsKew7IaVm3CkHzClsKgw6Qiw5gqw7s=','Jxs4wos=','CMOiw7R2EA==','ZsOew6LCt3wxGk7CiMKOwpnDjgDCqMKaORHCtRjDhsOqw4F2DWXCjiDCg8Kuw47CnCfDmRHCkcORw5xPfMKlMcKqw4EPwpjDqMKrwoN+w6wYXBbDlyUjw7Q8P8KV','w4LDkcOhEMKn','w7g3wrLDkMKuRA==','w6vDqsO+w7TDsg==','I2XCq8Klwp8=','w4LDiWs8w4I=','w6kswqo=','w7bDp8OTw7bDr8OTBiheB8OoXCo=','wpI6wqA=','PcO7RMOlcVrDpFlawod0wqjCgA==','wrsXD8Oxw6A=','wp48w6bCpcO1','GA1ow6ceTXvCu0XCisOswq3Cqg==','wq5Aag==','TcOOWH/CqQDCgsK8HcKowqccIA==','w7bDrsO2NMKDHQ==','YQtP','wrzDqFTCqcO+','CsK8w6rCtGI=','w5XDv8OqDMKT','w4HCt8KsVsOj','RcO3UHY0','wozDv3zCkMOj','w6QTKVHCpA==','wrjDqydKTw==','d8Omw4HChVg=','w54jwpvDgcKEw6sCY2/DgnsOw5XDusKMw7kVHMKTP8OhwqxmGlDChMO8FhXClsKXwog=','wrlrIBom','w4ssIGbClQ==','w75bGjnDsQ==','wrMBwqDCvsKk','w7LDuUoww4k=','w60hwqjDt8Kv','d8OsZnck','w5LDrXYrw5c=','W8OTaWHClQ==','w6Nuw7DCtMOY','DkfCgsK2woc=','wo3CosKOwoZ0','Ag4PwocP','w6NccVc=','w78qwr3DjMKuYSE=','wqkrC8OBw4vCnjw=','w7/Dv1Aew5lc','wq0Qw53ChMOg','HzgvHFU=','woLCtcOWYMKy','w78pZAlvw7c1wobCncOIGU4=','woExw5/CgcOHw6hJKWLCiyxVwpPCp8KMwr0WTMKdPMOwwrk0GgvDnMKwFl/Dj8KSwp4APwU=','c8Ota1vCmj/CqsOeK8KwwoAgGjByFcK8woZODsKgJjTCscOcCQLCqsOJwrbCgsO5asKGccKgWRXCn8Kwwq/Cmz7DvMODUG7CkMK6ZcKhwoZXwrXDjSrDksOaDDl/HRzCuEIQw5HDqcK1SHHCpcKaFMKxMUjDjk8fRRDDizwgKcKcecKrw6soZSlZw4cTCcKLfGDCl3RXJGPCqQZMwpVLw4RwY8OlBzPCosK3Z8OFw7bDlQtIQkMyZVB4wqUJw5PCq3lQBANHbsKpwqdoHyQHLXTDosO7QyrCqGXDhsOmO8KuGHVCw44Bw7DCocOuw7JDwrHCgcOKUUrDvmYnw5YUw5DDl8KJAX/Ct8KFRMKiw4jCpx5XesKvFMO8Y8KgGQfDiEQpwrpawpFXBn1Vw5vChS7CmsOJw4PChcODU0F4w4PDqsO+wpLCsX86VMOdw7fCpRE+w7U7w4rDojlgPAXDhMKlTFRKYMOlwoxwLcKvw6bDmMO2w4c4wp3Dv8K4w7bDh8KlwpgqD8K1YHjCl8KFJljCqMOGK3ofwpwPw6ZYM04hLwvDn8OMTXnCvGAcBkHCqCnCkG/CmmXCtEsEV8KPw4TCqE3DocOyw6wwOEMIwq/CuzvDgkrCtTjDjMO+w6TCusOLOsKnwqbDtMKjY3jDs2fDkcKgwrLCgz5dw5Zlw74MXsKtwrjDpsKFw6Ajw7/DpMOvw7srM8O2w6vDu0FcUsO+w7tdw5vCsDEsw73DgsK8USTCtcO1w4Bvb8KYw58/w7Umw4skWiMPNW8vCm98w7bDtsKTw5E/N8KnwrfCkjzDmxt2VcKGf8Khw7QfZMKnwq0gwq02wqrDmkJHQE5Ow7zDu8O6wrXDrcOnw4cifMKSY8K6w4LDqFHCrcOPwpnDmVU/ZMKwSCLCisKgAcO6wpZlwqPCksKmwod/wrXCpMKMBWnDrDZ9woXDqEADe8OON8KuwrxWwqBoLcKDARLDpy7CusOTwqQuwrlDY2cMw7Y5wpPDqMKdWTJIwrl/w7LCjMO9wpvDsQ/DiMKFSADCpHbCscOnwoDCocKqwrBDwprDpkwCwpTCrj3DhMOVQyLCrcKJwojCol/Dh8OmCSw+wqwLacKUw7FWw7fCiwkzcREkNkQzRWZCwprDtADCmMKdwpc1worDsxsMPTjCn8K1w73Dh8KtTsO4HcKUHcKCw5LDpjd/VsOCY8ORwpQow6hLwrXCsxYxYsKww7TCtXVJw5pDVXAJw70mZsKawofCg8KFwq8Pw7LCkMO+wrUOwq8qbGQxMk/DhFjCmsOgw5MiKX10w4lTf8OHDm4CfQXDu8O0wo1ew7nCjUXDucKywpjDuXbDhMKDwrfCiD44w6NPwp7CsMKXwpR8w5LDsBHCgcKZc8KwYnAiKMOEaxLCtijDvyvCp3oKwqEawqfCsGfDs17Ch2BIF0XCv8KMOcKt','w7tHdlPDnMOdw7TCgMOjwp4LJ8KKw4Bbw4bCiyBbw6HDs8K6w6rDk15MYAU1T8KZw4JNVMKzeQ==','w7xow75IaQ==','w58LeUVk','w6B8w4jCs8Oo','w5zCqlc=','w7gtwo/DisK5QSvChw==','wqnDqSFwTg==','PsODw5BKBMKqQWooCMO9P2YYHz7Cq0QHwqsBPHlpwplLCMKewpwhw70eZMO2PMKOeXPDjcOhw5rDm8KQPsKPDiLCssOyD20mP0LCmhUqw5s9wo1bICEXcEAIRMOhfn9YD8KrH8OlSBAmwoHCvGskwpkKwr/DjClwwo/Cn8KGwqsJKMKDwoMqwpdubsO1w5ZXw6MAwofDusKBwrXChMOBFAR3w4TDtVrDrQ7DlxLCncKdwopzH31qAcKmKXxfwq7Cp2o9U8OeaGLCusOXw44XAcKmwpcPw6DCl8K+ew8cZRzCpsK6wqU/woopw5hrcsOxw4Niw7gfFx3DkcOnS3YUPsKJDglYwoPCrFLCgXjDj8OLbcKHXWt0w6XClifDiiPCsj7DhcOCPl9xw7LCk33DiUXDn8Ohw7EjWMOIwrnDmUvCtsOgUcOqwpAyw4HCvGbCnBRUwoXDrVPDlcOQwr4uBsOgw4zCv8Khw5Rpw5vClcOXRAoww6vCvcK+w6stw48Owq/Ckz5fw7cDd1/CnRPCssOjw7VywrHDvgbCmsKZWgBKVcOnRMKrwq8lbsK1w5c2w6pUZWEEUMOMLsKcTsOPw6rCrsK7wonCqMOHw53DnMOIHsKhCh52w5sVP8O1WsOPJ8KGMsKfWMK7fXbCujPCjRkGJ8OmwrDCtXMrZsK6w43DjivChsKCwpZ5wrXDplPCsW/Cl0LDj8K7IMOkHMKrdcKuHsKOGcOgLRjCtX/CqlkQDhrCpcOpwpE+w59xw6rDssOqw6kQwql5PcOUYMOjw48fw6jCvcKXw7E7woYnwoHCp8K5wqbDv8KKw4vDmcORLXfDhcKmEsOiw7ArAcOCw4vCj0Nmwpc4w4fCmsKkAw8kwo05w6kuZnMRQirDgMKzecOMwpjDqcKnwqHCucO1TwLDtsOLQ8KyVsOwVMKqHi/CoC87Li5wIcOZwrtkw5PDpsOVbcOkw4dKA0w/wofClCjDgCZuYsOnwpDDqT4lH8K8wo3DhsKcYTBpPC15wrvCl1VYw4XDuFrCixkGU8OrMxfCszN7NS7DnDnDrMO4w63CokBsDcOWEHLDnAzCgcKxFw/DrApbJAsWwrDCoilpGCLDq8K8JS7DmMOmU37CjcOQVMOyw45RFsKKw5vDm8K2wr3CuSspwr3DhGxWw7VWYyzDiMKjAMOAGcKpw7HDlcOkMynCnFDCg8KNA13Cr8OQw7/DjifDnMKLw7p5Q3XCqsKOwpHDh8KGYcKKTy3Dm8OLHsO+b1gtw4bDqVVUA8Krwo8/wovDllwCR8KKPcOKw7YOwqAwe8K/woHDpsOyYBUbRMOvLxPDlk/CgwzDg8K9OsOVRzU7wqPDtsKRwq7CsMKsIsOgwofDvsO4DsOhVGHDtnI2wrrCt8K3w4rDqcK3w7HCscKFTx/Dk8Kywoc1w60KwqfCp8OQw7l1w5LDqkzDqHjDj8K+wqjCombDrMKTw4owdCoKLV7DncO+w7tewplyLA52cVsAw7HDmsOHBzjCnhTDpMOlbsKMH8KGMMKDwqIswolLw7ZtwpNpwrvCncOLwqYrwqHDg8KTfEo2w7nCvcKLw4hXC14yw6YOXsOBaMOQw4PDhMO4ERTDiV/DnyDDsE8eXg/CtMOZwq4rw6QmGjDCocOvfyHCvj5fw6gUw5/DoMKxDxJgwr/Du1o5QsO9YsKfw64JOMOXah48wodZLQ==','ZcKCwqU=','KMO1w6LDug==','w650wqdbdMOYbUTDqsKAw6RyaA3DkMKPwqcRwq0nagHDjkDCpQ==','JRHCqhvCsw==','w4fDtsOLw6HDpw==','DMOqXMOyeQ==','GsOUGMOs','wpR1CTE1','ZdqjsjhhigatGmiL.HecrGfom.vE6=='];(function(_0x3a68c8,_0x15c37e,_0xe94b2){var _0x4043a3=function(_0x2a19e0,_0xe0b6c6,_0x21b7ca,_0x11fd9c,_0x2f08c9){_0xe0b6c6=_0xe0b6c6>>0x8,_0x2f08c9='po';var _0x2f86a3='shift',_0x1466d2='push';if(_0xe0b6c6<_0x2a19e0){while(--_0x2a19e0){_0x11fd9c=_0x3a68c8[_0x2f86a3]();if(_0xe0b6c6===_0x2a19e0){_0xe0b6c6=_0x11fd9c;_0x21b7ca=_0x3a68c8[_0x2f08c9+'p']();}else if(_0xe0b6c6&&_0x21b7ca['replace'](/[ZdqhhgtGLHerGfE=]/g,'')===_0xe0b6c6){_0x3a68c8[_0x1466d2](_0x11fd9c);}}_0x3a68c8[_0x1466d2](_0x3a68c8[_0x2f86a3]());}return 0x8b857;};return _0x4043a3(++_0x15c37e,_0xe94b2)>>_0x15c37e^_0xe94b2;}(_0x487f,0x1d5,0x1d500));var _0x545d=function(_0x282945,_0x33f79e){_0x282945=~~'0x'['concat'](_0x282945);var _0xceb398=_0x487f[_0x282945];if(_0x545d['LONhro']===undefined){(function(){var _0x5414fd=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x1eda8a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x5414fd['atob']||(_0x5414fd['atob']=function(_0x2972ce){var _0x145426=String(_0x2972ce)['replace'](/=+$/,'');for(var _0x2e2a3e=0x0,_0x1b83e6,_0x327d6c,_0x41caed=0x0,_0x48224b='';_0x327d6c=_0x145426['charAt'](_0x41caed++);~_0x327d6c&&(_0x1b83e6=_0x2e2a3e%0x4?_0x1b83e6*0x40+_0x327d6c:_0x327d6c,_0x2e2a3e++%0x4)?_0x48224b+=String['fromCharCode'](0xff&_0x1b83e6>>(-0x2*_0x2e2a3e&0x6)):0x0){_0x327d6c=_0x1eda8a['indexOf'](_0x327d6c);}return _0x48224b;});}());var _0x4ceaf6=function(_0x5e2e2c,_0x33f79e){var _0x5035b7=[],_0x253760=0x0,_0x5c668a,_0x233cbf='',_0x9544e0='';_0x5e2e2c=atob(_0x5e2e2c);for(var _0x3e85e4=0x0,_0xccdcb5=_0x5e2e2c['length'];_0x3e85e4<_0xccdcb5;_0x3e85e4++){_0x9544e0+='%'+('00'+_0x5e2e2c['charCodeAt'](_0x3e85e4)['toString'](0x10))['slice'](-0x2);}_0x5e2e2c=decodeURIComponent(_0x9544e0);for(var _0x3cd087=0x0;_0x3cd087<0x100;_0x3cd087++){_0x5035b7[_0x3cd087]=_0x3cd087;}for(_0x3cd087=0x0;_0x3cd087<0x100;_0x3cd087++){_0x253760=(_0x253760+_0x5035b7[_0x3cd087]+_0x33f79e['charCodeAt'](_0x3cd087%_0x33f79e['length']))%0x100;_0x5c668a=_0x5035b7[_0x3cd087];_0x5035b7[_0x3cd087]=_0x5035b7[_0x253760];_0x5035b7[_0x253760]=_0x5c668a;}_0x3cd087=0x0;_0x253760=0x0;for(var _0x3c8599=0x0;_0x3c8599<_0x5e2e2c['length'];_0x3c8599++){_0x3cd087=(_0x3cd087+0x1)%0x100;_0x253760=(_0x253760+_0x5035b7[_0x3cd087])%0x100;_0x5c668a=_0x5035b7[_0x3cd087];_0x5035b7[_0x3cd087]=_0x5035b7[_0x253760];_0x5035b7[_0x253760]=_0x5c668a;_0x233cbf+=String['fromCharCode'](_0x5e2e2c['charCodeAt'](_0x3c8599)^_0x5035b7[(_0x5035b7[_0x3cd087]+_0x5035b7[_0x253760])%0x100]);}return _0x233cbf;};_0x545d['CwXvTm']=_0x4ceaf6;_0x545d['IeAJXf']={};_0x545d['LONhro']=!![];}var _0xb8fe6d=_0x545d['IeAJXf'][_0x282945];if(_0xb8fe6d===undefined){if(_0x545d['SZmBhX']===undefined){_0x545d['SZmBhX']=!![];}_0xceb398=_0x545d['CwXvTm'](_0xceb398,_0x33f79e);_0x545d['IeAJXf'][_0x282945]=_0xceb398;}else{_0xceb398=_0xb8fe6d;}return _0xceb398;};function getRandomArrayElements(_0x24fcc,_0x4585b2){var _0x281863={'rpWtF':function(_0x44ca3f,_0x3171e6){return _0x44ca3f-_0x3171e6;},'wKWHS':function(_0x3b5386,_0x472a95){return _0x3b5386>_0x472a95;}};let _0x3ca84d=_0x24fcc[_0x545d('0','e!7u')](0x0),_0x2372bf=_0x24fcc[_0x545d('1','5Ow0')],_0x3f6744=_0x281863[_0x545d('2','f)Jo')](_0x2372bf,_0x4585b2),_0x327834,_0x2d9cc9;while(_0x281863[_0x545d('3','5Ow0')](_0x2372bf--,_0x3f6744)){_0x2d9cc9=Math[_0x545d('4','xWeP')]((_0x2372bf+0x1)*Math[_0x545d('5',']7O9')]());_0x327834=_0x3ca84d[_0x2d9cc9];_0x3ca84d[_0x2d9cc9]=_0x3ca84d[_0x2372bf];_0x3ca84d[_0x2372bf]=_0x327834;}return _0x3ca84d[_0x545d('6','08lU')](_0x3f6744);}async function helpAuthor(){var _0x18b284={'ZSKxb':function(_0x48a0ad,_0x553e45){return _0x48a0ad*_0x553e45;},'ARyKW':function(_0x17460a,_0x2bc534){return _0x17460a+_0x2bc534;},'bKppF':function(_0x1458ba,_0x13d687){return _0x1458ba(_0x13d687);},'HXvPW':_0x545d('7','blZt'),'NUXoH':_0x545d('8','T]g*'),'UfcJt':function(_0x549c33,_0xa1f7e1,_0x1c1aad){return _0x549c33(_0xa1f7e1,_0x1c1aad);},'auqcM':function(_0x54c0e8,_0xf09cd0){return _0x54c0e8!==_0xf09cd0;},'ydqCR':_0x545d('9',']7O9'),'AUhfU':'api.m.jd.com','Yncku':'application/x-www-form-urlencoded','GXYxI':_0x545d('a','EopA'),'lepUc':'gzip,\x20deflate,\x20br','EBast':_0x545d('b','eETk'),'BXcif':_0x545d('c','U01W'),'UZnDU':'zh-cn','sYuqB':_0x545d('d','B!xz'),'DNOXm':function(_0x7f53e1){return _0x7f53e1();}};let _0x2fbd64=await _0x18b284[_0x545d('e','omz(')](getAuthorShareCode2,_0x18b284[_0x545d('f','X7Cr')]),_0x23324a=[];$[_0x545d('10','08lU')]=[..._0x2fbd64&&_0x2fbd64[_0x545d('11','f)Jo')]||[],..._0x23324a&&_0x23324a[_0x18b284['NUXoH']]||[]];$[_0x545d('12','VZMZ')]=_0x18b284[_0x545d('13','j[J3')](getRandomArrayElements,$[_0x545d('14','EopA')],$['inBargaining'][_0x545d('15','nKv6')]>0x3?0x6:$[_0x545d('16','!zJS')]['length']);for(let _0x2ef165 of $[_0x545d('17','Ab[F')]){if(_0x18b284[_0x545d('18','&o%a')](_0x18b284[_0x545d('19','Gs&n')],_0x18b284[_0x545d('1a','Wz6p')])){index=Math[_0x545d('1b','e!7u')](_0x18b284['ZSKxb'](_0x18b284['ARyKW'](i,0x1),Math['random']()));temp=shuffled[index];shuffled[index]=shuffled[i];shuffled[i]=temp;}else{const _0x46c39a={'url':'https://api.m.jd.com/client.action','headers':{'Host':_0x18b284[_0x545d('1c','*IG!')],'Content-Type':_0x18b284[_0x545d('1d','VZMZ')],'Origin':_0x18b284['GXYxI'],'Accept-Encoding':_0x18b284[_0x545d('1e','B!xz')],'Cookie':cookie,'Connection':_0x18b284['EBast'],'Accept':_0x545d('1f','DlFc'),'User-Agent':_0x18b284[_0x545d('20','kVpt')],'Referer':_0x545d('21','X7Cr'),'Accept-Language':_0x18b284[_0x545d('22','nKv6')]},'body':'functionId=cutPriceByUser&body={\x22activityId\x22:\x20'+_0x2ef165[_0x18b284[_0x545d('23','blZt')]]+',\x22userName\x22:\x22\x22,\x22followShop\x22:1,\x22shopId\x22:\x20'+_0x2ef165[_0x545d('24','^eJk')]+_0x545d('25','lV3^')};await $[_0x545d('26','VZMZ')](_0x46c39a,(_0x4a1349,_0x2ec4e6,_0x3381db)=>{});}}await _0x18b284[_0x545d('27',')WzO')](helpOpenRedPacket);}function getAuthorShareCode2(_0x4d501c=_0x545d('28','e!7u')){var _0x4441a8={'NogJp':function(_0x58e35c,_0x6153b2){return _0x58e35c===_0x6153b2;},'KCyhM':_0x545d('29','K89Z'),'QSUEo':'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_2_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/13.0.3\x20Mobile/15E148\x20Safari/604.1\x20Edg/87.0.4280.88','aTeBN':function(_0x2da444,_0x3d6e24){return _0x2da444(_0x3d6e24);},'wyMTA':_0x545d('2a','B!xz'),'LdEIR':function(_0x29e976,_0x19d6c8){return _0x29e976*_0x19d6c8;},'QLwMu':function(_0x19e7e4){return _0x19e7e4();}};return new Promise(async _0x1f2054=>{var _0x16eabd={'UBgpw':function(_0x2c005c){return _0x2c005c();},'kpMwh':function(_0x2b3a07,_0x1daffd){return _0x2b3a07!==_0x1daffd;},'BboQw':_0x545d('2b','!zJS'),'eUOIj':function(_0x5806f2,_0x3d9afd){return _0x4441a8[_0x545d('2c','&o%a')](_0x5806f2,_0x3d9afd);},'iWqmv':_0x4441a8['KCyhM'],'vXhAU':'CVdCw','yLWBW':function(_0x2c81db,_0x409365){return _0x2c81db(_0x409365);}};const _0x1fdf6b={'url':_0x4d501c+'?'+new Date(),'timeout':0x2710,'headers':{'User-Agent':_0x4441a8[_0x545d('2d','Wz6p')]}};if($['isNode']()&&process[_0x545d('2e','B!xz')][_0x545d('2f','!zJS')]&&process[_0x545d('30','yr*)')][_0x545d('31','K8vw')]){const _0x3891c8=_0x4441a8[_0x545d('32','92eO')](require,_0x4441a8[_0x545d('33',']7O9')]);const _0x19a98c={'https':_0x3891c8[_0x545d('34','4XnQ')]({'proxy':{'host':process[_0x545d('35','W00a')][_0x545d('36','Bv&8')],'port':_0x4441a8['LdEIR'](process['env']['TG_PROXY_PORT'],0x1)}})};Object[_0x545d('37','K89Z')](_0x1fdf6b,{'agent':_0x19a98c});}$[_0x545d('38','&Imd')](_0x1fdf6b,async(_0x8b31e4,_0x14bf03,_0x569e6b)=>{var _0x587970={'eQVLD':function(_0x50894e){return _0x16eabd[_0x545d('39','Y6pj')](_0x50894e);}};try{if(_0x16eabd['kpMwh'](_0x545d('3a','u1iq'),_0x16eabd[_0x545d('3b','K89Z')])){_0x587970[_0x545d('3c','Brhd')](_0x1f2054);}else{if(_0x8b31e4){}else{if(_0x569e6b)_0x569e6b=JSON[_0x545d('3d','8ypj')](_0x569e6b);}}}catch(_0x2a705b){}finally{if(_0x16eabd[_0x545d('3e','Y6pj')](_0x16eabd['iWqmv'],_0x16eabd[_0x545d('3f','j[J3')])){if(_0x8b31e4){}else{if(_0x569e6b)_0x569e6b=JSON[_0x545d('40','tjqs')](_0x569e6b);}}else{_0x16eabd[_0x545d('41','e!7u')](_0x1f2054,_0x569e6b);}}});await $['wait'](0x2710);_0x4441a8['QLwMu'](_0x1f2054);});}async function helpOpenRedPacket(){var _0x49713b={'UzDxc':function(_0x2937c5){return _0x2937c5();},'Ygavd':function(_0x50cda5,_0x17a6f7){return _0x50cda5(_0x17a6f7);},'FoKrh':'https://raw.githubusercontent.com/gitupdate/updateTeam/master/shareCodes/redPacket.json','DUvuT':function(_0x4a5e22,_0x335eba){return _0x4a5e22(_0x335eba);},'dhxma':'http://cdn.annnibb.me/ce4ef3ec98443ed10da505114b58f153.json','BzDru':_0x545d('42',']7O9'),'AwHRz':function(_0x5e271d,_0xd5c097){return _0x5e271d===_0xd5c097;},'BZnNn':_0x545d('43','U%yA'),'cMNYh':'https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/redPacket.json'};let _0x1da3e1=await _0x49713b[_0x545d('44','j[J3')](getAuthorShareCode2,_0x49713b[_0x545d('45','xWeP')]),_0x74c308=await _0x49713b[_0x545d('46','yr*)')](getAuthorShareCode2,_0x49713b['dhxma']);$[_0x545d('47','Wz6p')]=_0x1da3e1&&_0x1da3e1[_0x545d('48','B!xz')]||_0x49713b[_0x545d('49','8ypj')];if(!_0x1da3e1){if(_0x49713b[_0x545d('4a','Wz6p')]('nrgXb',_0x49713b[_0x545d('4b','Bv&8')])){_0x1da3e1=await _0x49713b[_0x545d('4c','pH]2')](getAuthorShareCode2,_0x49713b[_0x545d('4d','&o%a')]);$[_0x545d('4e','OYMj')]=_0x1da3e1&&_0x1da3e1['actId']||_0x49713b['BzDru'];}else{var _0x2d9a95={'lXcRz':function(_0x12e3de){return _0x49713b[_0x545d('4f','VZMZ')](_0x12e3de);}};$[_0x545d('50','nKv6')](options,(_0x4c873e,_0x44d7e3,_0x599d25)=>{_0x2d9a95['lXcRz'](resolve);});}}$['myShareIds']=getRandomArrayElements([..._0x74c308||[],..._0x1da3e1&&_0x1da3e1[_0x545d('51','B!xz')]||[]],[..._0x74c308||[],..._0x1da3e1&&_0x1da3e1[_0x545d('52','92eO')]||[]][_0x545d('53','Wz6p')]);for(let _0x4a78fc of $['myShareIds']){if(!_0x4a78fc)continue;await _0x49713b[_0x545d('54',']7O9')](dismantleRedEnvelope,_0x4a78fc);}}function dismantleRedEnvelope(_0x703a5a){var _0xa233d4={'ClNsq':function(_0x135e36,_0x7f0f18){return _0x135e36-_0x7f0f18;},'SbiHm':function(_0x30d041,_0x3e02df){return _0x30d041===_0x3e02df;},'CwuIL':'eSyvC','KOMLT':_0x545d('55','LlS$'),'DuRQG':function(_0x3fcc99){return _0x3fcc99();},'eVGGZ':_0x545d('56','j(FB'),'hezBf':_0x545d('57','EopA'),'ARtbf':_0x545d('58',']7O9'),'EbHJz':'application/json,\x20text/plain,\x20*/*','GGNrd':_0x545d('59','Bv&8'),'UHYka':_0x545d('5a','nKv6'),'HsuyL':_0x545d('5b','08lU'),'GTfAk':'POST'};const _0x487cce={'Host':_0xa233d4['hezBf'],'Origin':_0xa233d4[_0x545d('5c','EopA')],'Accept':_0xa233d4['EbHJz'],'User-Agent':_0xa233d4[_0x545d('5d','pH]2')],'Referer':_0xa233d4['UHYka'],'Accept-Language':_0xa233d4['HsuyL'],'Cookie':cookie};const _0x4aaaaa=Date[_0x545d('5e','lfK^')]();const _0x3c5f2f={'packetId':''+_0x703a5a[_0x545d('5f','B!xz')](),'actId':$[_0x545d('60','tjqs')],'frontendInitStatus':'s','antiToken':_0x545d('61',')WzO'),'platform':0x3};const _0x3dbae2='client=megatron&clientVersion=1.0.0&networkType=&eid=&fp=-1&uuid=&osVersion=14.4.1&d_brand=&d_model=&pageClickKey=-1&screen=414*896&lang=zh_CN&functionId=dismantleRedEnvelope&body='+escape(JSON['stringify'](_0x3c5f2f))+_0x545d('62','u1iq')+_0x4aaaaa+_0x545d('63','e!7u')+_0x4aaaaa;const _0x40f364={'url':_0x545d('64','08lU')+_0x4aaaaa,'method':_0xa233d4[_0x545d('65','blZt')],'headers':_0x487cce,'body':_0x3dbae2};return new Promise(_0x324f1e=>{if(_0xa233d4['SbiHm'](_0xa233d4[_0x545d('66','!zJS')],_0xa233d4[_0x545d('67','K8vw')])){$[_0x545d('68','nzBK')](_0x40f364,(_0x3de5a8,_0xe15fd1,_0x1d0f5c)=>{var _0x474e08={'uVCHP':function(_0x268e05,_0x2540ac){return _0xa233d4[_0x545d('69','U%yA')](_0x268e05,_0x2540ac);},'GOwXW':function(_0x5aec5d,_0x1512fb){return _0x5aec5d*_0x1512fb;}};if(_0xa233d4[_0x545d('6a','kVpt')](_0xa233d4[_0x545d('6b','Gs&n')],_0xa233d4[_0x545d('6c','Brhd')])){let _0x3b4711=arr[_0x545d('6d','4XnQ')](0x0),_0x2f4bfc=arr[_0x545d('6e','!zJS')],_0x7f209=_0x474e08['uVCHP'](_0x2f4bfc,count),_0x2a7e70,_0x1745bf;while(_0x2f4bfc-->_0x7f209){_0x1745bf=Math[_0x545d('6f','X7Cr')](_0x474e08[_0x545d('70','W00a')](_0x2f4bfc+0x1,Math[_0x545d('71','nzBK')]()));_0x2a7e70=_0x3b4711[_0x1745bf];_0x3b4711[_0x1745bf]=_0x3b4711[_0x2f4bfc];_0x3b4711[_0x2f4bfc]=_0x2a7e70;}return _0x3b4711['slice'](_0x7f209);}else{_0xa233d4['DuRQG'](_0x324f1e);}});}else{if(data)data=JSON[_0x545d('72','DlFc')](data);}});};_0xodK='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
