/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  request = require('request'),
  _ = require('lodash'),
  Q = require('q'),
  local = require('./local'),
  GITHUB_KEY = local.GITHUB_KEY

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.sendfile('public/index.html')
});

app.get('/users/:user', function (req, res) {
  var path = '/users/' + req.param('user', 'Zolmeister') + '/repos'
  console.log('getting user repos')
  githubReq(path).then(function(repos) {
    var reqs = []
    var dates = []
    for (var i = 0; i < repos.length; i++) {
      var repo = repos[i]
      var name = repo.name
      var owner = repo.owner.login
      var date = new Date(repo.created_at).getFullYear()
      dates.push(date)
      
      var path = '/repos/'+owner+'/'+name+'/languages'
      console.log('adding', path)
      reqs.push(githubReq(path))
    }
    
    var datesFinal = _.uniq(dates).sort()
    
    // { lang: bytes }
    return Q.all(reqs).then(function(languages) {
      // dates: [1993, 1994, 1994, 1990, ...]
      // series: { name: lang, data: [1,2,3]}
      var series = {}
      languages.forEach(function(val, i) {
        for(var lang in val) {
          if(!series[lang]) {
            series[lang] = {
              name: lang,
              data: []
            }
          }
          
          var date = dates[i]
          if(!series[lang].data[datesFinal.indexOf(date)]){
            series[lang].data[datesFinal.indexOf(date)] = val[lang]
          } else {
            series[lang].data[datesFinal.indexOf(date)] += val[lang]
          }
        }
      
      })
      
      var result = []
      for(var i in series) {
        result.push(series[i])
      }
      
      console.log('all requests finished')
      res.json({
        dates: datesFinal,
        series: result
      })
    })
  }).fail(function(err) {
    console.error(err)
  })
  
  
})

function githubReq(path) {
  return requestP({
    url: 'https://api.github.com'+path+'?access_token='+GITHUB_KEY,
    headers: {
      'user-agent': 'Zolmeister'
    },
    json: true
  })
}

function requestP(options) {
  var def = Q.defer()
  request(options, function (err, res, body) {
    if (err) return def.reject(err)
    def.resolve(body)
  })
  return def.promise
}

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});