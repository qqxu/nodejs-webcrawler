const express = require('express');
const app = express();
const util = require('./util.js');

let server = app.listen(3000, function() {
	let { adress, port } = server.address();
	console.log(`App is running at http://${adress}:${port}`); 
})

app.get('/', async (req, res, next) => {
	const handleSuccess = (resdom) => {
		let hostNews = getPageInfo(resdom);
		if (hostNews && hostNews.length > 0 ){
			util.saveToExcel(util.formatData(hostNews), 'out.xlsx');
		}
		res.send(hostNews);  // 输出到浏览器中
	}
	util.accessPage('http://news.baidu.com/', handleSuccess);

})

const getPageInfo = (res) => {
	// 抓取页面信息
	const cheerio = require('cheerio');
	let hostNews = [];
	// 使用cheerio模块的load()方法，将htmldocument作为参数传入函数，就可以使用类似Jquery的$(selector)的方式获取页面元素
	let $ = cheerio.load(res.text);

	$('div#pane-news ul li a').each((idx, ele) => {
		let news = {
			title: $(ele).text(),
			href: $(ele).attr('href'), 
		};
		hostNews.push(news);
	})
	
	return hostNews;
}


