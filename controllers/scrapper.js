const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const fs = require('fs');

function generateHTML(data) {
  let html = `
    <html>
      <head>
        <style>
          .image-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
          }

          .image-container img {
            margin: 5px;
          }
          a{
            text-decoration: none;
            color: black;
          }
        </style>
      </head>
      <body>
        <div class="image-container">`;

  data.forEach(property => {
    const { link, imageURL, price, sellingRent, documents, city, regionPlace, floor, room, source } = property;
    html += `
      <div>
        <a href="${link}" target="_blank"><img src="${imageURL}" data-src="${imageURL}"/><br>
        <span>Price: ${price}</span><br>
        <span>Selling/Rent: ${sellingRent}</span><br>
        <span>Documents: ${documents}</span><br>
        <span>City: ${city}</span><br>
        <span>Region/Place: ${regionPlace}</span><br>
        <span>Floor: ${floor}</span><br>
        <span>Room: ${room}</span><br>
        <span>Source: ${source}</span></a>
      </div>
    `;
  });

  html += `
        </div>
      </body>
    </html>`;

  return html;
}



function saveHTML(content) {
  fs.readFile('views/index.html', 'utf8', (err, data) => {
    if (err) {
      console.log(`Failed to read HTML file: ${err}`);
      return;
    }
    
    const combinedContent = content + data;
    
    fs.writeFile('views/index.html', combinedContent, (err) => {
      if (err) {
        console.log(`Failed to save HTML file: ${err}`);
      } else {
        console.log('HTML file saved successfully.');
      }
    });
  });
}

const scrapeSite = async (req, res) => {
  const websites = [
    { url: 'https://bina.az/', source: 'Bina.az' },
    { url: 'https://tap.az/elanlar/dasinmaz-emlak', source: 'Tap.az' },
    { url: 'https://arenda.az/', source: 'Arenda.az' },
    { url: 'https://yeniemlak.az/', source: 'Yeniemlak.az' }
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  };

  try {
    const results = [];

    for (const website of websites) {
      console.log(website.url)
      const response = await axios.get(website.url, { headers });

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        
        let propertyItems;

        if (website.source === 'Bina.az') {
          propertyItems = $('.items-i.vipped');
        }  else if (website.source === 'Yeniemlak.az') {
          propertyItems = $('.ads');
        }else if (website.source === 'Tap.az') {
          propertyItems = $('.products-i');
        } else if (website.source === 'Arenda.az') {
          propertyItems = $('.new_elan_box');
        }

        propertyItems.each((index, element) => {
          let link, imageURL, price, sellingRent, documents, city, regionPlace, floor, room;

          if (website.source === 'Bina.az') {
            
            const linkElement = $(element).find('.item_link');
            link = 'https://bina.az/' + linkElement.attr('href');
            const anchorTag = linkElement.prop('outerHTML'); // Get the full anchor tag HTML

            const imageElement = $(element).find('.slider_image img');
            imageURL = imageElement.attr('data-src');

            const priceElement = $(element).find('.price-val');
            price = priceElement.text().trim();

            const locationElement = $(element).find('.location');
            regionPlace = locationElement.text().trim();
            city = locationElement.text().trim();
            //const locationParts = locationText.split(',');

            //city = locationParts[0].trim();
            //regionPlace = locationParts[1].trim();

            sellingRent = 'Not Found'; // Not available on Bina.az
            documents = 'Not Found'; // Not available on Bina.az
            floor = 'Not Found'; // Not available on Bina.az
            room = 'Not Found'; // Not available on Bina.az
          } else if (website.source === 'Tap.az') {
            console.log('Im at 2');
            const linkElement = $(element).find('.products-link');
            link = 'https://tap.az' + linkElement.attr('href');
        
            const imageElement = $(element).find('.products-top img');
            imageURL = imageElement.attr('src');
        
            const priceElement = $(element).find('.products-price .price-val');
            price = priceElement.text().trim();
        
            const nameElement = $(element).find('.products-name');
            const name = nameElement.text().trim();
        
            const createdElement = $(element).find('.products-created');
            const created = createdElement.text().trim();
        
            locationParts = name.split(',').map(part => part.trim());
        
            const city = locationParts[0] || '';
            const regionPlace = locationParts[1] || '';
        
            sellingRent = 'Not Found'; // Not available on Tap.az
            documents = 'Not Found'; // Not available on Tap.az
            floor = 'Not Found'; // Not available on Tap.az
            room = 'Not Found'; // Not available on Tap.az
        
            //console.log(link, imageURL, price, city, regionPlace, name, created);
        } else if (website.source === 'Yeniemlak.az') {
           
              const linkElement = $(element).find('a[href^="/elan/"]');
              const link = 'https://yeniemlak.az' + linkElement.attr('href');
          
              const imageElement = $(element).find('img');
              imageURL = 'https://yeniemlak.az/' + imageElement.attr('src');
          
              const priceElement = $(element).find('.price');
              price = priceElement.text().trim();
          
              const locationElement = $(element).find('.bottom b').last();
              //const locationText = locationElement.text().trim();
              //const locationParts = locationText.split(',');
          
              city = 'Not Found'//locationElement
              regionPlace = 'Not Found'//locationElement
          
              room = 'Not Found'; // Not available on Yeniemlak.az
              floor = 'Not Found'; // Not available on Yeniemlak.az
              sellingRent = price; // Extract selling/rent info from adjacent element
              documents = 'Not Found'; // Not available on Yeniemlak.az
          
              //console.log(link, imageURL, price, city, regionPlace);
          }else if (website.source === 'Arenda.az') {
            
            const linkElement = $(element).find('a');
            link = linkElement.attr('href');
        
            const imageBoxElement = $(element).find('.full.elan_img_box');
            
            const imageElement = imageBoxElement.find('img');
           
            imageURL = imageElement.attr('data-src');
            console.log(imageURL)
        
            const priceElement = $(element).find('.elan_price');
            price = priceElement.text().trim();
            
            const locationElement = $(element).find('.elan_unvan');
            const locationText = locationElement.text().trim();
            const locationParts = locationText.split(',');
        
            city = 'Not Found'//locationParts[0].trim();
            regionPlace = 'Not Found'//locationParts[1].trim();
        
            room = 'Not Found'; // Not available on Arenda.az
            floor = 'Not Found'; // Not available on Arenda.az
            sellingRent = price; // Not available on Arenda.az
            documents = 'Not Found'; // Not available on Arenda.az
        
            
        }
         
        
          if(price!=''){
            results.push({
            link,
            imageURL,
            price,
            sellingRent,
            documents,
            city,
            regionPlace,
            floor,
            room,
            source: website.source
          });}
        });
      } else {
        console.log(`Failed to retrieve data from ${website.url}. Status code: ${response.status}`);
      }
    }

    //console.log(results);
    const htmlContent = generateHTML(results);
    saveHTML(htmlContent);

    console.log('Scraped data saved to HTML file.');
    //res.send('Scraping complete.'); // Stop execution and send response
  } catch (error) {
    console.log(`An error occurred: ${error}`);
    //res.status(500).send('An error occurred during scraping.'); // Stop execution and send error response
  }
}




cron.schedule('*/5 * * * *',   () => {
  console.log('Running scraper...');
  scrapeSite().catch(error => {
    console.log(`An error occurred in the scheduled task: ${error}`);
  });
}); 

module.exports = { scrapeSite };
