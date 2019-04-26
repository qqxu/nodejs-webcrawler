const accessPage = (url, callback) => {
	// 访问页面
	const superagent = require('superagent');

	superagent.get(url).retry(3).end((err, res) => {
		if(err) {
			console.log(`访问页面失败${err}`);
		} else {
			callback && callback(res);
		}
	})

}

const formatData = (arr) => {
  	if(arr.length === 0) {
  		return [];
  	} 
	let sheetData = [];
	let fields = [];
	Object.keys(arr[0]).forEach(field => {
		fields.push(field);
	})
	arr.forEach(itm => {
		let ele = [];
		fields.forEach(field => {
			ele.push(itm[field]);
		})
		sheetData.push(ele);
	})
	sheetData.unshift(fields);
	return sheetData;
}

const saveToExcel = (ws_data, fileName) => {
	const XLSX = require('xlsx');
	// 保存到excel
	const ws = XLSX.utils.aoa_to_sheet(ws_data);  // sheet data
	let wb = XLSX.utils.book_new();  // 空workbook
	XLSX.utils.book_append_sheet(wb, ws, 'sheet1');  // 将sheet写入workbook
	XLSX.writeFile(wb, fileName);
}

// 声明多个module
module.exports = {
	accessPage,
	formatData,
	saveToExcel,
}