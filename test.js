const puppeteer = require('puppeteer');
const moment = require('moment')

const email = 'siddharthc@mitrmedia.com';
const password = 'siddarji';
const data = [['3/2/2020',
    'Monday',
    'Siddharth C',
    'HOPPS (Vocab)',
    'Yes',
    'CA',
    '',
    'DIA-2619',
    '',
    '',
    '5',
    '10%',
    'Development',
    'In Progress',
    '8',
    '',
    '43892-Monday-Siddharth C-HOPPS (Vocab)-Yes-CA--DIA-2619-Development-In Progress-8-'],
['3/3/2020',
    'Tuesday',
    'Siddharth C',
    'HOPPS (Vocab)',
    'Yes',
    'CA',
    '',
    'DIA-2619',
    '',
    '',
    '5',
    '90%',
    'Development',
    'Completed',
    '8',
    '',
    '43893-Tuesday-Siddharth C-HOPPS (Vocab)-Yes-CA--DIA-2619-Development-Completed-8-']];

    // data.map((value) => {
    //     return value.filter((val) => {
    //         return val !== ''
    //     })
    // })


    (async () => {
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        try {
            await page.setViewport({ width: 1280, height: 800 })
            await page.goto('http://172.19.10.10:8181/mis/index.php/login')
            await page.type('#inputEmail', email)
            await page.type('#inputPassword', password)
            await page.click('button[type=submit]')
            await page.waitForSelector('body > div > nav > ul > li:nth-child(6) > a')
            await page.goto('http://172.19.10.10:8181/mis/index.php/timesheet')
            for (let i = 0; i < data.length; i++) {
                const currentData = data[i];
                if(currentData[4]!=='Yes'){
                    continue;
                }
                // console.log(currentData)
                await page.waitForSelector('body > div > nav > ul > li:nth-child(6) > a')
                const dateFormat = moment(currentData[0]).format('YYYY-MM-DD');
                await page.evaluate((dateFormat) => {
                    document.querySelector('#common_date').value = dateFormat;
                    const date = document.querySelector('#datepicker_0');
                    date.value = dateFormat;
                },dateFormat);
                await page.type('.task_name', 'Development')
                await page.type('.task_description', currentData[16])
                await page.select('.users_result', '275')   //Project manager
                await page.select('.project_id', '251')   //Project CA
                await page.select('.task_cat', '2')   //Task programming
                await page.evaluate(() => {
                    const hours = document.querySelector('.hours');
                    hours.value = '';
                });
                await page.type('.hours', currentData[14])
                await page.click('.submit_button')
                await page.waitFor(1000)
                await page.waitForSelector('button.close')
                await page.click('button.close')
                console.log(`Data filled for ${currentData[0]}`)
            }

            await browser.close()
        } catch (e) {
            console.log('************************************************************');
            console.log(e);
            console.log('************************************************************');
            // await browser.close();
        }
    })();