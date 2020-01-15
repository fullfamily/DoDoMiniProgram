const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatTimeNew = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute].map(formatNumber).join(':')
}

const date2String = date => {
  // var date = new Date(String(orderDetail.departureTime)),
  var year = date.getFullYear()
  var month = date.getMonth()
  var day = date.getDate()
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var departureTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
  return departureTime
}
const date = new Date();
var multiArray = [];
var multiIndex = [];
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];

// 获取当下时间对应的index 存入multiIndex中
multiIndex.push(0);
multiIndex.push(date.getMonth());
multiIndex.push(date.getDate());
multiIndex.push(date.getHours());
multiIndex.push(date.getMinutes());
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 5; i++) {
  years.push("" + i + "年");
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i + "月");
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i + "日");
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i + "时");
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i + "分");
}
multiArray = [years, months, days, hours, minutes];

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatTimeNew: formatTimeNew,
  date2String: date2String,
  years: years,
  months: months,
  days: days,
  hours: hours,
  minutes: minutes,
  multiArray: multiArray,
  multiIndex: multiIndex,
}