
var inputCodeEle = document.getElementById('inputCode'),
    outputDataEle = document.getElementById('outputData'),
    buildEle = document.getElementById('build')


    buildEle.addEventListener('click', function(e) {
        outputData.value = buildDataTpl(inputCodeEle.value)
    }, false)