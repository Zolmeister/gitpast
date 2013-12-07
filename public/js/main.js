$(function () {

  loadUser('Zolmeister', function (data) {
    chart('user1', data)
  })
  loadUser('gsilk', function (data) {
    chart('user2', data)
  })

  $('#user1Form').submit(function (e) {
    e.preventDefault()
    var name = $(this).find('input[name=name]').val()
    loadUser(name, function (data) {
      chart('user1', data)
    })
  })
  
  $('#user2Form').submit(function (e) {
    e.preventDefault()
    var name = $(this).find('input[name=name]').val()
    loadUser(name, function (data) {
      chart('user2', data)
    })
  })
})

function loadUser(name, cb) {
  $.getJSON('/users/' + name, function (data) {
    console.log(data)
    cb(data)
  })
}

function chart(id, data) {
  $('#' + id).highcharts({
    chart: {
      type: 'column'
    },
    title: {
      text: 'Stacked column chart'
    },
    xAxis: {
      categories: data.dates
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total fruit consumption'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    legend: {
      align: 'right',
      x: -70,
      verticalAlign: 'top',
      y: 20,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    tooltip: {
      formatter: function () {
        return '<b>' + this.x + '</b><br/>' +
          this.series.name + ': ' + this.y + '<br/>' +
          'Total: ' + this.point.stackTotal + ' TEST';
      }
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
        }
      }
    },
    series: data.series
  });
}