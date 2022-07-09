const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
// function to get the raw data
const getRawData = (URL) => {
   return fetch(URL)
      .then((response) => response.text())
      .then((data) => {
         return data;
      });
};
// URL for data
const URL = "https://rust-lang.github.io/rust-clippy/master/";
// start of the program
const scrapeData = async () => {
   const rawData = await getRawData(URL);
   // parsing the data
   const $ = cheerio.load(rawData);
   //console.log(parsedData.root().html());
   const t = $(".panel-title-name");
   console.log(t);
   const htmls = ($.html())(".ng-binding");
   //console.log(htmls);
   //const dub = htmls(".ng-binding")
   //const h = htmls.attr('href');
   //console.log(h);
   //console.log(dub);
   const parsedSampleData = cheerio.load(
    `<span class="ng-binding">`,{
        xml: {
            normalizeWhitespace: true,
          },
    },
   );
   console.log(parsedSampleData.html());
   // write code to extract the data
   // here
   // ...
   // ...
};
// invoking the main function
scrapeData();

const URL1 = "https://en.wikipedia.org/wiki/Cricket_World_Cup";

// start of the program
const getCricketWorldCupsList = async () => {
   const cricketWorldCupRawData = await getRawData(URL1);
   console.log(cricketWorldCupRawData);
};

//getCricketWorldCupsList();

/*const axios = require("axios");
const cheerio = require("cheerio");

axios
  .get("https://blog.logrocket.com/")
  .then((response) => {
    const $ = cheerio.load(response.data);
    const span = $(".panel-title-name").html();
    console.log(span);

  }
)*/