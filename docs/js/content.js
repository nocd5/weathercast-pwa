var StatusDict = {};

var prefecture;
var point;
var fav_star;
var title;
var obs_loc;
var interval_switch;

document.addEventListener('DOMContentLoaded', () => {
  prefecture = document.getElementById('prefecture');
  point = document.getElementById('point');
  fav_star = document.getElementById('fav_star');
  title = document.getElementById('title');
  obs_loc = document.getElementById('obs_loc');
  interval_switch = document.getElementById('interval_switch');

  var pref = ['お気に入り']
  ame_master.forEach(e => pref.push(e['都府県振興局']));
  pref = pref.filter((x, i, self) => self.indexOf(x) === i);
  pref.forEach(e => {
    var o = document.createElement('option');
    o.innerHTML = e;
    prefecture.appendChild(o);
  });

  prefecture.addEventListener('change', prefecture_onchange);
  point.addEventListener('change', point_onchange);
  fav_star.addEventListener('click', fav_star_onclick);
  interval_switch.addEventListener('change', ()  => {
    var today_weather = document.querySelector('#today #today_weather');
    if (interval_switch.checked) {
      if (today_weather.classList.contains('per-3-hour')) {
        today_weather.classList.toggle('per-3-hour');
      }
    }
    else {
      today_weather.classList.add('per-3-hour');
    }
  });

  var j = localStorage.getItem('StatusDict');
  if (j !== null) {
    StatusDict = JSON.parse(j);
    prefecture.selectedIndex = StatusDict['prefecture'];
    prefecture_onchange();
    point.selectedIndex = StatusDict['point'];
  }
  else {
    var p = 0;
    prefecture.childNodes.forEach((e, i) => {
      if (e.text == '東京') p = i;
    });
    prefecture.selectedIndex = p;
    prefecture_onchange();
    point.childNodes.forEach((e, i) => {
      if (e.text == '東京') p = i;
    });
    point.selectedIndex = p;
  }
  point_onchange();
});

function prefecture_onchange() {
  StatusDict['prefecture'] = prefecture.selectedIndex;
  localStorage.setItem('StatusDict', JSON.stringify(StatusDict));

  var pref = prefecture.selectedOptions[0].text;

  var l = [];
  if (pref == 'お気に入り') {
    l = StatusDict['favorite'] || [];
  }
  else {
    var l = ame_master.filter(e => e['都府県振興局'] == pref);
  }

  point.innerHTML = '';
  var p = document.createElement('option');
  p.innerHTML = '';
  point.appendChild(p);
  l.forEach(e => {
    var p = document.createElement('option');
    p.setAttribute('value', e['観測所番号']);
    p.innerHTML = e['観測所名'];
    point.appendChild(p);
  });

  if (fav_star.classList.contains('fav')) {
    fav_star.classList.toggle('fav');
  }
}

function point_onchange() {
  StatusDict['point'] = point.selectedIndex;
  localStorage.setItem('StatusDict', JSON.stringify(StatusDict));

  if (point.selectedOptions[0] == null) return;
  var id = point.selectedOptions[0].value;
  if (id == '') return;
  title.innerHTML = point.selectedOptions[0].text +'の天気';
  obs_loc.innerHTML = '(' + ame_master.filter(e => e['観測所番号'] == id)[0]['所在地'] + ')'
  getWeather(point.selectedOptions[0].value)
    .catch(err => drawData(null))
    .then(json => drawData(json))

  if (StatusDict['favorite'] == null) return;
  if (StatusDict['favorite'].filter(e => e['観測所番号'] === id).length > 0) {
    fav_star.classList.add('fav');
  }
  else {
    if (fav_star.classList.contains('fav')) {
      fav_star.classList.toggle('fav');
    }
  }
}

function fav_star_onclick() {
  fav_star.classList.toggle('fav');
  if (fav_star.classList.contains('fav')) {
    if (StatusDict['favorite'] == null) {
      StatusDict['favorite'] = [];
    }
    StatusDict['favorite'].push({
      '観測所番号': point.selectedOptions[0].value,
      '観測所名': point.selectedOptions[0].text
    });
  }
  else {
    if (StatusDict['favorite'] == null) return;
    StatusDict['favorite'] = StatusDict['favorite'].filter(e =>
      e['観測所番号'] !== point.selectedOptions[0].value);
  }
  localStorage.setItem('StatusDict', JSON.stringify(StatusDict));
}

