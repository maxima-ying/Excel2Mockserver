//const jsonfile = require('jsonfile');
const fs = require('fs');
const Excel = require('exceljs');

const HTTP_REQUEST = 'httpRequest';
const HTTP_RESPONSE = 'httpResponse';
const JSON_OUTPUT_FOLDER = './jsonOutput';
const path = require('path');
const JSON_FILE_SUFFIX = '.json'; //固定的后缀名

(async () => {

	//excelInput
	const filename = 'excelInput/mockServerRequestList.xlsx';
    
    // const lineNames = ['','caseName','comment'];
    
    // const line4StepsName = 'steps';
    // const line4StepColumnsName = ["", "no","operation","target","parameter","screenshot","memo"];
    
	// read from a file
	var workbook = new Excel.Workbook();
	workbook.xlsx.readFile(filename)
	  .then(function() {
	    // use workbook
	    
	    workbook.eachSheet(function(worksheet, sheetId) {
		  // ...
		  //console.log('worksheet',worksheet);
		});
	    
	    // fetch sheet by name
		var worksheet = workbook.getWorksheet('list'); //这次我只读list sheet，其他都无视
		// console.log('worksheet id  :',worksheet.id);
		// console.log('worksheet name:',worksheet.name);

		// console.log('[info]rows count： ', worksheet._rows.length);

		console.log('--------------------------------');

		var rowNumber =  0;
		var httpRequestStartPos = 0;
		var httpRequestEndPos = 0;
		var httpResponseStartPos = 0;
		var httpResponseEndPos = 0;

		var keys = new Array();

		var results = new Array();

		for (let row of worksheet._rows) {
			//var row = worksheet.getRow(0);
			//console.log('worksheet Case1 row ： ', row);

			if (row != undefined) {
				rowNumber++;
				// console.log('[info]row no： ', row._number);
				// console.log('[info]cells count： ', row._cells.length);
				// console.log('--------------------------------');
				// for(let cell of row._cells){
                //     console.log('cell value:', cell.value);
				// 	console.log('cell value:', '|', trim(cell.value), '|');
				// 	let address = cell._address;
				// 	console.log('cell address:', address);
					
				// 	console.log('cell column no:', cell._column._number,'  --- value:', cell.value);
				// }
			} else {
				// console.log('[info]row ： ', row);
			}

			var result = new Object();
			result[HTTP_REQUEST] = new Object;
			result[HTTP_RESPONSE] = new Object;

			// console.log('~~~~~~~~~~~rowNumber : ', rowNumber);
			switch(rowNumber)
			{
				// 跳过头两行，不要问我为啥头上有两个空行
				case 0:
					break;
				// 标题行， 只有 "httpRequest" 和 "httpResponse"两种
				// 记住开始位置和结束位置
				case 1:
					for(let cell of row._cells){
						
						if (cell.value == HTTP_REQUEST){
							httpRequestEndPos = cell._column._number;
							if (httpRequestStartPos == 0){
								httpRequestStartPos = cell._column._number;
							}
						}
						if (cell.value == HTTP_RESPONSE){
							httpResponseEndPos = cell._column._number;
							if (httpResponseStartPos == 0){
								httpResponseStartPos = cell._column._number;
							}
						}
					}
					break;
				// 第二行，从第二列开始，记住那些key的名字。第一列固定为No,输出文件名用的
				case 2:
					for(let cell of row._cells){
						if (cell._column._number>1){
							keys.push(cell.value);
						}
					}
					break;
				// 数据行，每行决定一个文件名，输出一个JSON文件
				default:
                    let contentCount = 0;
                    var mockFileName = "";
					for(let cell of row._cells){
						let colNumber = cell._column._number;
						if ( colNumber > 1){
							if (cell.value != null && cell.value != ""){
								// 为什么要减2呢， base0 -1， 第一列是casename -1
								let key = keys[colNumber - 2]; 
								//let value = cell.value;
								let value = parseJSONWhenJSON(cell.value);
								if (colNumber >= httpRequestStartPos && colNumber <= httpRequestEndPos){
									result[HTTP_REQUEST][key] = value;
								} else if(colNumber >= httpResponseStartPos && colNumber <= httpResponseEndPos) {
									result[HTTP_RESPONSE][key] = value;
								}

								contentCount++;
							}
							// TODO: 还要分一下 "httpRequest" 和 "httpResponse"
						} else {
                            mockFileName = cell.value;
						}
                    }
                    // 当本行除了文件名以外，有非空的内容，才写。否则认为是空行，不处理
					if (contentCount > 0){
                        results.push(result);
                        writeJsonFile(JSON_OUTPUT_FOLDER, mockFileName, result);
					}

					break;

			}
			
			//


			// console.log('[info]row no： ', row._number);
			// console.log('[info]cells count： ', row._cells.length);
			// console.log('--------------------------------');
			// for( cell of row._cells){
			// 	console.log('cell value:', cell.value);
			// 	let address = cell._address;
			// 	console.log('cell address:', address);
				
			// 	console.log('cell column no:', cell._column._number,'  --- value:', cell.value);
			// }
		}

		// console.log('httpRequestStartPos :', httpRequestStartPos);
		// console.log('httpRequestEndPos :', httpRequestEndPos);
		// console.log('httpResponseStartPos :', httpResponseStartPos);
		// console.log('httpResponseEndPos :', httpResponseEndPos);
		// console.log('------------------------');
		// console.log('keys :', keys);
		// console.log('------------------------');
		// console.log('results :', results);

		return;
	
	  });

})();


function makeNewObj(key, value){
	var obj=new Object();
	obj[key] = value;
	return obj;
}

String.prototype.trim=function(){
	　　return this.replace(/(^\s*)|(\s*$)/g, "");
}

function trim(str){

	// if (str == null){
	// 	return null;
	// }
	// console.log('str : ', str);
	// console.log('typeof str :', typeof str);

	if (typeof str == 'string'){
		console.log('+++++++yes, its string+++++++');
		return str.replace(/(^\s*)|(\s*$)/g, "");
	}
	return str;
	
	
}


function writeJsonFile(targetFolderPath, filename, jsonObj){
    // console.log('targetFolderPath : ',targetFolderPath);
    // console.log('filename : ',filename);
    // console.log('jsonObj : ',jsonObj);

    let str = JSON.stringify(jsonObj,"","\t");

    filePath = path.join(targetFolderPath,filename + JSON_FILE_SUFFIX);
  
    console.info(`[info]准备写入一个文件 : `, filePath);

    fs.writeFile(filePath,str,function(err){
      if (err) {
        //res.status(500).send('Server is error...');
		console.error(`[错误]文件写失败 : `, err.path);
      } else {
        console.info(`[info]成功写入文件`);
      }
    });

}

/**
 * 如果是合法的JSON，返回JSON解析后的对象
 * 如果不是，输入的字符串原样返回
 * 
 * @param {String} str 输入的字符串
 */
function parseJSONWhenJSON(str){
    try {
        jsonObject = JSON.parse(str);
        // JSON解析成功的时候，返回解析后的JSON对象
        return jsonObject;
    } catch (e) {
        if (e instanceof SyntaxError){
            //考虑到使用的场合大部分是，输入普通的字符串，偶尔会有JSON的解析一下，所以暂时不显示错误
            //console.error(e.stack); 
        }
    }

    // 不是json格式的时候，返回原文
    return str;
}