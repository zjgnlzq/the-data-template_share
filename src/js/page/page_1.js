
var count = 0

sendRequestEle.addEventListener('click', function(e) {
    $.ajax({
        "url": "/data/test.json",
        "data": {
            "param1": "p1",
            "page": 1 + count++
        },
        "method": "GET",
        "dataType": "json"
    }).done(function(data) {
        // outputDataEle.innerHTML = data
        outputDataEle.innerHTML = JSON.stringify(data, null, '  ')
    }).error(function(e) {
    	console.log(e)
    })

}, false)


// jsonnet
/*mockData({
	url: '/data/test.json',
	method: 'get',
	dataTplType: 'jsonnet',
	dataTpl: {
		cocktails: {
        // Ingredient quantities are in fluid ounces.
        "Tom Collins": {
        	ingredients: [
        	{ kind: "Farmers Gin", qty: 1.5 },
        	{ kind: "Lemon", qty: 1 },
        	{ kind: "Simple Syrup", qty: 0.5 },
        	{ kind: "Soda", qty: 2 },
        	{ kind: "Angostura", qty: "dash" },
        	],
        	garnish: "Maraschino Cherry",
        	served: "Tall",
        },
        Manhattan: {
        	ingredients: [
        	{ kind: "Rye", qty: 2.5 },
        	{ kind: "Sweet Red Vermouth", qty: 1 },
        	{ kind: "Angostura", qty: "dash" },
        	],
        	garnish: "Maraschino Cherry",
        	served: "Straight Up",
        },
    }
	}    	
})*/


// 正常的JavaScript字面量对象
/*
1. key的双引号不是必须的
2. 对象和数组最后一个属性后面可以有逗号
3. 支持单行或多行注释
5. 操作数据，支持常用的算术与逻辑运算符
*/
/*var testVar = "变量"
mockData({
	url: "/data/test.json",
	// method: "get",
	dataTpl: {
		// 注释
		name: 'testName',
		arr: [1, '2', 3 + 1,],
		a: 1,
		b: 1 + 1,
		c: function() {
			return 'test'
		}(),
		d: testVar
	}
})
*/

// 数据模版是function, 根据请求参数响应动态模拟数据

mockData({
	url: "/data/test.json",
	method: "get",
	dataTplType: 'function',
	dataTpl: function(options) {
		var result = {
			status: 'success',
			code: 1,
			data: {
				pageNo: options.params.page,
				totalPage: 10,
				content: "这是，第" + options.params.page + "页"
			}
		}
		return  result
	}
})



