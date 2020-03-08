var fs = require('fs');
var path = require('path');

var mockServerClient = require('mockserver-client').mockServerClient;

//const JSON_INPUT_PATH = './jsonInputSample';
const JSON_INPUT_PATH = './jsonOutput';

function displayFile(param) {
    //转换为绝对路径
    var param = path.resolve(param);
    fs.stat(param, function (err, stats) {

        console.log('--------------------------------------------------------------------------------------------------------');
        //console.log(stats);
        if (stats == undefined) {
            console.log('该路径不存在 :  ', param);
            return;
        }

        //如果是目录的话，遍历目录下的文件信息
        if (stats.isDirectory()) {
            fs.readdir(param, function (err, file) {
                file.forEach((e) => {
                    //遍历之后递归调用查看文件函数
                    //遍历目录得到的文件名称是不含路径的，需要将前面的绝对路径拼接
                    var absolutePath = path.resolve(path.join(param, e));
                    // 递归，去下一层目录
                    // displayFile(absolutePath);

                    // 这里咱不去下一层目录，把这层目录的文件路径列出来就好
                    console.log('找到一个文件 ： ', absolutePath);
                    mockAResponse(absolutePath);
                })
            })
        } else {
        //如果不是目录，打印文件信息
        //console.log(param)
        }
    })
}

async function main() {
    //displayFile('./create_payment.html');
    displayFile(JSON_INPUT_PATH);
    
}

function readJsonFile(filepath) {
  const filecontent = fs.readFileSync(filepath, 'utf-8');
  const jsondata = JSON.parse(filecontent);
  console.debug('◇◇◇◇◇◇readJsonFile:', jsondata);
  return jsondata;
}

function mockAResponse(inputfilePath){

    var result = null;

    try{
        result = readJsonFile(inputfilePath);
    } catch (e) {
        console.error(`文件的JSON解析错误 ：`, e);
        console.error(`所以本文件跳过 ： ${inputfilePath}`);
        return;
    }

    mockServerClient("localhost", 1080).mockAnyResponse(result).then(
        function () {
            console.log(`expectation ${inputfilePath} created`);
        },
        function (error) {
            console.log(error);
        }
    );

}


main();

