/*
618动物联萌
author:star
解密参考自：https://github.com/yangtingxiao/QuantumultX/blob/master/scripts/jd/jd_zoo.js
活动入口：京东APP-》搜索 玩一玩-》瓜分20亿
邀请好友助力：内部账号自行互助(排名靠前账号得到的机会多)
PK互助：内部账号自行互助(排名靠前账号得到的机会多),多余的助力次数会默认助力作者内置助力码
小程序任务：已完成
地图任务：已添加，下午2点到5点执行,抽奖已添加(基本都是优惠券)
金融APP任务：已完成
活动时间：2021-05-24至2021-06-20
脚本更新时间：2021-06-05 18:30
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
===================quantumultx================
[task_local]
#618动物联萌
33 0,6-23/2 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_zoo.js, tag=618动物联萌, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

=====================Loon================
[Script]
cron "33 0,6-23/2 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_zoo.js, tag=618动物联萌

====================Surge================
618动物联萌 = type=cron,cronexp="33 0,6-23/2 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_zoo.js

============小火箭=========
618动物联萌 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_zoo.js, cronexpr="33 0,6-23/2 * * *", timeout=3600, enable=true
 */
const $ = new Env('618动物联萌');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const pKHelpFlag = true;//是否PK助力  true 助力，false 不助力
const pKHelpAuthorFlag = true;//是否助力作者PK  true 助力，false 不助力
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [];
$.cookie = '';
$.inviteList = [];
$.pkInviteList = [
  "sSKNX-MpqKOJsNu8mJ7RA9BJMup4tAAmPcPPPhBUWYKUJ19UKeC8EAoKeUXELi4h",
];
$.secretpInfo = {};
$.innerPkInviteList = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('活动入口：京东APP-》搜索 玩一玩-》瓜分20亿\n' +
      '邀请好友助力：内部账号自行互助(排名靠前账号得到的机会多)\n' +
      'PK互助：内部账号自行互助(排名靠前账号得到的机会多),多余的助力次数会默认助力作者内置助力码\n' +
      '小程序任务：已完成\n' +
      '地图任务：已添加，下午2点到5点执行,抽奖已添加\n' +
      '金融APP任务：已完成\n' +
      '活动时间：2021-05-24至2021-06-20\n' +
      '脚本更新时间：2021-06-05 18:30\n'
      );
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      $.cookie = cookiesArr[i];
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = $.UserName;
      $.hotFlag = false; //是否火爆
      await TotalBean();
      console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
      console.log(`\n如有未完成的任务，请多执行几次\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await zoo();
      if($.hotFlag)$.secretpInfo[$.UserName] = false;//火爆账号不执行助力
    }
  }
  let res = [], res2 = [], res3 = [];
  res3 = await getAuthorShareCode('https://raw.githubusercontent.com/gitupdate/updateTeam/master/shareCodes/jd_zoo.json');
  if (!res3) await getAuthorShareCode('https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_zoo.json')
  if (new Date().getHours()>= 9) {
    res = await getAuthorShareCode() || [];
    res2 = await getAuthorShareCode('http://cdn.trueorfalse.top/e528ffae31d5407aac83b8c37a4c86bc/') || [];
  }
  // if (new Date().getHours() === 9 ||  (new Date().getHours() === 10 && new Date().getMinutes() < 20)) {
  // }
  if (pKHelpAuthorFlag) {
    $.innerPkInviteList = getRandomArrayElements([...$.innerPkInviteList, ...res, ...res2, ...res3], [...$.innerPkInviteList, ...res, ...res2, ...res3].length);
    $.pkInviteList.push(...$.innerPkInviteList);
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    $.cookie = cookiesArr[i];
    $.canHelp = true;
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    if (!$.secretpInfo[$.UserName]) {
      continue;
    }
    $.secretp = $.secretpInfo[$.UserName];
    $.index = i + 1;
    //console.log($.inviteList);
    //pk助力
    if (new Date().getHours() >= 9) {
      console.log(`\n******开始内部京东账号【怪兽大作战pk】助力*********\n`);
      for (let i = 0; i < $.pkInviteList.length && pKHelpFlag && $.canHelp; i++) {
        console.log(`${$.UserName} 去助力PK码 ${$.pkInviteList[i]}`);
        $.pkInviteId = $.pkInviteList[i];
        await takePostRequest('pkHelp');
        await $.wait(2000);
      }
      $.canHelp = true;
    }
    if ($.inviteList && $.inviteList.length) console.log(`\n******开始内部京东账号【邀请好友助力】*********\n`);
    for (let j = 0; j < $.inviteList.length && $.canHelp; j++) {
      $.oneInviteInfo = $.inviteList[j];
      if ($.oneInviteInfo.ues === $.UserName || $.oneInviteInfo.max) {
        continue;
      }
      //console.log($.oneInviteInfo);
      $.inviteId = $.oneInviteInfo.inviteId;
      console.log(`${$.UserName}去助力${$.oneInviteInfo.ues},助力码${$.inviteId}`);
      //await takePostRequest('helpHomeData');
      await takePostRequest('help');
      await $.wait(2000);
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function zoo() {
  try {
    $.signSingle = {};
    $.homeData = {};
    $.secretp = ``;
    $.taskList = [];
    $.shopSign = ``;
    await takePostRequest('zoo_signSingle');
    if (JSON.stringify($.signSingle) === `{}` || $.signSingle.bizCode !== 0) {
      console.log($.signSingle.bizMsg);
      return;
    } else {
      console.log(`\n获取活动信息`);
    }
    await $.wait(1000);
    await takePostRequest('zoo_getHomeData');
    $.userInfo =$.homeData.result.homeMainInfo
    console.log(`\n\n当前分红：${$.userInfo.raiseInfo.redNum}份，当前等级:${$.userInfo.raiseInfo.scoreLevel}\n当前金币${$.userInfo.raiseInfo.remainScore}，下一关需要${$.userInfo.raiseInfo.nextLevelScore - $.userInfo.raiseInfo.curLevelStartScore}\n\n`);
    await $.wait(1000);
    await takePostRequest('zoo_getSignHomeData');
    await $.wait(1000);
    if($.signHomeData.todayStatus === 0){
      console.log(`去签到`);
      await takePostRequest('zoo_sign');
      await $.wait(1000);
    }else{
      console.log(`已签到`);
    }
    let raiseInfo = $.homeData.result.homeMainInfo.raiseInfo;
    if (Number(raiseInfo.totalScore) > Number(raiseInfo.nextLevelScore) && raiseInfo.buttonStatus === 1) {
      console.log(`满足升级条件，去升级`);
      await $.wait(3000);
      await takePostRequest('zoo_raise');
    }
    //收金币
    await $.wait(1000);
    await takePostRequest('zoo_collectProduceScore');
    await $.wait(1000);
    await takePostRequest('zoo_getTaskDetail');
    await $.wait(1000);
    //做任务
    for (let i = 0; i < $.taskList.length && $.secretp && !$.hotFlag; i++) {
      $.oneTask = $.taskList[i];
      if ([1, 3, 5, 7, 9, 26].includes($.oneTask.taskType) && $.oneTask.status === 1) {
        $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
          await takePostRequest('zoo_collectScore');
          if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
            await $.wait(8000);
            let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
            await callbackResult(sendInfo)
          } else if ($.oneTask.taskType === 5 || $.oneTask.taskType === 3 || $.oneTask.taskType === 26) {
            await $.wait(2000);
            console.log(`任务完成`);
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(3000);
          }
        }
      } else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 2){
        console.log(`做任务：${$.oneTask.taskName};等待完成 (实际不会添加到购物车)`);
        $.taskId = $.oneTask.taskId;
        $.feedDetailInfo = {};
        await takePostRequest('zoo_getFeedDetail');
        let productList = $.feedDetailInfo.productInfoVos;
        let needTime = Number($.feedDetailInfo.maxTimes) - Number($.feedDetailInfo.times);
        for (let j = 0; j < productList.length && needTime > 0; j++) {
          if(productList[j].status !== 1){
            continue;
          }
          $.taskToken = productList[j].taskToken;
          console.log(`加购：${productList[j].skuName}`);
          await takePostRequest('add_car');
          await $.wait(1500);
          needTime --;
        }
      }else if ($.oneTask.taskType === 2 && $.oneTask.status === 1 && $.oneTask.scoreRuleVos[0].scoreRuleType === 0){
        $.activityInfoList = $.oneTask.productInfoVos ;
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
            continue;
          }
          $.callbackInfo = {};
          console.log(`做任务：浏览${$.oneActivityInfo.skuName};等待完成`);
          await takePostRequest('zoo_collectScore');
          if ($.oneTask.taskType === 2) {
            await $.wait(2000);
            console.log(`任务完成`);
          } else {
            console.log($.callbackInfo);
            console.log(`任务失败`);
            await $.wait(3000);
          }
        }
      }
    }
    await $.wait(1000);
    await takePostRequest('zoo_getHomeData');
    raiseInfo = $.homeData.result.homeMainInfo.raiseInfo;
    if (Number(raiseInfo.totalScore) > Number(raiseInfo.nextLevelScore) && raiseInfo.buttonStatus === 1) {
      console.log(`满足升级条件，去升级`);
      await $.wait(1000);
      await takePostRequest('zoo_raise');
    }
    //===================================图鉴里的店铺====================================================================
    if (new Date().getHours()>= 17 && new Date().getHours()<= 18 && !$.hotFlag) {//分享
      $.myMapList = [];
      await takePostRequest('zoo_myMap');
      for (let i = 0; i < $.myMapList.length; i++) {
        await $.wait(3000);
        $.currentScence = i + 1;
        if ($.myMapList[i].isFirstShare === 1) {
          console.log(`去分享${$.myMapList[i].partyName}`);
          await takePostRequest('zoo_getWelfareScore');
        }
      }
    }
    if (new Date().getHours() >= 14 && new Date().getHours() <= 17 && !$.hotFlag){//30个店铺，为了避免代码执行太久，下午2点到5点才做店铺任务
      console.log(`去做店铺任务`);
      $.shopInfoList = [];
      await takePostRequest('qryCompositeMaterials');
      for (let i = 0; i < $.shopInfoList.length; i++) {
        $.shopSign = $.shopInfoList[i].extension.shopId;
        console.log(`执行第${i+1}个店铺任务：${$.shopInfoList[i].name} ID:${$.shopSign}`);
        $.shopResult = {};
        await takePostRequest('zoo_shopLotteryInfo');
        await $.wait(1000);
        if(JSON.stringify($.shopResult) === `{}`) continue;
        $.shopTask = $.shopResult.taskVos;
        for (let i = 0; i < $.shopTask.length; i++) {
          $.oneTask = $.shopTask[i];
          //console.log($.oneTask);
          if($.oneTask.taskType === 21 || $.oneTask.taskType === 14 || $.oneTask.status !== 1){continue;} //不做入会//不做邀请
          $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.simpleRecordInfoVo;
          if($.oneTask.taskType === 12){//签到
            if($.shopResult.dayFirst === 0){
              $.oneActivityInfo =  $.activityInfoList;
              console.log(`店铺签到`);
              await takePostRequest('zoo_bdCollectScore');
            }
            continue;
          }
          for (let j = 0; j < $.activityInfoList.length; j++) {
            $.oneActivityInfo = $.activityInfoList[j];
            if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
              continue;
            }
            $.callbackInfo = {};
            console.log(`做任务：${$.oneActivityInfo.subtitle || $.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
            await takePostRequest('zoo_collectScore');
            if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
              await $.wait(8000);
              let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
              await callbackResult(sendInfo)
            } else  {
              await $.wait(2000);
              console.log(`任务完成`);
            }
          }
        }
        await $.wait(1000);
        let boxLotteryNum = $.shopResult.boxLotteryNum;
        for (let j = 0; j < boxLotteryNum; j++) {
          console.log(`开始第${j+1}次拆盒`)
          //抽奖
          await takePostRequest('zoo_boxShopLottery');
          await $.wait(3000);
        }
        // let wishLotteryNum = $.shopResult.wishLotteryNum;
        // for (let j = 0; j < wishLotteryNum; j++) {
        //   console.log(`开始第${j+1}次能量抽奖`)
        //   //抽奖
        //   await takePostRequest('zoo_wishShopLottery');
        //   await $.wait(3000);
        // }
        await $.wait(3000);
      }
    }
    //==================================微信任务========================================================================
    $.wxTaskList = [];
    if(!$.hotFlag) await takePostRequest('wxTaskDetail');
    for (let i = 0; i < $.wxTaskList.length; i++) {
      $.oneTask = $.wxTaskList[i];
      if($.oneTask.taskType === 2 || $.oneTask.status !== 1){continue;} //不做加购
      $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo;
      for (let j = 0; j < $.activityInfoList.length; j++) {
        $.oneActivityInfo = $.activityInfoList[j];
        if ($.oneActivityInfo.status !== 1 || !$.oneActivityInfo.taskToken) {
          continue;
        }
        $.callbackInfo = {};
        console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
        await takePostRequest('zoo_collectScore');
        if ($.callbackInfo.code === 0 && $.callbackInfo.data && $.callbackInfo.data.result && $.callbackInfo.data.result.taskToken) {
          await $.wait(8000);
          let sendInfo = encodeURIComponent(`{"dataSource":"newshortAward","method":"getTaskAward","reqParams":"{\\"taskToken\\":\\"${$.callbackInfo.data.result.taskToken}\\"}","sdkVersion":"1.0.0","clientLanguage":"zh"}`)
          await callbackResult(sendInfo)
        } else  {
          await $.wait(2000);
          console.log(`任务完成`);
        }
      }
    }
    //=======================================================京东金融=================================================================================
    $.jdjrTaskList = [];
    if(!$.hotFlag) await takePostRequest('jdjrTaskDetail');
    await $.wait(1000);
    for (let i = 0; i < $.jdjrTaskList.length; i++) {
      $.taskId = $.jdjrTaskList[i].id;
      if($.taskId === '3980' || $.taskId === '3981' || $.taskId === '3982') continue;
      if($.jdjrTaskList[i].status === '1' || $.jdjrTaskList[i].status === '3'){
        console.log(`去做任务：${$.jdjrTaskList[i].name}`);
        await takePostRequest('jdjrAcceptTask');
        await $.wait(8000);
        await takeGetRequest();
      }else if($.jdjrTaskList[i].status === '2'){
        console.log(`任务：${$.jdjrTaskList[i].name},已完成`);
      }
    }
    //======================================================怪兽大作战=================================================================================
    $.pkHomeData = {};
    await takePostRequest('zoo_pk_getHomeData');
    if (JSON.stringify($.pkHomeData) === '{}') {
      console.log(`获取PK信息异常`);
      return;
    }
    await $.wait(1000);
    $.pkTaskList = [];
    if(!$.hotFlag) await takePostRequest('zoo_pk_getTaskDetail');
    await $.wait(1000);
    for (let i = 0; i < $.pkTaskList.length; i++) {
      $.oneTask = $.pkTaskList[i];
      if ($.oneTask.status === 1) {
        $.activityInfoList = $.oneTask.shoppingActivityVos || $.oneTask.brandMemberVos || $.oneTask.followShopVo || $.oneTask.browseShopVo
        for (let j = 0; j < $.activityInfoList.length; j++) {
          $.oneActivityInfo = $.activityInfoList[j];
          if ($.oneActivityInfo.status !== 1) {
            continue;
          }
          console.log(`做任务：${$.oneActivityInfo.title || $.oneActivityInfo.taskName || $.oneActivityInfo.shopName};等待完成`);
          await takePostRequest('zoo_pk_collectScore');
          await $.wait(2000);
          console.log(`任务完成`);
        }
      }
    }
    await $.wait(1000);
    //await takePostRequest('zoo_pk_getTaskDetail');
    let skillList = $.pkHomeData.result.groupInfo.skillList || [];
    //activityStatus === 1未开始，2 已开始
    $.doSkillFlag = true;
    for (let i = 0; i < skillList.length && $.pkHomeData.result.activityStatus === 2 && $.doSkillFlag; i++) {
      if (Number(skillList[i].num) > 0) {
        $.skillCode = skillList[i].code;
        for (let j = 0; j < Number(skillList[i].num) && $.doSkillFlag; j++) {
          console.log(`使用技能`);
          await takePostRequest('zoo_pk_doPkSkill');
          await $.wait(2000);
        }
      }
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function takePostRequest(type) {
  let body = ``;
  let myRequest = ``;
  switch (type) {
    case 'zoo_signSingle':
      body = `functionId=zoo_signSingle&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_signSingle`, body);
      break;
    case 'zoo_getHomeData':
      body = `functionId=zoo_getHomeData&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getHomeData`, body);
      break;
    case 'helpHomeData':
      body = `functionId=zoo_getHomeData&body={"inviteId":"${$.inviteId}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getHomeData`, body);
      break;
    case 'zoo_collectProduceScore':
      body = getPostBody(type);
      myRequest = await getPostRequest(`zoo_collectProduceScore`, body);
      break;
    case 'zoo_getFeedDetail':
      body = `functionId=zoo_getFeedDetail&body={"taskId":"${$.taskId}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getFeedDetail`, body);
      break;
    case 'zoo_getTaskDetail':
      body = `functionId=zoo_getTaskDetail&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getTaskDetail`, body);
      break;
    case 'zoo_collectScore':
      body = getPostBody(type);
      //console.log(body);
      myRequest = await getPostRequest(`zoo_collectScore`, body);
      break;
    case 'zoo_raise':
      body = `functionId=zoo_raise&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_raise`, body);
      break;
    case 'help':
      body = getPostBody(type);
      //console.log(body);
      myRequest = await getPostRequest(`zoo_collectScore`, body);
      break;
    case 'zoo_pk_getHomeData':
      body = `functionId=zoo_pk_getHomeData&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_pk_getHomeData`, body);
      break;
    case 'zoo_pk_getTaskDetail':
      body = `functionId=zoo_pk_getTaskDetail&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_pk_getTaskDetail`, body);
      break;
    case 'zoo_pk_collectScore':
      body = getPostBody(type);
      //console.log(body);
      myRequest = await getPostRequest(`zoo_pk_collectScore`, body);
      break;
    case 'zoo_pk_doPkSkill':
      body = `functionId=zoo_pk_doPkSkill&body={"skillType":"${$.skillCode}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_pk_doPkSkill`, body);
      break;
    case 'pkHelp':
      body = getPostBody(type);
      myRequest = await getPostRequest(`zoo_pk_assistGroup`, body);
      break;
    case 'zoo_getSignHomeData':
      body = `functionId=zoo_getSignHomeData&body={"notCount":"1"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getSignHomeData`,body);
      break;
    case 'zoo_sign':
      body = `functionId=zoo_sign&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_sign`,body);
      break;
    case 'wxTaskDetail':
      body = `functionId=zoo_getTaskDetail&body={"appSign":"2","channel":1,"shopSign":""}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_getTaskDetail`,body);
      break;
    case 'zoo_shopLotteryInfo':
      body = `functionId=zoo_shopLotteryInfo&body={"shopSign":"${$.shopSign}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_shopLotteryInfo`,body);
      break;
    case 'zoo_bdCollectScore':
      body = getPostBody(type);
      myRequest = await getPostRequest(`zoo_bdCollectScore`,body);
      break;
    case 'qryCompositeMaterials':
      body = `functionId=qryCompositeMaterials&body={"qryParam":"[{\\"type\\":\\"advertGroup\\",\\"mapTo\\":\\"resultData\\",\\"id\\":\\"05371960\\"}]","activityId":"2s7hhSTbhMgxpGoa9JDnbDzJTaBB","pageId":"","reqSrc":"","applyKey":"jd_star"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`qryCompositeMaterials`,body);
      break;
    case 'zoo_boxShopLottery':
      body = `functionId=zoo_boxShopLottery&body={"shopSign":"${$.shopSign}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_boxShopLottery`,body);
      break;
    case `zoo_wishShopLottery`:
      body = `functionId=zoo_wishShopLottery&body={"shopSign":"${$.shopSign}"}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_boxShopLottery`,body);
      break;
    case `zoo_myMap`:
      body = `functionId=zoo_myMap&body={}&client=wh5&clientVersion=1.0.0`;
      myRequest = await getPostRequest(`zoo_myMap`,body);
      break;
    case 'zoo_getWelfareScore':
      body = getPostBody(type);
      myRequest = await getPostRequest(`zoo_getWelfareScore`,body);
      break;
    case 'jdjrTaskDetail':
      body = `reqData={"eid":"","sdkToken":"jdd014JYKVE2S6UEEIWPKA4B5ZKBS4N6Y6X5GX2NXL4IYUMHKF3EEVK52RQHBYXRZ67XWQF5N7XB6Y2YKYRTGQW4GV5OFGPDPFP3MZINWG2A01234567"}`;
      myRequest = await getPostRequest(`listTask`,body);
      break;
    case 'jdjrAcceptTask':
      body = `reqData={"eid":"","sdkToken":"jdd014JYKVE2S6UEEIWPKA4B5ZKBS4N6Y6X5GX2NXL4IYUMHKF3EEVK52RQHBYXRZ67XWQF5N7XB6Y2YKYRTGQW4GV5OFGPDPFP3MZINWG2A01234567","id":"${$.taskId}"}`;
      myRequest = await getPostRequest(`acceptTask`,body);
      break;
    case 'add_car':
      body = getPostBody(type);
      myRequest = await getPostRequest(`zoo_collectScore`,body);
      break;
    default:
      console.log(`错误${type}`);
  }
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        //console.log(data);
        dealReturn(type, data);
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