function drawData(json) {
  var today_weather = document.getElementById('today_weather');
  var today_comment = document.getElementById('today_comment');
  var week_weather = document.getElementById('week_weather');
  var week_comment = document.getElementById('week_comment');

  if (!json) {
    today_weather.innerHTML = '読み込みに失敗しました';
    today_comment.innerHTML = '';
    week_weather.innerHTML = '読み込みに失敗しました';
    week_comment.innerHTML = '';
    return;
  }

  var startHour = Number(json.weathernews.data.day._startHour);

  // Today
  today_weather.innerHTML = '';
  json.weathernews.data.day.weather.hour.forEach((e, i) => {
    var elem = document.createElement('span');
    elem.classList.add('date-weather');

    var date = document.createElement('span');
    var dt = new Date(
      Number(json.weathernews.data.day._startYear),
      Number(json.weathernews.data.day._startMonth) - 1,
      Number(json.weathernews.data.day._startDate) + Math.floor((i+startHour) / 24)
    );
    date.innerHTML = dt.getDate() + '日';
    date.classList.add('date-date');

    var time = document.createElement('span');
    time.innerHTML = (i+startHour) % 24 + '時';

    var img = document.createElement('img');
    img.classList.add('weather-icon');
    fetch('https://mwsgvs.weathernews.jp/s/img/telop/'+e+'.png')
      .then(resp => img.setAttribute('src', resp.url))

    var tmp = document.createElement('span');
    tmp.innerHTML = json.weathernews.data.day.temperature.hour[i] + json.weathernews.data.day.temperature._unit;

    var precipitation = document.createElement('span');
    precipitation.classList.add('precipitation');
    var pv = document.createElement('span');
    var pu = document.createElement('span');
    pu.classList.add('precipitation-unit');
    pv.innerHTML = json.weathernews.data.day.precipitation.hour[i];
    pu.innerHTML = json.weathernews.data.day.precipitation._unit;
    precipitation.appendChild(pv);
    precipitation.appendChild(pu);

    var wind = document.createElement('span');
    wind.classList.add('wind');
    var wv = document.createElement('span');
    var wu = document.createElement('span');
    wu.classList.add('wind-unit');
    wv.innerHTML = json.weathernews.data.day.wind.hour[i].value;
    wu.innerHTML = json.weathernews.data.day.wind._unit;
    wind.appendChild(wv);
    wind.appendChild(wu);
    var wind_direction = document.createElement('span');
    wind_direction.classList.add('wind-direction');
    wind_direction.innerHTML = [
      '北北東', '北東', '東北東', '東',
      '東南東', '南東', '南南東', '南',
      '南南西', '南西', '西南西', '西',
      '西北西', '北西', '北北西', '北',
    ][json.weathernews.data.day.wind.hour[i].direction - 1];

    elem.appendChild(date);
    elem.appendChild(time);
    elem.appendChild(img);
    elem.appendChild(tmp);
    elem.appendChild(precipitation);
    elem.appendChild(wind);
    elem.appendChild(wind_direction);
    today_weather.appendChild(elem);
  });

  fetch('https://weathernews.jp' + json.weathernews.comments.day)
    .then(resp => resp.text())
    .then(comment => today_comment.innerHTML = comment);

  // Week
  week_weather.innerHTML = '';
  json.weathernews.data.week.weather.day.forEach((e, i) => {
    var elem = document.createElement('span');
    elem.classList.add('date-weather');

    var date = document.createElement('span');
    date.innerHTML = 
          json.weathernews.date.week.day[i].date +
          '(' + '日月火水木金土'[json.weathernews.date.week.day[i].day] + ')';
    date.classList.add('week-date');
    if (json.weathernews.date.week.day[i].holiday == 1)
      date.classList.add('holiday');
    if (json.weathernews.date.week.day[i].day == 6)
      date.classList.add('saturday');

    var img = document.createElement('img');
    img.classList.add('weather-icon');
    fetch('https://mwsgvs.weathernews.jp/s/img/telop/'+e+'.png')
      .then(resp => img.setAttribute('src', resp.url))

    var max = document.createElement('span');
    max.classList.add('temperature-max');
    max.innerHTML = json.weathernews.data.week.temperature.day[i].max + json.weathernews.data.week.temperature._unit;

    var min = document.createElement('span');
    min.classList.add('temperature-min');
    min.innerHTML = json.weathernews.data.week.temperature.day[i].min + json.weathernews.data.week.temperature._unit;

    var chance_of_rain = document.createElement('span');
    chance_of_rain.innerHTML = json.weathernews.data.week.chance_of_rain.day[i] + json.weathernews.data.week.chance_of_rain._unit;

    elem.appendChild(date);
    elem.appendChild(img);
    elem.appendChild(max);
    elem.appendChild(min);
    elem.appendChild(chance_of_rain);
    week_weather.appendChild(elem);
  });
  fetch('https://weathernews.jp' + json.weathernews.comments.week)
    .then(resp => resp.text())
    .then(comment => week_comment.innerHTML = comment);
}

function getWeather(id) {
  if (id != '') {
    return fetch('https://weathernews.jp/pinpoint/xml/'+id+'.xml')
      .then(resp => resp.text())
      .then(xml => (new X2JS()).xml_str2json(xml));
  }
  else {
    return new Promise(e => null);
  }
}
