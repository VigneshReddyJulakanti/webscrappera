const e = require("express");
const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

router.post("/", async (req, res) => {
  const { url } = req.body;

  try {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);


    const elementLinks = await page.$$eval('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style', elements => elements.map(element => element.href));

    let finalData=[]


    let links=new Set();
    for(let i =0;i<100;i=i+3){

      try{
        if (elementLinks[i].match(/customerReviews/) || links.has(elementLinks[i]) || !elementLinks[i].match("keywords")){
          continue;
        }

        links.add(elementLinks[i]);

        const inpage=await browser.newPage();
        
        await inpage.goto(elementLinks[i])
        const Title=await inpage.$eval("#productTitle",element=>element.textContent)
        const CurrentPrice=await inpage.$eval(".a-price-whole",element=>element.textContent)
        const MRP=await inpage.$eval('.a-price.a-text-price .a-offscreen', span => span.textContent);
        const Rating=await inpage.$eval('.a-size-base.a-color-base', span => span.textContent);



        const tdli=await inpage.$$eval('.a-list-item', spans => {
          return spans.map(span => {
            const innerSpans = Array.from(span.querySelectorAll('span'));
            const ms=innerSpans[0]?.textContent;
          
            const detailsSpan = innerSpans[1];
            return detailsSpan ? [detailsSpan.textContent.trim(),innerSpans[0].textContent] : "";
          });
        });


        let Manufacturer="";
        let ASIN ="";
        let DateFirstAvailable ="";
        for (let i of tdli){
          if (i==""){
            continue;
          }
          if(i[1].match("ASIN")){
            ASIN=i[0];
           
          }
          if(i[1].match("Date First Available")){
            DateFirstAvailable=i[0];
           
          }
          if(i[1].match("Manufacturer")){
            Manufacturer=i[0];
          }

         
        }

       

        finalData.push({"Pagelink":elementLinks[i],"Title":Title.trim(),CurrentPrice,"MRP":MRP.slice(1,MRP.length),"Rating":Rating.trim(),Manufacturer,ASIN,DateFirstAvailable})
        if (finalData.length==5){
          break;
        }
    }catch(error){
      console.log(error)
    }

  }

    
 
    await browser.close();

    res.json(finalData)
  } catch (error) {
    console.log(error);
    res.status(500).json("Some internal error");
  }
});

module.exports = router;
