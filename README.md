### 初始化

合适目录下，新建文件夹nodejs-webcrawler
打开命令行终端，进入当前目录执行`npm init`，初始化`package.json`文件

### 安装依赖
`express`用来搭建简单的服务器，`superagent`用来请求页面,`cheerio`形如jquery处理页面元素
```
npm install express -S
npm install superagent -S
npm install cheerio -S

```


### 使用express启动服务器
在nodejs-webcrawler目录下新建`index.js`文件
`index.js`
```
const express = require('express');
const app = express();

let server = app.listen(3000, function() {
    let { adress, port } = server.address();
    console.log(`App is running at http://${adress}:${port}`); 
})

app.get('/', async (req, res, next) => {
    res.send('hello World!'); // 输出到浏览器
})

```
保存！

打开命令行终端，进入当前目录，
`node index.js`

![成功启动服务器](https://upload-images.jianshu.io/upload_images/6517590-92514c63d1d2c6a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

浏览器打开`http://localhost:3000/`
![成功输出到浏览器](https://upload-images.jianshu.io/upload_images/6517590-8c85b95c80906dcd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 访问页面数据
爬取[百度新闻页面](http://news.baidu.com/)(http://news.baidu.com/)

```
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

```

### 抓取数据
```
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

```



### 保存数据到EXCEl


1. 保存数据到excel
```
const saveToExcel = (ws_data, fileName) => {
    const XLSX = require('xlsx');
    // 保存到excel
    const ws = XLSX.utils.aoa_to_sheet(ws_data);  // sheet data
    let wb = XLSX.utils.book_new();  // 空workbook
    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');  // 将sheet写入workbook
    XLSX.writeFile(wb, fileName);
}
```

2. 保存到excel的数据需要特定的格式，接下来格式化数据

```
// 原始json数据
const origin_data = [
{
   'name' :  'xqq',
   'age':  '20',
},
{
   'name' :  'ht',
   'age':  '21',
},
];
// 保存到excele需要的数据
const ws_data = [
['name','age'],
['xqq', '20'],
['ht', '22'],
];

// 数据格式化的转换函数
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
    sheetData.unshift(fields);   // 表头放在数组第一位
    return sheetData;
}

```



###  声明多个`module`
将可公用函数放到统一的地方，声明多个`module`
`util.js`
```
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
module.exports = {
    accessPage,
    formatData,
    saveToExcel,
}
```

主文件`index.js`
```
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

```

### 上传到github
1. 本地文件commit
当前目录下
```
npm init
git add .
```  
当输入`git add .`，意识到把node_mdules也上传到暂存区了，需要撤销

先检查下当前哪些文件已到暂存区
```
git status
```
![暂存区文件](https://upload-images.jianshu.io/upload_images/6517590-f4d008bbb23e98fd.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
node_modules文件夹下，的确在！！
输入
```
git reset HEAD --  node_modules
git reset HEAD -- .DS_Store
```

为了防止不需要的文件上传至github，添加`.gitignore`文件
![.gitignore文件](https://upload-images.jianshu.io/upload_images/6517590-9f2def2d3696183e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

将`.gitignore`文件一并上传
```
git add .
git commit -m 'paichong save to excel'
```

2. `github`创建同名`repository`
![github创建repository](https://upload-images.jianshu.io/upload_images/6517590-284742407d638541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. `push`到`github`上
终端命令行输入
```
git remote add origin https://github.com/your_github_address/nodejs-webcrawler.git
git push origin  master

```


### 从github下载下来，运行
```
npm install
node index.js
```
打开`http://localhost:3000/`查看输出
查看out.xlsx
![out.xlsx](https://upload-images.jianshu.io/upload_images/6517590-d5894caa07a2adaf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[github源码地址](https://github.com/qqxu/nodejs-webcrawler)

喜欢就star吧

参考网址
[nodejs写爬虫](https://juejin.im/post/5b4f007fe51d4519277b9707)
[保存数据到excel](https://github.com/SheetJS/js-xlsx/issues/1245)
[export 多个module](https://cloud.tencent.com/developer/ask/40981)
[git撤销](https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/0013752340242354807e192f02a44359908df8a5643103a000)