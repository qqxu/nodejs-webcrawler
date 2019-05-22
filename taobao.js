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
	util.accessPage('https://detail.1688.com/offer/572228489174.html?spm=a2615.7691456.autotrace-offerGeneral.13.11152b61mdZ47x', handleSuccess);
})

const getPageInfo = (res) => {
	// 抓取页面信息
	const cheerio = require('cheerio');
	let hostNews = [];
	// 使用cheerio模块的load()方法，将htmldocument作为参数传入函数，就可以使用类似Jquery的$(selector)的方式获取页面元素
	let $ = cheerio.load(res.text);

	$('table.table-sku tbody tr').each((idx, ele) => {
		const image = $(ele).find('td.name span.image div.box-img img');
		const price = $(ele).find('td.price span em.value');
		let news = {
			alt: $(image).attr('alt'),
			img: $(image).attr('data-lazy-src'),
			price: $(price).text(),
		};
		hostNews.push(news);
	})
	return hostNews;
}