async function dealReturn(type, data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    console.log(`返回异常：${data}`);
    return;
  }
  switch (type) {
    case 'zoo_signSingle':
      if (data.code === 0) $.signSingle = data.data
      break;
    case 'zoo_getHomeData':
      if (data.code === 0) {
        if (data.data['bizCode'] === 0) {
          $.homeData = data.data;
          $.secretp = data.data.result.homeMainInfo.secretp;
          $.secretpInfo[$.UserName] = $.secretp;
        }
      }
      break;
    case 'helpHomeData':
      console.log(data)
      if (data.code === 0) {
        $.secretp = data.data.result.homeMainInfo.secretp;
        //console.log(`$.secretp：${$.secretp}`);
      }
      break;
    case 'zoo_collectProduceScore':
      if (data.code === 0 && data.data && data.data.result) {
        console.log(`收取成功，获得：${data.data.result.produceScore}`);
      }else{
        console.log(JSON.stringify(data));
      }
      if(data.code === 0 && data.data && data.data.bizCode === -1002){
        $.hotFlag = true;
        console.log(`该账户脚本执行任务火爆，暂停执行任务，请手动做任务或者等待解决脚本火爆问题`)
      }
      break;
    case 'zoo_getTaskDetail':
      if (data.code === 0) {
        console.log(`互助码：${data.data.result.inviteId || '助力已满，获取助力码失败'}`);
        if (data.data.result.inviteId) {
          $.inviteList.push({
            'ues': $.UserName,
            'secretp': $.secretp,
            'inviteId': data.data.result.inviteId,
            'max': false
          });
        }
        $.taskList = data.data.result.taskVos;
      }
      break;
    case 'zoo_collectScore':
      $.callbackInfo = data;
      break;
    case 'zoo_raise':
      if (data.code === 0) console.log(`升级成功`);
      break;
    case 'help':
    case 'pkHelp':
      //console.log(data);
      switch (data.data.bizCode) {
        case 0:
          console.log(`助力成功`);
          break;
        case -201:
          console.log(`助力已满`);
          $.oneInviteInfo.max = true;
          break;
        case -202:
          console.log(`已助力`);
          break;
        case -8:
          console.log(`已经助力过该队伍`);
          break;
        case -6:
        case 108:
          console.log(`助力次数已用光`);
          $.canHelp = false;
          break;
        default:
          console.log(`怪兽大作战助力失败：${JSON.stringify(data)}`);
      }
      break;
    case 'zoo_pk_getHomeData':
      if (data.code === 0) {
        console.log(`PK互助码：${data.data.result.groupInfo.groupAssistInviteId}`);
        if (data.data.result.groupInfo.groupAssistInviteId) $.pkInviteList.push(data.data.result.groupInfo.groupAssistInviteId);
        $.pkHomeData = data.data;
      }
      break;
    case 'zoo_pk_getTaskDetail':
      if (data.code === 0) {
        $.pkTaskList = data.data.result.taskVos;
      }
      break;
    case 'zoo_getFeedDetail':
      if (data.code === 0) {
        $.feedDetailInfo = data.data.result.addProductVos[0];
      }
      break;
    case 'zoo_pk_collectScore':
      break;
    case 'zoo_pk_doPkSkill':
      if (data.data.bizCode === 0) console.log(`使用成功`);
      if (data.data.bizCode === -2) {
        console.log(`队伍任务已经完成，无法释放技能!`);
        $.doSkillFlag = false;
      }else if(data.data.bizCode === -2003){
        console.log(`现在不能打怪兽`);
        $.doSkillFlag = false;
      }
      break;
    case 'zoo_getSignHomeData':
      if(data.code === 0) {
        $.signHomeData = data.data.result;
      }
      break;
    case 'zoo_sign':
      if(data.code === 0 && data.data.bizCode === 0) {
        console.log(`签到获得成功`);
        if (data.data.result.redPacketValue) console.log(`签到获得：${data.data.result.redPacketValue} 红包`);
      }else{
        console.log(`签到失败`);
        console.log(data);
      }
      break;
    case 'wxTaskDetail':
      if (data.code === 0) {
        $.wxTaskList = data.data.result.taskVos;
      }
      break;
    case 'zoo_shopLotteryInfo':
      if (data.code === 0) {
        $.shopResult = data.data.result;
      }
      break;
    case 'zoo_bdCollectScore':
      if (data.code === 0) {
        console.log(`签到获得：${data.data.result.score}`);
      }
      break;
    case 'qryCompositeMaterials':
      //console.log(data);
      if (data.code === '0') {
        $.shopInfoList = data.data.resultData.list;
        console.log(`获取到${$.shopInfoList.length}个店铺`);
      }
      break
    case 'zoo_boxShopLottery':
      let result = data.data.result;
      switch (result.awardType) {
        case 8:
          console.log(`获得金币：${result.rewardScore}`);
          break;
        case 5:
          console.log(`获得：adidas能量`);
          break;
        case 2:
        case 3:
          console.log(`获得优惠券：${result.couponInfo.usageThreshold} 优惠：${result.couponInfo.quota}，${result.couponInfo.useRange}`);
          break;
        default:
          console.log(`抽奖获得未知`);
          console.log(JSON.stringify(data));
      }
      break
    case 'zoo_wishShopLottery':
      console.log(JSON.stringify(data));
      break
    case `zoo_myMap`:
      if (data.code === 0) {
        $.myMapList = data.data.result.sceneMap.sceneInfo;
      }
      break;
    case 'zoo_getWelfareScore':
      if (data.code === 0) {
        console.log(`分享成功，获得：${data.data.result.score}`);
      }
      break;
    case 'jdjrTaskDetail':
      if (data.resultCode === 0) {
        $.jdjrTaskList = data.resultData.top;
      }
      break;
    case 'jdjrAcceptTask':
      if (data.resultCode === 0) {
        console.log(`领任务成功`);
      }
      break;
    case 'add_car':
      if (data.code === 0) {
        let acquiredScore = data.data.result.acquiredScore;
        if(Number(acquiredScore) > 0){
          console.log(`加购成功,获得金币:${acquiredScore}`);
        }else{
          console.log(`加购成功`);
        }
      }else{
        console.log(JSON.stringify(data));
        console.log(`加购失败`);
      }
      break
    default:
      console.log(`未判断的异常${type}`);
  }
}
function takeGetRequest(){
  return new Promise(async resolve => {
    $.get({
      url:`https://ms.jr.jd.com/gw/generic/mission/h5/m/finishReadMission?reqData={%22missionId%22:%22${$.taskId}%22,%22readTime%22:8}`,
      headers:{
        'Origin' : `https://prodev.m.jd.com`,
        'Cookie': $.cookie,
        'Connection' : `keep-alive`,
        'Accept' : `*/*`,
        'Referer' : `https://prodev.m.jd.com`,
        'Host' : `ms.jr.jd.com`,
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Encoding' : `gzip, deflate, br`,
        'Accept-Language' : `zh-cn`
      }
    }, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data.resultCode === 0) {
          console.log(`任务完成`);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

//领取奖励
function callbackResult(info) {
  return new Promise((resolve) => {
    let url = {
      url: `https://api.m.jd.com/?functionId=qryViewkitCallbackResult&client=wh5&clientVersion=1.0.0&body=${info}&_timestamp=` + Date.now(),
      headers: {
        'Origin': `https://bunearth.m.jd.com`,
        'Cookie': $.cookie,
        'Connection': `keep-alive`,
        'Accept': `*/*`,
        'Host': `api.m.jd.com`,
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        'Accept-Encoding': `gzip, deflate, br`,
        'Accept-Language': `zh-cn`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://bunearth.m.jd.com'
      }
    }

    $.get(url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data.toast.subTitle)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    })
  })
}

async function getPostRequest(type, body) {
  let url = `https://api.m.jd.com/client.action?functionId=${type}`;
  if(type === 'listTask' || type === 'acceptTask' ){
    url = `https://ms.jr.jd.com/gw/generic/hy/h5/m/${type}`;
  }
  const method = `POST`;
  const headers = {
    'Accept': `application/json, text/plain, */*`,
    'Origin': `https://wbbny.m.jd.com`,
    'Accept-Encoding': `gzip, deflate, br`,
    'Cookie': $.cookie,
    'Content-Type': `application/x-www-form-urlencoded`,
    'Host': `api.m.jd.com`,
    'Connection': `keep-alive`,
    'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    'Referer': `https://wbbny.m.jd.com`,
    'Accept-Language': `zh-cn`
  };
  return {url: url, method: method, headers: headers, body: body};
}

function getPostBody(type) {
  let taskBody = '';
  if (type === 'help') {
    taskBody = `functionId=zoo_collectScore&body=${JSON.stringify({"taskId": 2,"inviteId":$.inviteId,"actionType":1,"ss" :getBody()})}&client=wh5&clientVersion=1.0.0`
  } else if (type === 'pkHelp') {
    taskBody = `functionId=zoo_pk_assistGroup&body=${JSON.stringify({"confirmFlag": 1,"inviteId" : $.pkInviteId,"ss" : getBody()})}&client=wh5&clientVersion=1.0.0`;
  } else if (type === 'zoo_collectProduceScore') {
    taskBody = `functionId=zoo_collectProduceScore&body=${JSON.stringify({"ss" :getBody()})}&client=wh5&clientVersion=1.0.0`;
  } else if(type === 'zoo_getWelfareScore'){
    taskBody = `functionId=zoo_getWelfareScore&body=${JSON.stringify({"type": 2,"currentScence":$.currentScence,"ss" : getBody()})}&client=wh5&clientVersion=1.0.0`;
  } else if(type === 'add_car'){
    taskBody = `functionId=zoo_collectScore&body=${JSON.stringify({"taskId": $.taskId,"taskToken":$.taskToken,"actionType":1,"ss" : getBody()})}&client=wh5&clientVersion=1.0.0`
  }else{
    taskBody = `functionId=${type}&body=${JSON.stringify({"taskId": $.oneTask.taskId,"actionType":1,"taskToken" : $.oneActivityInfo.taskToken,"ss" : getBody()})}&client=wh5&clientVersion=1.0.0`
  }
  return taskBody
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}
function getAuthorShareCode(url = "http://cdn.annnibb.me/eb6fdc36b281b7d5eabf33396c2683a2.json") {
  return new Promise(async resolve => {
    const options = {
      "url": `${url}?${new Date()}`,
      "timeout": 10000,
      "headers": {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) data = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data || []);
      }
    })
    await $.wait(10000)
    resolve();
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
        Cookie: $.cookie,
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
var _0xodX='jsjiami.com.v6',_0x5773=[_0xodX,'w5jCqy0iw6A=','wqkyAMKNw6I=','w5PDnDbCmMO+','w7fDgsOIXgc=','Z8OLdMOmwoQ=','wrrDmcKaTww=','albCiMOoLw==','wozClF/Dgio=','D3zCvMKOw5Y=','wrXCtWHDjyU=','wpg3wpLDh8Ol','woTDm1rDuCg=','fsKMw5U1Zw==','wpjDqmfDuhY=','cVbCksOpDA==','wrkMw69MUQ==','wo3DlE/DnDg=','BcKIw5ZSw7g=','wp7DmWcIw6M=','ZsKRwq/CkU8=','w7xlRMKCKw==','KMKWw7xSw7Y=','DXcERgY=','esKjwoHCk8OU','wovCv8Obw4IZ','WMKAZsK/VQ==','FhNhf8Ob','GQzChMOfw5c=','SsKow5XCmjU=','w7bDvcKaRcKh','axPCkcKOZg==','wpMSQiho','wodkwrrDqEE=','woFEwoLDgU4=','wrl1wqnDu2I=','D348wqnDvA==','TUPCr8OKIg==','cMK9VsK5Uw==','L2PCnMK4w5TCuQ==','wrtPwoLDvXdkwp7DlQ==','DxVqfcOUwo/CuMOIw7Au','wrkZwovDosOOO1bCkMOPPw==','wqMSwoZ4','wpnDlG/DmDLDicOsw5XDvMKSwq7Cmk7CqQ==','fcOtw4tQCQ==','wrUtIcKvw4U=','w5TDgxvCoMO5','wpsOw7V3ew==','esKPwovCvlo=','F1Niw7TDg8Ke','H8KrQzFu','wqLCpcKpfsOm','WMOYwoB9w6F8','w7fDscKmbsKC','NlDCo8Knw44=','wqTDnMKBw6wI','KmIybRE=','w4PClMK5wqI7','w64qw6wJSA==','wqcIwqZkwplPWWU=','WUTCpcOSAg==','w6IIw4cYRw==','wrjDicKfw6YoYsKV','w4YKwpdswp0x','S8KqWTFpw6V9OsOJw7HDmA==','M8KFV8KtGQ==','CgnCkcKnYgjDmHzCgMKwwqE=','asO+w4VhBw==','wqYAw6JSWA==','MFZ6w5XDmA==','wrACKMKCw7I=','wrbCgUXDris=','FF09wqnDjQ==','bcKdw63Cnhg=','DzFfeMOj','wrEUw73CuHs=','Z8O0V8O+wok=','woXDl8KmdxTCnmXCvhA=','wr3Cg8Osw686','wqHCrMKBI8O2Y2R1','TcK7wpzCpcOx','TMK+YsKkUA==','wr4/w7RyQ8O3','F0kAwqvDkMKB','ZMO0d8O0wrQE','wpPCtMO2w6oT','wqjDk1U=','CsKBVT1e','w4tcbcKSJA==','S13CksOVNVzCqz4=','w5TDvMKnasKeIg==','ecKLXMKzUMK0','H0cqwq7DoA==','w5vDscKof8KpJcO7C8KlwrU=','HAh4Zw==','woE3wpRrwrE=','wqUbXjZWwroPwrQ=','w7rCpcKmw5Rlw5fDgsK4OA==','NXwgwp/DsA==','w4LDi8OuRjA=','S1fCssOV','Az1twozClQ==','DmJkw77Dlg==','wptRcyEL','wprCoXrDpRQ=','LyxnYcOB','w7MEw6wqTQ==','M14cA8ON','ICpRVcOk','DMKkWyxI','HXw/N8Of','w7xTY8KWIg==','wonDucKdw6wR','w5XCjMKswqvCnw==','wpHCr8Ogw44A','KWgpGsOB','ChTCs8Odw7U=','worCisOQw7k/','wpE9wpRhwoQ=','wpFrwpTClsKT','Sy3Ch8KpWA==','wozDpl3DjTU=','UMKWworCtms=','wowsKsKNw5g=','OcKVw6d8w5c=','w47CqCEzw7c=','TULDn08VSA==','BsKHWjRN','BhJiYQ==','w7XDkMKsw4U5','wq4ewrnDpMO/PVzCkg==','w6bCvQgzw4Qh','C1kdwqQ=','IXQtTTk=','w6PDnsKqw6g7','wrAmwqdZwq8=','U1fCr8OGM10=','eMKVwo3CuA==','PcKocg1N','WA/CscKMZBPDg2g=','eMOkasO7','eMKvw4rCoQI=','wrAewoPDvg==','wqDCiH/Dhyw=','RWTCp8OSDw==','wrXClXjDrDbDsg==','wrjCncKZUA==','wqrDmUcow6HDgW5QWgA=','wrA5w7JmVg==','HU0VN8Ox','KCHCjsOew6g=','w6zDvA7ClMO0','w6bCu8K8wq3Cuw==','w4fCicKAwoU8','esO0acO/wqEPQA==','w5TDry3CpsOswoI=','CFA/P8OY','NMKLRypP','e0PDm0wY','Z8KBR8K6QA==','wqEGwpt0woRL','V8O1w75PHA==','WcO0fsO7wo0=','wrrCh8KfVsOK','cMKNw5DCnx5z','w5hndMKOFA==','SWPDqXI5','w5vCscKXwp7CusKi','JsKuw6Fnw4Q=','wq7CmsKFVcOtSGzCmgUbwqN6','wrcGYi9nwrsAwqEyNVcm','R8KjwrDChsOt','wqzDmsKew68EZ8OJXMOBw5jCkiw=','w7LCrz8Zw4g=','Fj9uwojCosO4wr95wpZSekw=','wpPDi8K3ZD8=','wrLDokbDhiPDjMObw5/DnsK5wovChw==','d8OVC8OBwrI=','ShLCjcKVVRLDjH3Ct8Oiw7RI','w53Crycmw6A=','wphWwqjCscKF','VWLChGMp','ScORwo9rw41+MsKhL8Ok','wq06BsKUw40=','woYWN8Kfw4o=','wqgeKcKxw4M=','wr/ComXDnwU=','bsO9dsO8wrI=','wqLDkXvDhiE=','EV1fw6TDnsKaw4vCrw==','DW8sDsOY','I3ArQTw=','HiJ2','ZXLCncK0w4XCv3s=','DMOSwotgwrM=','JsKORx5+','dHjCsMOgMw==','w7zCnsKIwrjCug==','dsKDw6vCiwF7wqVMLQbDrw==','wrNvaBso','w7I/w7EGQw==','wqUmwqd9wqo=','wr/CnlnDhAE=','PBBPQcOg','w5HCl8KFwrk7ITHCtw==','a8OaHsOlWg==','fMKvw4A=','ScKmw4/CugU=','wp5kw6PCuDNlwqDDkwUbAUE=','KMKjw6NRw5J6Eg4=','w63DicKcbMKt','w6TDrcK0w6UW','X8Oxw7ZFBw==','RcKuw5M1Qw==','QAXCjMKfYhI=','w4sKw7AgSg==','wr3CpcKHUMOI','wp/Cr8Ofw6Ez','wpUfOcKew4M=','N8K0bC1u','w6vCtjY8w6g=','TsOvw451IA==','b37Cj8O3DA==','wpQewppFwqM=','w47CkxANw7g=','jsjiHamXVyZiz.cMwHNKom.vDLlh6Re=='];(function(_0x53c069,_0x2ced53,_0x1fffbb){var _0x10d80b=function(_0x10867b,_0x8c849,_0x30e608,_0x33ae0d,_0x4472af){_0x8c849=_0x8c849>>0x8,_0x4472af='po';var _0x27efa2='shift',_0x18024a='push';if(_0x8c849<_0x10867b){while(--_0x10867b){_0x33ae0d=_0x53c069[_0x27efa2]();if(_0x8c849===_0x10867b){_0x8c849=_0x33ae0d;_0x30e608=_0x53c069[_0x4472af+'p']();}else if(_0x8c849&&_0x30e608['replace'](/[HXVyZzMwHNKDLlhRe=]/g,'')===_0x8c849){_0x53c069[_0x18024a](_0x33ae0d);}}_0x53c069[_0x18024a](_0x53c069[_0x27efa2]());}return 0x8c9ae;};return _0x10d80b(++_0x2ced53,_0x1fffbb)>>_0x2ced53^_0x1fffbb;}(_0x5773,0x10c,0x10c00));var _0xa644=function(_0x4b43ed,_0x823488){_0x4b43ed=~~'0x'['concat'](_0x4b43ed);var _0x178cde=_0x5773[_0x4b43ed];if(_0xa644['rwqafD']===undefined){(function(){var _0x212d41=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x366020='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x212d41['atob']||(_0x212d41['atob']=function(_0x544c60){var _0x5459d0=String(_0x544c60)['replace'](/=+$/,'');for(var _0x2de8d3=0x0,_0x17d114,_0x457f66,_0x48e6b2=0x0,_0x485723='';_0x457f66=_0x5459d0['charAt'](_0x48e6b2++);~_0x457f66&&(_0x17d114=_0x2de8d3%0x4?_0x17d114*0x40+_0x457f66:_0x457f66,_0x2de8d3++%0x4)?_0x485723+=String['fromCharCode'](0xff&_0x17d114>>(-0x2*_0x2de8d3&0x6)):0x0){_0x457f66=_0x366020['indexOf'](_0x457f66);}return _0x485723;});}());var _0x4d7563=function(_0x4721f5,_0x823488){var _0x387608=[],_0x262522=0x0,_0x36e548,_0x19d27a='',_0x594b49='';_0x4721f5=atob(_0x4721f5);for(var _0x46c56b=0x0,_0x26b47c=_0x4721f5['length'];_0x46c56b<_0x26b47c;_0x46c56b++){_0x594b49+='%'+('00'+_0x4721f5['charCodeAt'](_0x46c56b)['toString'](0x10))['slice'](-0x2);}_0x4721f5=decodeURIComponent(_0x594b49);for(var _0x38a354=0x0;_0x38a354<0x100;_0x38a354++){_0x387608[_0x38a354]=_0x38a354;}for(_0x38a354=0x0;_0x38a354<0x100;_0x38a354++){_0x262522=(_0x262522+_0x387608[_0x38a354]+_0x823488['charCodeAt'](_0x38a354%_0x823488['length']))%0x100;_0x36e548=_0x387608[_0x38a354];_0x387608[_0x38a354]=_0x387608[_0x262522];_0x387608[_0x262522]=_0x36e548;}_0x38a354=0x0;_0x262522=0x0;for(var _0x217275=0x0;_0x217275<_0x4721f5['length'];_0x217275++){_0x38a354=(_0x38a354+0x1)%0x100;_0x262522=(_0x262522+_0x387608[_0x38a354])%0x100;_0x36e548=_0x387608[_0x38a354];_0x387608[_0x38a354]=_0x387608[_0x262522];_0x387608[_0x262522]=_0x36e548;_0x19d27a+=String['fromCharCode'](_0x4721f5['charCodeAt'](_0x217275)^_0x387608[(_0x387608[_0x38a354]+_0x387608[_0x262522])%0x100]);}return _0x19d27a;};_0xa644['EpLLsy']=_0x4d7563;_0xa644['yDDTrr']={};_0xa644['rwqafD']=!![];}var _0x1c7fa3=_0xa644['yDDTrr'][_0x4b43ed];if(_0x1c7fa3===undefined){if(_0xa644['IPoxWN']===undefined){_0xa644['IPoxWN']=!![];}_0x178cde=_0xa644['EpLLsy'](_0x178cde,_0x823488);_0xa644['yDDTrr'][_0x4b43ed]=_0x178cde;}else{_0x178cde=_0x1c7fa3;}return _0x178cde;};function randomWord(_0x467430,_0x28d47a,_0x2918d7){var _0x4e2268={'UdvEt':function(_0x73fc63,_0x234a92){return _0x73fc63+_0x234a92;},'jMCFH':function(_0x2d7517,_0x3bd0ee){return _0x2d7517*_0x3bd0ee;},'jTObJ':function(_0x49d85b,_0x3ebdd7){return _0x49d85b*_0x3ebdd7;},'DcBgk':_0xa644('0','Q^T8'),'fvdsE':function(_0x9b9d49,_0xe90892,_0x331e39){return _0x9b9d49(_0xe90892,_0x331e39);},'xofll':function(_0x5c6396,_0x586ed2){return _0x5c6396(_0x586ed2);},'tZxGo':function(_0x1335e5,_0x23ab49){return _0x1335e5(_0x23ab49);},'dWQpp':function(_0x32520b,_0x5db115,_0x4c6aa2){return _0x32520b(_0x5db115,_0x4c6aa2);},'pyXUY':function(_0x17f7ad,_0x2b096f){return _0x17f7ad+_0x2b096f;},'oqSei':function(_0x4a040b,_0x1c3871){return _0x4a040b+_0x1c3871;},'cLTwt':function(_0x4832b3,_0x1a4dc3){return _0x4832b3+_0x1a4dc3;},'oeNmI':'~C~','xZcyf':'QD216hPageh5','uVQxn':function(_0x49efbc,_0x380c92){return _0x49efbc!==_0x380c92;},'Zefvs':function(_0x4b1069,_0x3f3c85){return _0x4b1069+_0x3f3c85;},'ZqpBj':function(_0x9da747,_0x7a0b7c){return _0x9da747*_0x7a0b7c;},'Ohoch':function(_0x13b53e,_0x51bc26){return _0x13b53e<_0x51bc26;},'ntpnO':_0xa644('1','jPSO'),'YPPpt':function(_0x3ba982,_0x3b0ff3){return _0x3ba982-_0x3b0ff3;}};let _0x42913c='',_0x5500de=_0x28d47a,_0x3fdd2a=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];if(_0x467430){if(_0x4e2268[_0xa644('2','ys21')](_0xa644('3','429]'),_0xa644('4','YBEe'))){_0x5500de=_0x4e2268['Zefvs'](Math[_0xa644('5','z&qH')](_0x4e2268['ZqpBj'](Math[_0xa644('6','1f[r')](),_0x2918d7-_0x28d47a)),_0x28d47a);}else{_0x5500de=_0x4e2268['UdvEt'](Math[_0xa644('7','7Jz]')](_0x4e2268[_0xa644('8','LGvt')](Math[_0xa644('9','42v*')](),_0x2918d7-_0x28d47a)),_0x28d47a);}}for(let _0x49bcca=0x0;_0x4e2268[_0xa644('a','OZ60')](_0x49bcca,_0x5500de);_0x49bcca++){if(_0x4e2268[_0xa644('b','4I]k')](_0x4e2268[_0xa644('c','tWZo')],_0x4e2268[_0xa644('d','YOvM')])){let _0x343833=Math[_0xa644('e','gsi#')](0xf4240+_0x4e2268[_0xa644('f',']vsQ')](0x895440,Math['random']()))[_0xa644('10','e$Yn')]();let _0x3f0c7e=_0x4e2268['DcBgk'];let _0x396d3d=_0x4e2268[_0xa644('11','8iRk')](randomWord,![],0xa);let _0xbd3b82=Date['now']();let _0x4d0bb1=_0x4e2268[_0xa644('12',']vsQ')](getKey,_0xbd3b82,_0x396d3d);let _0x397e8c=_0xa644('13','tWZo')+_0x343833+'&token='+_0x3f0c7e+_0xa644('14','(&xV')+_0xbd3b82+_0xa644('15','7Jz]')+_0x396d3d+_0xa644('16','C#aE')+_0x4d0bb1+_0xa644('17',')VFQ');let _0x35da54=bytesToHex(_0x4e2268['xofll'](wordsToBytes,_0x4e2268[_0xa644('18','jPSO')](getSign,_0x397e8c)))['toUpperCase']();let _0xe3292=_0x4e2268[_0xa644('19','YBEe')](crc32,_0x35da54)['toString'](0x24);_0xe3292=_0x4e2268['dWQpp'](add0,_0xe3292,0x7);_0x35da54=_0x4e2268[_0xa644('1a','1f[r')](_0x4e2268[_0xa644('1b','ys21')](_0x4e2268[_0xa644('1c','V&QR')](_0x4e2268['oqSei'](_0x4e2268[_0xa644('1d','F9qT')](_0x4e2268[_0xa644('1e','FoTx')](_0x4e2268[_0xa644('1f','x1!1')](_0xbd3b82['toString'](),'~1')+_0x396d3d,_0x3f0c7e),_0xa644('20','Wkzc'))+_0x35da54+'~',_0xe3292),_0x4e2268[_0xa644('21','pr66')])+_0x35da54,'~'),_0xe3292);s=JSON[_0xa644('22','gRCF')]({'extraData':{'log':_0x4e2268[_0xa644('23','xR%R')](encodeURIComponent,_0x35da54),'sceneid':_0x4e2268['xZcyf']},'secretp':$.secretp ,'random':_0x343833[_0xa644('24','xW0)')]()});return s;}else{pos=Math[_0xa644('25','#ZCr')](Math['random']()*_0x4e2268[_0xa644('26','C#aE')](_0x3fdd2a[_0xa644('27','YBEe')],0x1));_0x42913c+=_0x3fdd2a[pos];}}return _0x42913c;}function minusByByte(_0x501a90,_0x5cb2ee){var _0x567dd3={'KIdJG':function(_0xbada42,_0x1115fb){return _0xbada42(_0x1115fb);},'ZmbBF':function(_0x21701b,_0x302486){return _0x21701b!==_0x302486;},'gEcbT':function(_0x4f915f,_0xf88c44){return _0x4f915f-_0xf88c44;}};var _0x54a117=_0x501a90[_0xa644('28','F9qT')],_0x2ff604=_0x5cb2ee[_0xa644('29','pr66')],_0x413042=Math['max'](_0x54a117,_0x2ff604),_0x91909c=toAscii(_0x501a90),_0x44b381=_0x567dd3['KIdJG'](toAscii,_0x5cb2ee),_0x18c8ab='',_0xb246ba=0x0;for(_0x567dd3[_0xa644('2a','xR%R')](_0x54a117,_0x2ff604)&&(_0x91909c=add0(_0x91909c,_0x413042),_0x44b381=this['add0'](_0x44b381,_0x413042));_0xb246ba<_0x413042;)_0x18c8ab+=Math[_0xa644('2b','Gn$@')](_0x567dd3[_0xa644('2c','7Jz]')](_0x91909c[_0xb246ba],_0x44b381[_0xb246ba])),_0xb246ba++;return _0x18c8ab;}function getKey(_0x4ddd3c,_0x273cea){var _0x31f68a={'qJOTE':function(_0x893131,_0x130ceb){return _0x893131<_0x130ceb;},'dkDbD':function(_0x287279,_0x22b33c){return _0x287279^_0x22b33c;},'aIjjI':function(_0x14e5fd,_0x18f265){return _0x14e5fd%_0x18f265;}};let _0x2a4819=[],_0x22ba69,_0x5f4e6c=0x0;for(let _0x17134c=0x0;_0x31f68a[_0xa644('2d','j6Fa')](_0x17134c,_0x4ddd3c[_0xa644('2e','8iRk')]()[_0xa644('2f','OZ60')]);_0x17134c++){_0x5f4e6c=_0x17134c;if(_0x5f4e6c>=_0x273cea[_0xa644('30','C#aE')])_0x5f4e6c-=_0x273cea[_0xa644('27','YBEe')];_0x22ba69=_0x31f68a[_0xa644('31','F9qT')](_0x4ddd3c['toString']()[_0xa644('32','OZ60')](_0x17134c),_0x273cea['charCodeAt'](_0x5f4e6c));_0x2a4819[_0xa644('33','x1!1')](_0x31f68a[_0xa644('34','(&xV')](_0x22ba69,0xa));}return _0x2a4819[_0xa644('35','7v1[')]()['replace'](/,/g,'');}function toAscii(_0x2005c9){var _0x25c691={'pVKbQ':_0xa644('36','xR%R'),'kPhnz':function(_0x23657e,_0x2c3cb8){return _0x23657e<<_0x2c3cb8;},'buQPf':function(_0x58d230,_0x30b931){return _0x58d230-_0x30b931;},'ckHFa':function(_0x25f9c9,_0x1ddc81){return _0x25f9c9%_0x1ddc81;},'OXrxA':function(_0x37a84b,_0x453128){return _0x37a84b>>>_0x453128;},'yDmuc':function(_0xced13a,_0x34ed7c){return _0xced13a+_0x34ed7c;},'CQlnV':function(_0x2a2846,_0x51496b){return _0x2a2846<_0x51496b;},'KmFHl':function(_0x3e8881,_0x407e0a){return _0x3e8881^_0x407e0a;},'wzOAO':function(_0x642182,_0x56bbdc){return _0x642182^_0x56bbdc;},'gMeQN':function(_0x4a0454,_0x36329e){return _0x4a0454-_0x36329e;},'YgYwZ':function(_0x349369,_0x52dfaa){return _0x349369|_0x52dfaa;},'LWZZs':function(_0x7bd993,_0x40ecf6){return _0x7bd993<<_0x40ecf6;},'uaPfX':function(_0x24e27d,_0x5cb538){return _0x24e27d>>>_0x5cb538;},'wEzCH':function(_0x1ba797,_0x593919){return _0x1ba797>>>_0x593919;},'FEAPC':function(_0x52b09a,_0x244055){return _0x52b09a>>>_0x244055;},'bXURQ':function(_0x5175cf,_0x5bc22c){return _0x5175cf+_0x5bc22c;},'CSDQj':function(_0x271549,_0x1fca83){return _0x271549|_0x1fca83;},'XvtfU':function(_0x46a0f9,_0xbfdcba){return _0x46a0f9^_0xbfdcba;},'BZaqo':function(_0x21b4de,_0x4b95f0){return _0x21b4de&_0x4b95f0;},'xGMPH':function(_0x438c2c,_0x29dc16){return _0x438c2c&_0x29dc16;},'svXSd':function(_0x302a17,_0x256642){return _0x302a17&_0x256642;},'IvIop':function(_0x3cc114,_0x3e04cd){return _0x3cc114|_0x3e04cd;},'eYWYw':function(_0x3ad691,_0x3e5d51){return _0x3ad691(_0x3e5d51);},'DpGgG':function(_0x8c03e2,_0x2402ce){return _0x8c03e2*_0x2402ce;},'NPNST':function(_0x2641f1,_0x40e387){return _0x2641f1===_0x40e387;}};var _0x34ada4='';for(var _0x35a1fc in _0x2005c9){if(_0x25c691[_0xa644('37','F9qT')]('yshIA',_0xa644('38',')mH%'))){var _0xf4ec3f=_0x2005c9[_0x35a1fc],_0x5f3abf=/[a-zA-Z]/[_0xa644('39','8iRk')](_0xf4ec3f);if(_0x2005c9['hasOwnProperty'](_0x35a1fc))if(_0x5f3abf)_0x34ada4+=getLastAscii(_0xf4ec3f);else _0x34ada4+=_0xf4ec3f;}else{var _0x2ab31f=_0x25c691['pVKbQ'][_0xa644('3a','P4Jo')]('|'),_0x2db898=0x0;while(!![]){switch(_0x2ab31f[_0x2db898++]){case'0':_0x38ac78[_0x54cbbf>>0x5]|=_0x25c691['kPhnz'](0x80,_0x25c691['buQPf'](0x18,_0x25c691['ckHFa'](_0x54cbbf,0x20))),_0x38ac78[0xf+_0x25c691[_0xa644('3b','1f[r')](_0x25c691[_0xa644('3c','W]dr')](_0x25c691['yDmuc'](_0x54cbbf,0x40),0x9),0x4)]=_0x54cbbf;continue;case'1':for(var _0x57dbb7=0x0;_0x25c691[_0xa644('3d','V&QR')](_0x57dbb7,_0x38ac78['length']);_0x57dbb7+=0x10){for(var _0x2f0c49=_0xb8af90,_0x3eec62=_0x59003a,_0x2c069b=_0x4c0c0e,_0x9c507a=_0x42cd89,_0x5cf7ed=_0x3bd041,_0x55211b=0x0;_0x25c691[_0xa644('3e','x1!1')](_0x55211b,0x50);_0x55211b++){if(_0x55211b<0x10)_0x1b69b4[_0x55211b]=_0x38ac78[_0x57dbb7+_0x55211b];else{var _0x2622e4=_0x25c691['KmFHl'](_0x25c691[_0xa644('3f',']vsQ')](_0x1b69b4[_0x55211b-0x3],_0x1b69b4[_0x25c691['buQPf'](_0x55211b,0x8)])^_0x1b69b4[_0x55211b-0xe],_0x1b69b4[_0x25c691['gMeQN'](_0x55211b,0x10)]);_0x1b69b4[_0x55211b]=_0x25c691[_0xa644('40','9W0k')](_0x25c691[_0xa644('41','x1!1')](_0x2622e4,0x1),_0x25c691['uaPfX'](_0x2622e4,0x1f));}var _0x5b9d7f=_0x25c691[_0xa644('42','PSqz')](_0x25c691['YgYwZ'](_0xb8af90<<0x5,_0x25c691[_0xa644('43','9W0k')](_0xb8af90,0x1b))+_0x3bd041+_0x25c691[_0xa644('44','j6Fa')](_0x1b69b4[_0x55211b],0x0),_0x55211b<0x14?_0x25c691['bXURQ'](0x5a827999,_0x25c691['CSDQj'](_0x59003a&_0x4c0c0e,~_0x59003a&_0x42cd89)):_0x25c691[_0xa644('45','tWZo')](_0x55211b,0x28)?_0x25c691[_0xa644('46','iCCr')](0x6ed9eba1,_0x25c691[_0xa644('47','xR%R')](_0x25c691['XvtfU'](_0x59003a,_0x4c0c0e),_0x42cd89)):_0x25c691[_0xa644('48','9W0k')](_0x55211b,0x3c)?_0x25c691['gMeQN'](_0x25c691[_0xa644('49','VNQn')](_0x25c691[_0xa644('4a','xR%R')](_0x25c691[_0xa644('4b','e$Yn')](_0x59003a,_0x4c0c0e),_0x25c691['xGMPH'](_0x59003a,_0x42cd89)),_0x25c691[_0xa644('4c','F@io')](_0x4c0c0e,_0x42cd89)),0x70e44324):_0x25c691[_0xa644('4d',')VFQ')](_0x25c691[_0xa644('4e','Q^T8')](_0x25c691[_0xa644('4f','z&qH')](_0x59003a,_0x4c0c0e),_0x42cd89),0x359d3e2a));_0x3bd041=_0x42cd89,_0x42cd89=_0x4c0c0e,_0x4c0c0e=_0x25c691['IvIop'](_0x25c691[_0xa644('50','ys21')](_0x59003a,0x1e),_0x25c691['FEAPC'](_0x59003a,0x2)),_0x59003a=_0xb8af90,_0xb8af90=_0x5b9d7f;}_0xb8af90+=_0x2f0c49,_0x59003a+=_0x3eec62,_0x4c0c0e+=_0x2c069b,_0x42cd89+=_0x9c507a,_0x3bd041+=_0x5cf7ed;}continue;case'2':var _0x38ac78=_0x25c691[_0xa644('51','kfkc')](bytesToWords,_0x2005c9),_0x54cbbf=_0x25c691[_0xa644('52','ak%m')](0x8,_0x2005c9[_0xa644('53','5X1h')]),_0x1b69b4=[],_0xb8af90=0x67452301,_0x59003a=-0x10325477,_0x4c0c0e=-0x67452302,_0x42cd89=0x10325476,_0x3bd041=-0x3c2d1e10;continue;case'3':_0x2005c9=stringToBytes(_0x2005c9);continue;case'4':return[_0xb8af90,_0x59003a,_0x4c0c0e,_0x42cd89,_0x3bd041];}break;}}}return _0x34ada4;}function add0(_0x1b841e,_0x38305d){var _0x57b05d={'kClkG':function(_0x17e747,_0x3f8a9e){return _0x17e747+_0x3f8a9e;},'ACZAh':function(_0x3cc077,_0x19dd4d){return _0x3cc077(_0x19dd4d);}};return _0x57b05d[_0xa644('54','7Jz]')](_0x57b05d['ACZAh'](Array,_0x38305d)[_0xa644('55','x1!1')]('0'),_0x1b841e)[_0xa644('56','eo14')](-_0x38305d);}function getLastAscii(_0x531a9f){var _0x339d0e=_0x531a9f['charCodeAt'](0x0)[_0xa644('57','pd#*')]();return _0x339d0e[_0x339d0e[_0xa644('58','ak%m')]-0x1];}function wordsToBytes(_0x2154f2){var _0x5934c1={'SyHXx':function(_0x4d2812,_0x102aff){return _0x4d2812&_0x102aff;},'eboNg':function(_0x51a867,_0x29c110){return _0x51a867>>>_0x29c110;},'mueKS':function(_0x2c7454,_0x48aadb){return _0x2c7454-_0x48aadb;},'PXYXW':function(_0x50367a,_0x2ede5d){return _0x50367a%_0x2ede5d;}};for(var _0x525f6c=[],_0x40a59e=0x0;_0x40a59e<0x20*_0x2154f2['length'];_0x40a59e+=0x8)_0x525f6c[_0xa644('59','F9qT')](_0x5934c1['SyHXx'](_0x5934c1[_0xa644('5a','YOvM')](_0x2154f2[_0x5934c1[_0xa644('5b','eo14')](_0x40a59e,0x5)],_0x5934c1['mueKS'](0x18,_0x5934c1[_0xa644('5c','(&xV')](_0x40a59e,0x20))),0xff));return _0x525f6c;}function bytesToHex(_0x2f6535){var _0x10c43b={'HHDTf':function(_0x41d91c,_0x357473){return _0x41d91c>>>_0x357473;},'zCtZs':function(_0x1d4154,_0x10ea41){return _0x1d4154&_0x10ea41;}};for(var _0x5cf0c7=[],_0x2fd835=0x0;_0x2fd835<_0x2f6535[_0xa644('5d','8iRk')];_0x2fd835++)_0x5cf0c7[_0xa644('5e','z&qH')](_0x10c43b[_0xa644('5f','PSqz')](_0x2f6535[_0x2fd835],0x4)[_0xa644('60',')VFQ')](0x10)),_0x5cf0c7[_0xa644('61','pr66')](_0x10c43b[_0xa644('62','FoTx')](0xf,_0x2f6535[_0x2fd835])['toString'](0x10));return _0x5cf0c7[_0xa644('63','pd#*')]('');}function stringToBytes(_0x5f3487){var _0x1e88af={'TkwpC':function(_0x35a3c4,_0x34f25e){return _0x35a3c4(_0x34f25e);},'yxiLn':function(_0x3b5976,_0x4b1e1d){return _0x3b5976(_0x4b1e1d);},'zVfsH':function(_0x45783b,_0x2de0e1){return _0x45783b<_0x2de0e1;},'wemzQ':function(_0x36a934,_0x31d825){return _0x36a934&_0x31d825;}};_0x5f3487=_0x1e88af['TkwpC'](unescape,_0x1e88af[_0xa644('64','V&QR')](encodeURIComponent,_0x5f3487));for(var _0x462c60=[],_0x4491dc=0x0;_0x1e88af[_0xa644('65','8iRk')](_0x4491dc,_0x5f3487[_0xa644('66','V&QR')]);_0x4491dc++)_0x462c60[_0xa644('67','LGvt')](_0x1e88af['wemzQ'](0xff,_0x5f3487[_0xa644('68','Gn$@')](_0x4491dc)));return _0x462c60;}function bytesToWords(_0x59951e){var _0x4029cd={'bchsa':function(_0x44e5e3,_0x214fbf){return _0x44e5e3<_0x214fbf;},'wtPCf':function(_0x3db79e,_0x12e84c){return _0x3db79e>>>_0x12e84c;},'GbYvL':function(_0x113b6e,_0x45a9ba){return _0x113b6e<<_0x45a9ba;},'PhqHI':function(_0x2461a8,_0x578e5b){return _0x2461a8-_0x578e5b;},'afyRw':function(_0x1293c5,_0x50c7c8){return _0x1293c5%_0x50c7c8;}};for(var _0xf749d8=[],_0x2b0d59=0x0,_0xde0662=0x0;_0x4029cd[_0xa644('69','YBEe')](_0x2b0d59,_0x59951e['length']);_0x2b0d59++,_0xde0662+=0x8)_0xf749d8[_0x4029cd[_0xa644('6a','9W0k')](_0xde0662,0x5)]|=_0x4029cd['GbYvL'](_0x59951e[_0x2b0d59],_0x4029cd['PhqHI'](0x18,_0x4029cd[_0xa644('6b','VNQn')](_0xde0662,0x20)));return _0xf749d8;}function crc32(_0x335fc0){var _0x404782={'Zdjdy':function(_0xbf34df,_0x30249c){return _0xbf34df+_0x30249c;},'IQCit':function(_0x26f183,_0x28155e){return _0x26f183-_0x28155e;},'QeghM':function(_0x345879,_0x4e321b){return _0x345879<_0x4e321b;},'NkReu':function(_0x4c736b,_0x3b177a){return _0x4c736b*_0x3b177a;},'bqVHu':function(_0x1260d5,_0x1d4ba6){return _0x1260d5<_0x1d4ba6;},'Akqsd':'cBsWG','PNIcK':_0xa644('6c','429]'),'hDXZX':_0xa644('6d','iCCr'),'dNvTO':function(_0x38e2da,_0x34a572){return _0x38e2da>_0x34a572;},'xwYMx':function(_0x328aa8,_0xb3387b){return _0x328aa8|_0xb3387b;},'ehczE':function(_0x49b3ed,_0x5a30c4){return _0x49b3ed>>_0x5a30c4;},'WwArP':function(_0x2ef0d6,_0x20fdd4){return _0x2ef0d6|_0x20fdd4;},'zKdtr':function(_0x5b35f2,_0x51f5e6){return _0x5b35f2(_0x51f5e6);},'GVOGU':function(_0x146f05,_0x33d264){return _0x146f05^_0x33d264;},'mAvCf':function(_0x14caee,_0x5f159e){return _0x14caee^_0x5f159e;},'FmGHa':function(_0x32d8fd,_0x237c44){return _0x32d8fd&_0x237c44;},'heYfh':function(_0xbf647f,_0x40fb96){return _0xbf647f>>>_0x40fb96;},'fRsTG':function(_0x52391c,_0x51304f){return _0x52391c>>>_0x51304f;},'fPgmN':function(_0x144adf,_0x148e3c){return _0x144adf^_0x148e3c;}};function _0x4e8e27(_0x2a63c4){var _0x16da8f={'SWsdo':function(_0x254eae,_0x188199){return _0x404782[_0xa644('6e','gsi#')](_0x254eae,_0x188199);},'zbQBd':function(_0x134271,_0x151ec6){return _0x404782['IQCit'](_0x134271,_0x151ec6);}};_0x2a63c4=_0x2a63c4[_0xa644('6f','pr66')](/\r\n/g,'\x0a');var _0x31ea1c='';for(var _0x215b33=0x0;_0x215b33<_0x2a63c4[_0xa644('70','429]')];_0x215b33++){if(_0xa644('71','9W0k')===_0x404782[_0xa644('72','PSqz')]){let _0x2051de='',_0x4bab03=min,_0x456b18=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];if(randomFlag){_0x4bab03=_0x404782[_0xa644('73','5X1h')](Math[_0xa644('74','C#aE')](Math[_0xa644('75','e$Yn')]()*_0x404782[_0xa644('76','jPSO')](max,min)),min);}for(let _0x3a495d=0x0;_0x404782[_0xa644('77','pr66')](_0x3a495d,_0x4bab03);_0x3a495d++){pos=Math[_0xa644('78','LGvt')](_0x404782['NkReu'](Math[_0xa644('79','FoTx')](),_0x404782['IQCit'](_0x456b18['length'],0x1)));_0x2051de+=_0x456b18[pos];}return _0x2051de;}else{var _0x1787b1=_0x2a63c4['charCodeAt'](_0x215b33);if(_0x404782[_0xa644('7a','j6Fa')](_0x1787b1,0x80)){if(_0x404782['PNIcK']===_0x404782[_0xa644('7b','5X1h')]){for(var _0x137c62=[],_0x13de8c=0x0,_0x2476a8=0x0;_0x16da8f['SWsdo'](_0x13de8c,t[_0xa644('7c','iCCr')]);_0x13de8c++,_0x2476a8+=0x8)_0x137c62[_0x2476a8>>>0x5]|=t[_0x13de8c]<<_0x16da8f[_0xa644('7d','kfkc')](0x18,_0x2476a8%0x20);return _0x137c62;}else{_0x31ea1c+=String[_0xa644('7e','LGvt')](_0x1787b1);}}else if(_0x404782['dNvTO'](_0x1787b1,0x7f)&&_0x1787b1<0x800){_0x31ea1c+=String[_0xa644('7f','7v1[')](_0x404782[_0xa644('80','#ZCr')](_0x1787b1>>0x6,0xc0));_0x31ea1c+=String[_0xa644('81','tWZo')](_0x404782[_0xa644('82','ak%m')](_0x1787b1&0x3f,0x80));}else{_0x31ea1c+=String[_0xa644('83','P4Jo')](_0x404782[_0xa644('84','gRCF')](_0x1787b1,0xc)|0xe0);_0x31ea1c+=String[_0xa644('85','Q^T8')](_0x404782[_0xa644('86','(0wv')](_0x404782['ehczE'](_0x1787b1,0x6)&0x3f,0x80));_0x31ea1c+=String[_0xa644('87',')VFQ')](_0x404782[_0xa644('88','ak%m')](_0x1787b1&0x3f,0x80));}}}return _0x31ea1c;};_0x335fc0=_0x404782[_0xa644('89','F@io')](_0x4e8e27,_0x335fc0);var _0x1dbf34=[0x0,0x77073096,0xee0e612c,0x990951ba,0x76dc419,0x706af48f,0xe963a535,0x9e6495a3,0xedb8832,0x79dcb8a4,0xe0d5e91e,0x97d2d988,0x9b64c2b,0x7eb17cbd,0xe7b82d07,0x90bf1d91,0x1db71064,0x6ab020f2,0xf3b97148,0x84be41de,0x1adad47d,0x6ddde4eb,0xf4d4b551,0x83d385c7,0x136c9856,0x646ba8c0,0xfd62f97a,0x8a65c9ec,0x14015c4f,0x63066cd9,0xfa0f3d63,0x8d080df5,0x3b6e20c8,0x4c69105e,0xd56041e4,0xa2677172,0x3c03e4d1,0x4b04d447,0xd20d85fd,0xa50ab56b,0x35b5a8fa,0x42b2986c,0xdbbbc9d6,0xacbcf940,0x32d86ce3,0x45df5c75,0xdcd60dcf,0xabd13d59,0x26d930ac,0x51de003a,0xc8d75180,0xbfd06116,0x21b4f4b5,0x56b3c423,0xcfba9599,0xb8bda50f,0x2802b89e,0x5f058808,0xc60cd9b2,0xb10be924,0x2f6f7c87,0x58684c11,0xc1611dab,0xb6662d3d,0x76dc4190,0x1db7106,0x98d220bc,0xefd5102a,0x71b18589,0x6b6b51f,0x9fbfe4a5,0xe8b8d433,0x7807c9a2,0xf00f934,0x9609a88e,0xe10e9818,0x7f6a0dbb,0x86d3d2d,0x91646c97,0xe6635c01,0x6b6b51f4,0x1c6c6162,0x856530d8,0xf262004e,0x6c0695ed,0x1b01a57b,0x8208f4c1,0xf50fc457,0x65b0d9c6,0x12b7e950,0x8bbeb8ea,0xfcb9887c,0x62dd1ddf,0x15da2d49,0x8cd37cf3,0xfbd44c65,0x4db26158,0x3ab551ce,0xa3bc0074,0xd4bb30e2,0x4adfa541,0x3dd895d7,0xa4d1c46d,0xd3d6f4fb,0x4369e96a,0x346ed9fc,0xad678846,0xda60b8d0,0x44042d73,0x33031de5,0xaa0a4c5f,0xdd0d7cc9,0x5005713c,0x270241aa,0xbe0b1010,0xc90c2086,0x5768b525,0x206f85b3,0xb966d409,0xce61e49f,0x5edef90e,0x29d9c998,0xb0d09822,0xc7d7a8b4,0x59b33d17,0x2eb40d81,0xb7bd5c3b,0xc0ba6cad,0xedb88320,0x9abfb3b6,0x3b6e20c,0x74b1d29a,0xead54739,0x9dd277af,0x4db2615,0x73dc1683,0xe3630b12,0x94643b84,0xd6d6a3e,0x7a6a5aa8,0xe40ecf0b,0x9309ff9d,0xa00ae27,0x7d079eb1,0xf00f9344,0x8708a3d2,0x1e01f268,0x6906c2fe,0xf762575d,0x806567cb,0x196c3671,0x6e6b06e7,0xfed41b76,0x89d32be0,0x10da7a5a,0x67dd4acc,0xf9b9df6f,0x8ebeeff9,0x17b7be43,0x60b08ed5,0xd6d6a3e8,0xa1d1937e,0x38d8c2c4,0x4fdff252,0xd1bb67f1,0xa6bc5767,0x3fb506dd,0x48b2364b,0xd80d2bda,0xaf0a1b4c,0x36034af6,0x41047a60,0xdf60efc3,0xa867df55,0x316e8eef,0x4669be79,0xcb61b38c,0xbc66831a,0x256fd2a0,0x5268e236,0xcc0c7795,0xbb0b4703,0x220216b9,0x5505262f,0xc5ba3bbe,0xb2bd0b28,0x2bb45a92,0x5cb36a04,0xc2d7ffa7,0xb5d0cf31,0x2cd99e8b,0x5bdeae1d,0x9b64c2b0,0xec63f226,0x756aa39c,0x26d930a,0x9c0906a9,0xeb0e363f,0x72076785,0x5005713,0x95bf4a82,0xe2b87a14,0x7bb12bae,0xcb61b38,0x92d28e9b,0xe5d5be0d,0x7cdcefb7,0xbdbdf21,0x86d3d2d4,0xf1d4e242,0x68ddb3f8,0x1fda836e,0x81be16cd,0xf6b9265b,0x6fb077e1,0x18b74777,0x88085ae6,0xff0f6a70,0x66063bca,0x11010b5c,0x8f659eff,0xf862ae69,0x616bffd3,0x166ccf45,0xa00ae278,0xd70dd2ee,0x4e048354,0x3903b3c2,0xa7672661,0xd06016f7,0x4969474d,0x3e6e77db,0xaed16a4a,0xd9d65adc,0x40df0b66,0x37d83bf0,0xa9bcae53,0xdebb9ec5,0x47b2cf7f,0x30b5ffe9,0xbdbdf21c,0xcabac28a,0x53b39330,0x24b4a3a6,0xbad03605,0xcdd70693,0x54de5729,0x23d967bf,0xb3667a2e,0xc4614ab8,0x5d681b02,0x2a6f2b94,0xb40bbe37,0xc30c8ea1,0x5a05df1b,0x2d02ef8d];var _0x471a27=0x0;var _0x70eece=0x0;_0x70eece=_0x404782[_0xa644('8a','CyKB')](_0x70eece,-0x1);for(var _0x3dcd3f=0x0,_0x4b0817=_0x335fc0['length'];_0x3dcd3f<_0x4b0817;_0x3dcd3f++){_0x471a27=_0x335fc0[_0xa644('8b','42v*')](_0x3dcd3f);_0x70eece=_0x404782[_0xa644('8c','ys21')](_0x1dbf34[_0x404782[_0xa644('8d','ys21')](0xff,_0x70eece^_0x471a27)],_0x404782[_0xa644('8e','ys21')](_0x70eece,0x8));}return _0x404782[_0xa644('8f','V&QR')](_0x404782['fPgmN'](-0x1,_0x70eece),0x0);};function getBody(){var _0x5a88e8={'vARmA':function(_0x500d41,_0x891483){return _0x500d41+_0x891483;},'gVizO':'MDFsRmVxaDAxMQ','gfiBb':function(_0x1a7205,_0x4854b1,_0x456641){return _0x1a7205(_0x4854b1,_0x456641);},'KJqAt':function(_0x5191f5,_0x5b79d8){return _0x5191f5(_0x5b79d8);},'fnOOC':function(_0x1b47fa,_0x4129be){return _0x1b47fa+_0x4129be;},'tgyNX':function(_0x53432d,_0xaa9d7f){return _0x53432d+_0xaa9d7f;},'PmDNw':function(_0x268593,_0x5a875f){return _0x268593+_0x5a875f;}};let _0x4cae15=Math[_0xa644('90','pr66')](_0x5a88e8[_0xa644('91','Q^T8')](0xf4240,0x895440*Math['random']()))[_0xa644('92','1f[r')]();let _0x362b4b=_0x5a88e8[_0xa644('93','9W0k')];let _0x3cdd8c=_0x5a88e8[_0xa644('94','YOvM')](randomWord,![],0xa);let _0x8064f9=Date[_0xa644('95','P4Jo')]();let _0x6fbd15=getKey(_0x8064f9,_0x3cdd8c);let _0x3f1cc4='random='+_0x4cae15+_0xa644('96','4I]k')+_0x362b4b+'&time='+_0x8064f9+'&nonce_str='+_0x3cdd8c+_0xa644('97','42v*')+_0x6fbd15+'&is_trust=1';let _0x427270=_0x5a88e8[_0xa644('98','7Jz]')](bytesToHex,_0x5a88e8[_0xa644('99','8iRk')](wordsToBytes,_0x5a88e8[_0xa644('9a','iCCr')](getSign,_0x3f1cc4)))[_0xa644('9b','FoTx')]();let _0x2cea2f=crc32(_0x427270)['toString'](0x24);_0x2cea2f=_0x5a88e8[_0xa644('9c','W]dr')](add0,_0x2cea2f,0x7);_0x427270=_0x5a88e8[_0xa644('9d',']vsQ')](_0x5a88e8[_0xa644('9e','e$Yn')](_0x5a88e8['fnOOC'](_0x5a88e8[_0xa644('9f','V&QR')](_0x5a88e8['fnOOC'](_0x5a88e8['tgyNX'](_0x5a88e8[_0xa644('a0','x1!1')](_0x5a88e8['PmDNw'](_0x8064f9[_0xa644('a1','gsi#')]()+'~1'+_0x3cdd8c,_0x362b4b),_0xa644('a2','C#aE')),_0x427270)+'~',_0x2cea2f),_0xa644('a3','FoTx')),_0x427270),'~'),_0x2cea2f);s=JSON['stringify']({'extraData':{'log':_0x5a88e8[_0xa644('a4','FoTx')](encodeURIComponent,_0x427270),'sceneid':_0xa644('a5','Wkzc')},'secretp':$.secretp,'random':_0x4cae15[_0xa644('a6','kfkc')]()});return s;}function getSign(_0x5f5deb){var _0x1a5240={'GyoUH':function(_0x2b86d4,_0x2030bb){return _0x2b86d4<_0x2030bb;},'DKvYH':function(_0x1d7340,_0x589e4f){return _0x1d7340+_0x589e4f;},'RsKvP':function(_0x494dc6,_0x9c7ae){return _0x494dc6^_0x9c7ae;},'BFxWh':function(_0x17834f,_0x2cd7a0){return _0x17834f^_0x2cd7a0;},'oVqbc':function(_0x276eae,_0x29cfae){return _0x276eae-_0x29cfae;},'ERZhH':function(_0x594220,_0x3099f4){return _0x594220-_0x3099f4;},'iIpZI':function(_0x32a35d,_0x9f347a){return _0x32a35d-_0x9f347a;},'kVuYf':function(_0x2f0539,_0x472dbd){return _0x2f0539-_0x472dbd;},'LzNQv':function(_0xea60f6,_0x68af26){return _0xea60f6|_0x68af26;},'OCIuN':function(_0x91e0d6,_0x411efc){return _0x91e0d6<<_0x411efc;},'wmheY':function(_0x445917,_0x6453f4){return _0x445917+_0x6453f4;},'oZmuD':function(_0x589ef9,_0x58c926){return _0x589ef9+_0x58c926;},'UdIIh':function(_0x4830b5,_0x21cf47){return _0x4830b5>>>_0x21cf47;},'lEwDg':function(_0x41823c,_0x38cf15){return _0x41823c&_0x38cf15;},'PKsSH':function(_0x46db74,_0x266db2){return _0x46db74<_0x266db2;},'NdSHK':function(_0x5dfe56,_0x1972f8){return _0x5dfe56&_0x1972f8;},'YDfwX':function(_0x3c9618,_0x3c446b){return _0x3c9618^_0x3c446b;},'hLAII':function(_0x4a04ae,_0x4eae69){return _0x4a04ae|_0x4eae69;},'WhARA':function(_0x372471,_0x1c2e31){return _0x372471<<_0x1c2e31;},'eSdmw':function(_0x36fff6,_0x4961ca){return _0x36fff6>=_0x4961ca;},'bQqCJ':function(_0x2c6523,_0x3e4e4b){return _0x2c6523(_0x3e4e4b);},'AUKco':function(_0x44befa,_0x35746e){return _0x44befa(_0x35746e);},'PtsYB':function(_0x3433f8,_0x1e804f){return _0x3433f8*_0x1e804f;},'OtSKH':function(_0xb7a295,_0x4f7d26){return _0xb7a295>>_0x4f7d26;},'uMmhf':function(_0x43281e,_0x1302a3){return _0x43281e<<_0x1302a3;},'VvKIf':function(_0x18fd69,_0x2b6f7e){return _0x18fd69%_0x2b6f7e;},'ZpZrd':'anPhX','CTqPN':_0xa644('a7','OZ60'),'nqQAq':function(_0xd46ba0,_0x9c68e2){return _0xd46ba0+_0x9c68e2;},'FsfDJ':function(_0x33511b,_0x327e4b){return _0x33511b^_0x327e4b;},'tZLwV':function(_0x1935b5,_0x3cd2a8){return _0x1935b5^_0x3cd2a8;},'IaFEX':function(_0x5e77d7,_0x56e6f2){return _0x5e77d7-_0x56e6f2;},'EwhXA':function(_0x2767c2,_0x15cdf0){return _0x2767c2-_0x15cdf0;},'BfOjL':function(_0x303067,_0x2f5e95){return _0x303067-_0x2f5e95;},'MFzLJ':function(_0x5a4a85,_0x4628e2){return _0x5a4a85|_0x4628e2;},'MnTkq':function(_0xb67369,_0x9786e7){return _0xb67369+_0x9786e7;},'znjpL':function(_0x344d59,_0x5a6dca){return _0x344d59<<_0x5a6dca;},'Ncxsr':function(_0x1e3cb1,_0xeacced){return _0x1e3cb1+_0xeacced;},'HDkaD':function(_0x151bc4,_0x203536){return _0x151bc4|_0x203536;},'Gssvp':function(_0xb1a5f2,_0x2c9135){return _0xb1a5f2^_0x2c9135;},'rqnke':function(_0x500515,_0x4170ac){return _0x500515^_0x4170ac;},'CCvGF':function(_0xb164e8,_0x3a6bee){return _0xb164e8|_0x3a6bee;},'vUxrg':function(_0x310ade,_0x2959dc){return _0x310ade&_0x2959dc;},'tRReX':function(_0x40fcfd,_0x5da169){return _0x40fcfd-_0x5da169;}};_0x5f5deb=_0x1a5240[_0xa644('a8','eo14')](stringToBytes,_0x5f5deb);var _0xafb47e=_0x1a5240[_0xa644('a9','jPSO')](bytesToWords,_0x5f5deb),_0x1fe544=_0x1a5240[_0xa644('aa','G)Q7')](0x8,_0x5f5deb[_0xa644('ab',')VFQ')]),_0x3292cf=[],_0x5055e4=0x67452301,_0x166b4c=-0x10325477,_0x2d45f3=-0x67452302,_0x536f6e=0x10325476,_0x5f3cb0=-0x3c2d1e10;_0xafb47e[_0x1a5240[_0xa644('ac',']vsQ')](_0x1fe544,0x5)]|=_0x1a5240[_0xa644('ad','LGvt')](0x80,0x18-_0x1a5240[_0xa644('ae','xR%R')](_0x1fe544,0x20)),_0xafb47e[0xf+_0x1a5240['uMmhf'](_0x1a5240[_0xa644('af','ys21')](_0x1fe544+0x40,0x9),0x4)]=_0x1fe544;for(var _0x3a1564=0x0;_0x3a1564<_0xafb47e[_0xa644('7c','iCCr')];_0x3a1564+=0x10){if(_0x1a5240[_0xa644('b0','7Jz]')]===_0xa644('b1','ak%m')){for(var _0x19a7bb=_0x5055e4,_0x4d69b0=_0x166b4c,_0x1d0402=_0x2d45f3,_0x2fda5b=_0x536f6e,_0x18b678=_0x5f3cb0,_0x5e6685=0x0;_0x1a5240[_0xa644('b2','jPSO')](_0x5e6685,0x50);_0x5e6685++){if(_0xa644('b3','8iRk')===_0x1a5240['CTqPN']){for(var _0x3b1710=_0x5055e4,_0x32ff35=_0x166b4c,_0x509d19=_0x2d45f3,_0xa86022=_0x536f6e,_0x4c89a9=_0x5f3cb0,_0x40d757=0x0;_0x40d757<0x50;_0x40d757++){if(_0x1a5240[_0xa644('b4','e$Yn')](_0x40d757,0x10))_0x3292cf[_0x40d757]=_0xafb47e[_0x1a5240[_0xa644('b5','ak%m')](_0x3a1564,_0x40d757)];else{var _0x2e70e6=_0x1a5240[_0xa644('b6','ak%m')](_0x1a5240['BFxWh'](_0x3292cf[_0x1a5240['oVqbc'](_0x40d757,0x3)]^_0x3292cf[_0x1a5240['ERZhH'](_0x40d757,0x8)],_0x3292cf[_0x1a5240[_0xa644('b7','ys21')](_0x40d757,0xe)]),_0x3292cf[_0x1a5240[_0xa644('b8','429]')](_0x40d757,0x10)]);_0x3292cf[_0x40d757]=_0x1a5240[_0xa644('b9',')mH%')](_0x1a5240['OCIuN'](_0x2e70e6,0x1),_0x2e70e6>>>0x1f);}var _0x413b2b=_0x1a5240['wmheY'](_0x1a5240['oZmuD'](_0x1a5240[_0xa644('ba','pr66')](_0x1a5240[_0xa644('bb','gRCF')](_0x5055e4<<0x5,_0x1a5240[_0xa644('bc','8iRk')](_0x5055e4,0x1b)),_0x5f3cb0),_0x1a5240[_0xa644('bd','V&QR')](_0x3292cf[_0x40d757],0x0)),_0x1a5240['GyoUH'](_0x40d757,0x14)?0x5a827999+_0x1a5240[_0xa644('be','4I]k')](_0x1a5240[_0xa644('bf','V&QR')](_0x166b4c,_0x2d45f3),_0x1a5240['lEwDg'](~_0x166b4c,_0x536f6e)):_0x1a5240['GyoUH'](_0x40d757,0x28)?0x6ed9eba1+_0x1a5240['BFxWh'](_0x1a5240[_0xa644('c0','pd#*')](_0x166b4c,_0x2d45f3),_0x536f6e):_0x1a5240[_0xa644('c1','Q^T8')](_0x40d757,0x3c)?_0x1a5240[_0xa644('c2','G)Q7')](_0x1a5240[_0xa644('c3','Q^T8')](_0x1a5240[_0xa644('bf','V&QR')](_0x166b4c,_0x2d45f3),_0x166b4c&_0x536f6e)|_0x1a5240[_0xa644('c4','8iRk')](_0x2d45f3,_0x536f6e),0x70e44324):_0x1a5240[_0xa644('c5','YBEe')](_0x1a5240[_0xa644('c6','Q^T8')](_0x1a5240[_0xa644('c7','kfkc')](_0x166b4c,_0x2d45f3),_0x536f6e),0x359d3e2a));_0x5f3cb0=_0x536f6e,_0x536f6e=_0x2d45f3,_0x2d45f3=_0x1a5240['hLAII'](_0x1a5240[_0xa644('c8','Gn$@')](_0x166b4c,0x1e),_0x166b4c>>>0x2),_0x166b4c=_0x5055e4,_0x5055e4=_0x413b2b;}_0x5055e4+=_0x3b1710,_0x166b4c+=_0x32ff35,_0x2d45f3+=_0x509d19,_0x536f6e+=_0xa86022,_0x5f3cb0+=_0x4c89a9;}else{if(_0x5e6685<0x10)_0x3292cf[_0x5e6685]=_0xafb47e[_0x1a5240[_0xa644('c9','z&qH')](_0x3a1564,_0x5e6685)];else{var _0x264554=_0x1a5240[_0xa644('ca','j6Fa')](_0x1a5240['tZLwV'](_0x1a5240[_0xa644('cb','kfkc')](_0x3292cf[_0x1a5240[_0xa644('cc','YOvM')](_0x5e6685,0x3)],_0x3292cf[_0x5e6685-0x8]),_0x3292cf[_0x1a5240[_0xa644('cd','#ZCr')](_0x5e6685,0xe)]),_0x3292cf[_0x1a5240[_0xa644('ce','xR%R')](_0x5e6685,0x10)]);_0x3292cf[_0x5e6685]=_0x1a5240['MFzLJ'](_0x264554<<0x1,_0x1a5240['UdIIh'](_0x264554,0x1f));}var _0x2596cc=_0x1a5240[_0xa644('cf','C#aE')]((_0x1a5240[_0xa644('d0','x1!1')](_0x5055e4,0x5)|_0x1a5240['UdIIh'](_0x5055e4,0x1b))+_0x5f3cb0+_0x1a5240['UdIIh'](_0x3292cf[_0x5e6685],0x0),_0x1a5240[_0xa644('d1','VNQn')](_0x5e6685,0x14)?_0x1a5240['Ncxsr'](0x5a827999,_0x1a5240[_0xa644('d2','FoTx')](_0x166b4c&_0x2d45f3,_0x1a5240[_0xa644('d3','OZ60')](~_0x166b4c,_0x536f6e))):_0x1a5240['PKsSH'](_0x5e6685,0x28)?0x6ed9eba1+_0x1a5240[_0xa644('d4',')VFQ')](_0x1a5240['rqnke'](_0x166b4c,_0x2d45f3),_0x536f6e):_0x1a5240['PKsSH'](_0x5e6685,0x3c)?_0x1a5240[_0xa644('d5','7v1[')](_0x1a5240[_0xa644('d6','Wkzc')](_0x1a5240['CCvGF'](_0x1a5240[_0xa644('d7','Wkzc')](_0x166b4c,_0x2d45f3),_0x1a5240[_0xa644('d8','Wkzc')](_0x166b4c,_0x536f6e)),_0x2d45f3&_0x536f6e),0x70e44324):_0x1a5240[_0xa644('d9','F9qT')](_0x1a5240[_0xa644('da','8iRk')](_0x166b4c,_0x2d45f3)^_0x536f6e,0x359d3e2a));_0x5f3cb0=_0x536f6e,_0x536f6e=_0x2d45f3,_0x2d45f3=_0x1a5240['znjpL'](_0x166b4c,0x1e)|_0x166b4c>>>0x2,_0x166b4c=_0x5055e4,_0x5055e4=_0x2596cc;}}_0x5055e4+=_0x19a7bb,_0x166b4c+=_0x4d69b0,_0x2d45f3+=_0x1d0402,_0x536f6e+=_0x2fda5b,_0x5f3cb0+=_0x18b678;}else{j=_0x1fe544;if(_0x1a5240[_0xa644('db','C#aE')](j,nonstr['length']))j-=nonstr[_0xa644('dc','4I]k')];_0x3292cf=time[_0xa644('dd','Wkzc')]()[_0xa644('de','x1!1')](_0x1fe544)^nonstr[_0xa644('df','pd#*')](j);key[_0xa644('e0','e$Yn')](_0x3292cf%0xa);}}return[_0x5055e4,_0x166b4c,_0x2d45f3,_0x536f6e,_0x5f3cb0];};_0xodX='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


