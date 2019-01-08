
const request = require('request');

/**
 * PAGES的各項query參數，是去參考主網networking發出的request，擷取下來的
 * 
 * 條件大致上為：
 * keyword: react
 * 地區: 雙北
 * 產業別: 資訊產業
 * 經歷: 3-5年
 * 有寫薪資
 * ps: page參數為分頁，大概自己抓一下有幾頁就好
 * 
 * 執行步驟：
 * 1. 請先安裝nodejs
 * 2. npm install
 * 3. node index.js
 * 
 * 此為相對應104主網頁面
 * https://www.104.com.tw/jobs/search/?ro=0&kwop=7&keyword=react&area=6001001000%2C6001002000&indcat=1001000000&order=15&asc=0&sr=99&page=1&jobexp=5&mode=s&jobsource=2018indexpoc
 */
const PAGES = [
    'https://www.104.com.tw/jobs/search/list?ro=0&kwop=7&keyword=react&area=6001002000%2C6001001000&indcat=1001000000&order=15&asc=0&sr=99&page=1&jobexp=5&mode=s&jobsource=2018indexpoc',
    'https://www.104.com.tw/jobs/search/list?ro=0&kwop=7&keyword=react&area=6001002000%2C6001001000&indcat=1001000000&order=15&asc=0&sr=99&page=2&jobexp=5&mode=s&jobsource=2018indexpoc',
    'https://www.104.com.tw/jobs/search/list?ro=0&kwop=7&keyword=react&area=6001002000%2C6001001000&indcat=1001000000&order=15&asc=0&sr=99&page=3&jobexp=5&mode=s&jobsource=2018indexpoc',
    'https://www.104.com.tw/jobs/search/list?ro=0&kwop=7&keyword=react&area=6001002000%2C6001001000&indcat=1001000000&order=15&asc=0&sr=99&page=4&jobexp=5&mode=s&jobsource=2018indexpoc',
    'https://www.104.com.tw/jobs/search/list?ro=0&kwop=7&keyword=react&area=6001002000%2C6001001000&indcat=1001000000&order=15&asc=0&sr=99&page=5&jobexp=5&mode=s&jobsource=2018indexpoc'
];
const FILTER_LOW = 45000;
const FILTER_HIGH = 200000;
const FILTER_KEYWORD = ['時薪', '年薪', 'native'];

const extractColumn = (data) => {
    const low = Number(data.salaryLow);
    const high = Number(data.salaryHigh);
    const isFilterByLowSalaryTooLow = FILTER_LOW > low ;
    const isFilterByLowSalaryTooHigh = FILTER_HIGH < high ;
    const isFilterSalaryDesc = FILTER_KEYWORD.findIndex((filter) => data.salaryDesc.indexOf(filter) > -1) > -1;
    const isFilterJobName = FILTER_KEYWORD.findIndex((filter) => data.jobNameRaw.toLowerCase().indexOf(filter) > -1) > -1;
    if (isFilterByLowSalaryTooLow || isFilterByLowSalaryTooHigh || isFilterSalaryDesc || isFilterJobName) {
        return null;
    }

    return {
        jobNameRaw: data.jobNameRaw,
        custNameRaw: data.custNameRaw,
        salaryLow: low,
        salaryHigh: high,
        salaryDesc: data.salaryDesc
    };
}

const fetch = (url) => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, html) => {
            if (error) {
                reject(error)
            }
            const obj = JSON.parse(html);
            const { list } = obj.data;
            resolve(list)
        });
    });
}

const average = (extractDatas) => {
    let lowSalarySum = 0; 
    let highSalarySum = 0; 
    const length = extractDatas.length;
    extractDatas.forEach((data) => {
        const { salaryLow, salaryHigh } = data
        lowSalarySum += salaryLow;
        highSalarySum += salaryHigh;
    });
    return [ 
        Math.floor(lowSalarySum / length),
        Math.floor(highSalarySum / length)
     ];
}

const allPagePromise = PAGES.map((page) => fetch(page))

Promise.all(allPagePromise).then((resp) => {
    let extractDatas = [];

    resp.forEach((datsList) => {
        datsList.forEach((data) => {
            const extractedData = extractColumn(data)
            if(extractedData) {
                extractDatas.push(extractedData)
            }
        });
    })

    const aver = average(extractDatas);
    console.log(extractDatas);
    console.log();
    console.log('關鍵字：react ,位址：台北市 新北市, 及有寫薪資, 3-5年經歷, 軟體及網路相關業');
    console.log(`filter salary lower then ${FILTER_LOW}`);
    console.log(`filter salary higher then ${FILTER_HIGH}`);
    console.log(`filter keyword: ${FILTER_KEYWORD}`);
    console.log(`count ${extractDatas.length}`);
    console.log(`low salary of average:  ${aver[0]}`);
    console.log(`high salary of average: ${aver[1]}`);
    console.log(`average salary:         ${(aver[0]+aver[1])/2}`);
}).catch((e) => {
    console.log(e);
});
  