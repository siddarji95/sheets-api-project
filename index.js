const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const puppeteer = require('puppeteer');
const moment = require('moment')

const email = 'siddharthc@mitrmedia.com';
const password = 'siddarji';
const name = 'Siddharth C';
const project = 'CA';
const range = 'Data_2020!B2051:R2055';
let data = null;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listData);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1ztlHqy_6jXjzRH3RDNvOPy0QBzQFXmaNjGLf3OWrpCc',
    range: range,
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      console.log(rows);
      data = rows;

      // Print columns A and E, which correspond to indices 0 and 4.
      // rows.map((row) => {
      //   console.log(row[0],row[1]);
      // });
    } else {
      console.log('No data found.');
    }
  });
}

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
            if(currentData[4]!=='Yes' || currentData[2]!==name || currentData[5]!==project){
                console.log(`Skip for ${currentData[0]}`)
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