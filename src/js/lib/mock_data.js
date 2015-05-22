function buildDataTpl(code) {
    var jsonnet_make = Module.cwrap('jsonnet_make', 'number', [])
    var jsonnet_realloc = Module.cwrap('jsonnet_realloc', 'number', ['number', 'number', 'number'])
    var jsonnet_evaluate_snippet = Module.cwrap('jsonnet_evaluate_snippet', 'number', ['number', 'string', 'string', 'number'])
    var jsonnet_destroy = Module.cwrap('jsonnet_destroy', 'number', ['number'])

    var vm = jsonnet_make();
    var error_ptr = Module._malloc(4);
    var output_ptr = jsonnet_evaluate_snippet(vm, "snippet", code, error_ptr);
    var error = Module.getValue(error_ptr, 'i32*');
    Module._free(error_ptr);
    var result = Module.Pointer_stringify(output_ptr);
    jsonnet_realloc(vm, output_ptr, 0);
    jsonnet_destroy(vm);
    return result;
}

function mockData(atrributes) {
    if (atrributes && atrributes.url && atrributes.dataTpl) {
        mockData._mocked[atrributes.url + atrributes.method] = {
            rUrl: atrributes.url,
            rMethod: atrributes.method || '',
            dataTplType: atrributes.dataTplType,
            dataTpl: atrributes.dataTpl
        }
    }
}

mockData._mocked = {}

var Util = {
    type: function (obj) {
        return obj === null || obj === undefined ? String(obj) : Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase();
    },
    parseToJson: function(paramStr) {
        var result = {},
            paramArr = paramStr.split('&'),
            tempArr
        for(var index in paramArr) {
            tempArr = paramArr[index].split('=')
            result[tempArr[0]] = tempArr[1]
        }

        return result
    }
}


function find(options) {
    for (var rUrlMethod in mockData._mocked) {
        var item = mockData._mocked[rUrlMethod]
        if ((!item.rUrl || match(item.rUrl, options.url.split('?')[0])) && (!item.rMethod || match(item.rMethod.toLowerCase(), options.type.toLowerCase()))) {
            return item
        }
    }

    function match(expected, actual) {
        if (Util.type(expected) === "string") {
            return expected === actual;
        }
        if (Util.type(expected) === "regexp") {
            return expected.test(actual);
        }
    }
}

function convert(item, options) {
    var result
    switch(item.dataTplType) {
        case 'jsonnet':
            result = buildDataTpl(JSON.stringify(item.dataTpl))
            break
        case 'function':
            result = item.dataTpl(options)
            break
        default:
            result = item.dataTpl
    }   
        return result
}

function mockxhr() {
    return {
        readyState: 4,
        status: 200,
        statusText: '',
        open: jQuery.noop,
        send: function() {
            if (this.onload) this.onload()
        },
        setRequestHeader: jQuery.noop,
        getAllResponseHeaders: jQuery.noop,
        getResponseHeader: jQuery.noop,
        statusCode: jQuery.noop,
        abort: jQuery.noop
    }
}

function prefilter(options, originalOptions, jqXHR) {
    var item = find(options),
        data = options.data || {}
    if (item) {        
        options.dataFilter =
        options.converters['text json'] =
        options.converters['text jsonp'] =
        options.converters['text script'] =
        options.converters['script json'] = function() {
            options.params = Util.parseToJson(data)           
            return convert(item, options)
        }

        options.xhr = mockxhr

        if (originalOptions.dataType !== 'script') return 'json'
    }

}



// 拦截ajax
if (typeof jQuery != 'undefined') {
    jQuery.ajaxPrefilter('json jsonp script', prefilter)
}
