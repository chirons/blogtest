// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('chart'));

myChart.showLoading({text : "图表正在加载中。。。。请稍后。。。。。"});
$.post('/report').done(function(data) {
    console.log("回调函数中的结果是： " + data);

    myChart.hideLoading();
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption({
        tooltip: {
            trigger: 'axis',
            left: 'center'
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data:['发言数']
        },
        xAxis: [
            {
                type: 'category',
                data: data.name
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '数量',
                min: 0,
                max: 20,
                interval: 2,
                axisLabel: {
                    formatter: '{value} ml'
                }
            }
        ],
        series: [
            {
                name:'发言数',
                type:'bar',
                data: data.num
            }
        ]
    });
});