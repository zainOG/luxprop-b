const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const fs = require('fs');
const Properties = require('../models/properties')


const createProperties = async (data) => {
  let num = 1
  for (const property of data) {
    const { link, imageURL, price, sellingRent, city, regionPlace, floor, room, source, description, ownerType, propertyCategory, mortgage, area } = property;

    if (description !== '') {
      const propertiesData = {
        link,
        imageURL,
        price,
        sellingRent,
        city,
        regionPlace,
        floor,
        room,
        source,
        description,
        ownerType,
        propertyCategory,
        mortgage, 
        area
      };

      await Properties.create({ propertiesData }, { timeout: 1000 });
      console.log(num,". Creating")
      num++
    }
  }
}

function generateHTML(data) {
  let html = `
    <html>
      <head>
        <style>
        .image-container {
          display: flex;
          flex-wrap: wrap;
          border-radius: 10px;
          justify-content: center;
        }
        div.property {
          width: 400px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        }
      
        a.property-link {
          text-decoration: none;
          color: #333;
        }
      
        a.property-link:hover {
          text-decoration: underline;
        }
      
        img.property-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin-bottom: 10px;
        }
      
        span.property-label {
          font-weight: bold;
        }
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
        
          form {
            max-width: 1000px;
            min-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f5f5f5;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }
        
          label {
            display: block;
            margin-bottom: 5px;
          }
        
          .form-column {
            flex-basis: 45%;
            margin-bottom: 10px;
          }
        
          select,
          input[type="text"],
          input[type="number"],
          input[type="submit"],
          input[type="checkbox"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
        
          input[type="submit"] {
            background-color: #4caf50;
            border-radius: 10px;
            color: #fff;
            cursor: pointer;
          }
        
          input[type="checkbox"] {
            display: inline;
            width: auto;
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
      <form action="search_results.html" method="GET">
    <div class="form-column">
        <label for="object-type">Obyektin növü:</label>
        <select name="object-type" id="object-type">
            <option value="house">Ev</option>
            <option value="apartment">Mənzil</option>
            <option value="office">Ofis</option>
            <!-- Digər seçimləri də əlavə edin -->
        </select>
        <br>

        <label for="building-type">Binanın növü:</label>
        <select name="building-type" id="building-type">
            <option value="residential">Yaşayış binası</option>
            <option value="commercial">Ticarət binası</option>
            <!-- Digər seçimləri də əlavə edin -->
        </select>
        <br>

        <label for="announcement-type">Elanın növü:</label>
        <select name="announcement-type" id="announcement-type">
            <option value="sale">Satış</option>
            <option value="rent">Kirayə</option>
            <!-- Digər seçimləri də əlavə edin -->
        </select>
        <br>

        <label for="vendor-type">Satıcı növü:</label>
        <select name="vendor-type" id="vendor-type">
            <option value="individual">Fiziki şəxs</option>
            <option value="agency">Agentlik</option>
            <!-- Digər seçimləri də əlavə edin -->
        </select>
        <br>

        <label for="city">Şəhər:</label>
        <input type="text" name="city" id="city">
        <br>

        <label for="district">Rayon:</label>
        <input type="text" name="district" id="district">
        <br>

        <label for="metro">Metro:</label>
        <input type="text" name="metro" id="metro">
        <br>

        <label for="cave">Qəsəbə:</label>
        <input type="text" name="cave" id="cave">
        <br>

        <label for="bookmark">Əv əlavəsi:</label>
        <input type="text" name="bookmark" id="bookmark">
        <br>

        <label for="keywords">Açar sözlərlə:</label>
        <input type="text" name="keywords" id="keywords">
        <br>
    </div>
    <div class="form-column">    
        <label for="document">Sənəd növü:</label>
        <input type="text" name="document" id="document">
        <br>

        <label for="credit-condition">Kredit şərtləri:</label>
        <input type="text" name="credit-condition" id="credit-condition">
        <br>

        <label for="room-number">Otaq sayı:</label>
        <input type="number" name="room-number" id="room-number">
        <br>

        <label for="editing">Redaktə:</label>
        <input type="text" name="editing" id="editing">
        <br>

        <label for="floor">Mərtəbə:</label>
        <input type="number" name="floor" id="floor">
        <br>

        <input type="checkbox" name="not-last-floor" id="not-last-floor">
        <label for="not-last-floor">Axırıncı mərtəbə deyil</label>
        <br>

        <label for="building-floor">Binanın mərtəbə sayı:</label>
        <input type="number" name="building-floor" id="building-floor">
        <br>

        <label for="price">Qiymət:</label>
        <input type="number" name="price" id="price">
        <br>

        <label for="field">Sahə (m2):</label>
        <input type="number" name="field" id="field">
        <br>
    </div>    
    <input type="submit" value="Axtar">
  </form>

      
        <div class="image-container">
        `;

  data.forEach(property => {
    const { link, imageURL, price, sellingRent, city, regionPlace, floor, room, source, description } = property;
    if(description!=''){
      html += `
    <div class="property">
      <a class="property-link" href="${link}" target="_blank">
        <img class="property-image" src="${imageURL}" data-src="${imageURL}" alt="Property Image">
        <span class="property-label">Qiymət:</span> ${price}<br>
        <span class="property-label">Satılır/Kirayə:</span> ${sellingRent}<br>
        <span class="property-label">Küçə:</span> ${city}<br>
        <span class="property-label">Region:</span> ${regionPlace}<br>
        <span class="property-label">Mərtəbə:</span> ${floor}<br>
        <span class="property-label">Otaq:</span> ${room}<br>
        <span class="property-label">İnformasiya:</span> ${description}<br>
        <span class="property-label">Mənbə:</span> ${source}
      </a>
    </div>
    `;}
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
      ////console.log(`Failed to read HTML file: ${err}`);
      return;
    }
    
    const combinedContent = content + data;
    
    fs.writeFile('views/index.html', combinedContent, (err) => {
      if (err) {
        ////console.log(`Failed to save HTML file: ${err}`);
      } else {
        ////console.log('HTML file saved successfully.');
      }
    });
  });
}

const scrapeSite = async (req, res) => {
  const websites = [
    { url: 'https://bina.az/', source: 'Bina.az' },
    { url: 'https://arenda.az/', source: 'Arenda.az' }, 
    { url: 'https://yeniemlak.az/', source: 'Yeniemlak.az' },    
    { url: 'https://emlak.az/', source: 'Emlak.az' },
    {url: 'https://vipemlak.az/', source: 'VipEmlak.az',}
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
  };

  try {
    const results = [];
    const scrapePromises = [];
    const maxItemsPerWebsite = 10;
    let scrapedItemsCount = 0; // Count of scraped items per website


    for (const website of websites) {
      ////console.log(website.url)
      const response = await axios.get(website.url, { headers });

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        
        let propertyItems;

        if (website.source === 'Bina.az') {
          propertyItems = $('.items-i.vipped');
        }  else if (website.source === 'Yeniemlak.az') {
          propertyItems = $('.ads');
        }else if (website.source === 'Kub.az') {
          propertyItems = $('.item');
        } else if (website.source === 'Arenda.az') {
          propertyItems = $('.new_elan_box');
        }  else if (website.source === 'Lalafo.az') {
          propertyItems = $('.AdTileHorizontal');
        } else if (website.source === 'Emlak.az') {
          console.log("did check", website.source);
          propertyItems = $('.ticket-item');
        } else if (website.source === 'VipEmlak.az') {
          console.log("Checked items")
          propertyItems = $('.pranto.prodbig.vipebg');
        }

        propertyItems.each((index, element) => {
          let link, imageURL, price, sellingRent, city, regionPlace, floor, room, description, ownerType, propertyCategory, mortgage, area;

          if (scrapedItemsCount >= maxItemsPerWebsite) {
            return; // Stop further scraping for this website
          }

          if (website.source === 'Bina.az') {
            
            const linkElement = $(element).find('.item_link');
            link = 'https://bina.az' + linkElement.attr('href');
            const anchorTag = linkElement.prop('outerHTML'); // Get the full anchor tag HTML

            const imageElement = $(element).find('.slider_image img');
            imageURL = imageElement.attr('data-src');

            const locationElement = $(element).find('.location');
            regionPlace = locationElement.text().trim();
            city = locationElement.text().trim();
            //const locationParts = locationText.split(',');
            ////console.log('Region', regionPlace)
            ////console.log('Image URL', imageURL)
            //////console.log('Price', price)
            //city = locationParts[0].trim();
            //regionPlace = locationParts[1].trim();

             // Not available on Bina.az
            documents = 'Not Found'; // Not available on Bina.az
            floor = 'Not Found'; // Not available on Bina.az
            room = 'Not Found'; // Not available on Bina.az
            scrapePromises.push(
                scrapeFurther(headers, link)
                .then($ => {
                  ////console.log('Scraping Further!')
                  const firstLink = $('.product-breadcrumbs__i-link[data-stat="product-breadcrumbs-first"]');
                  const secondLink = $('.product-breadcrumbs__i-link[data-stat="product-breadcrumbs-second"]');
                
                  sellingRent = firstLink.text().trim();
                  const shortDescription = secondLink.text().trim();
                
                  const priceElement = $(element).find('.price-val');
                  price = priceElement.text().trim();
                
                
                  const addressElement = $('.product-map__left__address');
                  const address = addressElement.text().trim();
                
                  const categoryElement = $('.product-properties__i-name:contains("Kateqoriya")').next('.product-properties__i-value');
                  const category = categoryElement.text().trim();
                
                  const floorElement = $('.product-properties__i-name:contains("Mərtəbə")').next('.product-properties__i-value');
                  floor = floorElement.text().trim();
                
                  const areaElement = $('.product-properties__i-name:contains("Sahə")').next('.product-properties__i-value');
                  area = areaElement.text().trim();
                
                  const roomNumberElement = $('.product-properties__i-name:contains("Otaq sayı")').next('.product-properties__i-value');
                  room = roomNumberElement.text().trim();
                
                  const repairElement = $('.product-properties__i-name:contains("Təmir")').next('.product-properties__i-value');
                  const repair = repairElement.text().trim();

                  const propertyCategoryElement = $('.product-properties__i-name:contains("Kateqoriya")').next('.product-properties__i-value');
                  propertyCategory = propertyCategoryElement.text().trim();
                  
                
                  const descriptionElement = $('.product-description__content');
                  description = descriptionElement.text().trim();
                
                  const locationElement = $(element).find('.product-map__left__address');
                  const location = locationElement.text().trim();

                  const ownerNameElement = $('.product-owner__info-name');
                  const ownerName = ownerNameElement.text().trim();

                  const ownerRegionElement = $('.product-owner__info-region');
                  const ownerRegion = ownerRegionElement.text().trim();

                  
                  ownerType = ownerRegion
                  //////console.log('Price', price)
                  //////console.log('Address:', address);
                  //////console.log('Category:', category);
                  //////console.log('Floor:', floor);
                  //////console.log('Land Area:', area);
                  //////console.log('Room Number:', room);
                  //////console.log('Repair:', repair);
                  //////console.log('Selling/Rent:', sellingRent);
                  //////console.log('Short Description:', shortDescription);
                  //////console.log('Description:', description);
                  //////console.log('Location', location)
                  city= address
                  const mortgageElement = $('.product-properties__i-name:contains("İpoteka")').next('.product-properties__i-value');
                  mortgage = mortgageElement.text().trim();
                 

                  console.log(website.source, "\n", "Owner Details: ", ownerName, ownerRegion, "\nCategory: ", propertyCategory,"Mortgage", mortgage)

                  if (price != ''||city != '') {
                    results.push({
                      link,
                      imageURL,
                      price,
                      sellingRent,
                      city,
                      regionPlace,
                      floor,
                      room,
                      source: website.source,
                      description,
                      ownerType,
                      propertyCategory,
                      mortgage, 
                      area
                    });
                  }
                  
                  /* scrapedItemsCount++; // Increment the count of scraped items

                  // If the maximum limit for this website is reached, stop further scraping for this website
                  if (scrapedItemsCount >= maxItemsPerWebsite) {
                    return; // Stop further scraping for this website
                  } */
                })
                .catch(error => {
                  ////console.log(`An error occurred while scraping further data for ${link}: ${error}`);
                })
            )

            
          } else if (website.source === 'Kub.az') {
            //////console.log('Im at 2');
            /* const linkElement = $(element).find('.item-picture a');
            link ='https://kub.az/'+linkElement.attr('href'); */
            /* scrapeFurther(headers, link)
            .then($ => {
              //////console.log($);
            })
            .catch(error => {
              ////console.log(`An error occurred while scraping further data for ${link}: ${error}`);
            }); */
           /*  const imageElement = $(element).find('.item-picture img');
            imageURL = 'https://kub.az/'+imageElement.attr('src');

            const priceElement = $(element).find('.item-price .price-amount');
            price = priceElement.text().trim();

            const nameElement = $(element).find('.item-category b:first-child');
            const name = nameElement.text().trim();

            const createdElement = $(element).find('.item-date');
            const created = createdElement.text().trim();

            const locationElements = $(element).find('.details .text-nowrap b');
            city = locationElements.eq(0).text().trim();
            regionPlace = locationElements.eq(1).text().trim(); */

            /* sellingRent = 'Not Found'; // Not available in the provided HTML structure
            documents = 'Not Found'; // Not available in the provided HTML structure
            floor = 'Not Found'; // Not available in the provided HTML structure
            room = 'Not Found'; // Not available in the provided HTML structure */
        
           /* console.log("On Kub.az",link, imageURL, price, city, regionPlace, name, created); */
        } else if (website.source === 'Yeniemlak.az') {
           
              const linkElement = $(element).closest('td').find('a[href^="/elan/"]');
              link = 'https://yeniemlak.az/' + linkElement.attr('href');
              
              const imageElement = $(element).find('img');
              imageURL = 'https://yeniemlak.az/' + imageElement.attr('src');

              const priceElement = $(element).find('.price');
              price = priceElement.text().trim();

              const sellingRentElement = $(element).find('.top-text');
              sellingRent = sellingRentElement.text().trim();

              const locationElement = $(element).find('.bottom b').last();
              const locationText = locationElement.text().trim();
              const locationParts = locationText.split(',');

              city = locationParts.length > 1 ? locationParts[1].trim() : 'Not Found';
              regionPlace = locationParts.length > 0 ? locationParts[0].trim() : 'Not Found';

               // Not available on Yeniemlak.az
              floor = 'Not Found'; // Not available on Yeniemlak.az
              documents = 'Not Found'; // Not available on Yeniemlak.az

              //////console.log(link, imageURL, price, sellingRent, city, regionPlace);
              scrapePromises.push(
                  scrapeFurther(headers, link)
                  .then($ => {
                    const boxElement = $('.box');
                  
                      const propertyTypeElement = boxElement.find('emlak');
                      const propertyType = propertyTypeElement.text().trim();
                  
                      const paramsElements = boxElement.find('.params');
                      room = $(paramsElements[0]).text().trim();
                      area = $(paramsElements[1]).text().trim();
                      floor = $(paramsElements[2]).text().trim();
                      const yard = $(paramsElements[3]).text().trim();
                  
                      const propertyDetailsElement = boxElement.find('.text');
                      description = propertyDetailsElement.eq(0).text().trim();
                  
                      const checkElements = boxElement.find('.check');
                      const renovated = checkElements.eq(0).text().trim();
                      const gas = checkElements.eq(1).text().trim();
                      const water = checkElements.eq(2).text().trim();
                      const electricity = checkElements.eq(3).text().trim();
                      const telephone = checkElements.eq(4).text().trim();
                      const steelDoor = checkElements.eq(5).text().trim();
                      const pvcWindows = checkElements.eq(6).text().trim();
                      const balcony = checkElements.eq(7).text().trim();
                      const airConditioning = checkElements.eq(8).text().trim();
                      const kitchenFurniture = checkElements.eq(9).text().trim();
                      const furnished = checkElements.eq(10).text().trim();
                      const heatingSystem = checkElements.eq(11).text().trim();
                  
                      const addressHeadingElement = boxElement.find('h1:contains("Ünvan")');
                      const addressElement = addressHeadingElement.next();
                      city = addressElement.text().trim();

                      const contactHeadingElement = boxElement.find('h1:contains("Contact")');
                      const nameElement = contactHeadingElement.next();
                      const name = nameElement.text().trim();
                      const agentElement = nameElement.next();
                      const agent = agentElement.text().trim();
                      ownerType = $('div.elvrn').text().trim();
                      propertyCategory = $('div.title tip').text().trim();


                      const telElement = boxElement.find('.tel img');
                      const phoneNumber = telElement.attr('src').replace('/tel-show/', '');

                      const noteHeadingElement = boxElement.find('h1:contains("Note")');
                      const noteElement = noteHeadingElement.next();
                      const note = noteElement.text().trim();
                      console.log("Scraped:\n",
                      "link", link,
                      "yard", yard,
                      "Name", name,
                       "Agent", agent,
                       "phone number", phoneNumber,
                       "note", note,
                       "Ownertype", ownerType,
                       "property Category", propertyCategory,
                       "area", area,

                      ) 
                      if (price != ''||city != '') {
                        results.push({
                          link,
                          imageURL,
                          price,
                          sellingRent,
                          city,
                          regionPlace,
                          floor,
                          room,
                          source: website.source,
                          description,
                          ownerType,
                          propertyCategory,
                          mortgage: "",
                          area
                        });
                      }
                      /* results.push({
                        link,
                        imageURL,
                        price,
                        sellingRent,
                        city,
                        regionPlace,
                        floor,
                        room,
                        source: website.source,
                        description,
                        ownerType,
                        propertyCategory,
                        mortgage, 
                        area
                      }); */

                  })
                  .catch(error => {
                    console.log(`An error occurred while scraping further data for ${link}: ${error}`);
                  })
              )
              
          } else if (website.source === 'Emlak.az'){
            link = 'https://emlak.az'+ $(element).find('a').attr('href');
            imageURL = 'https://emlak.az'+ $(element).find('.ticket-photo img').attr('src');
            price = $(element).find('.price-ticket').text().trim();
            description = $(element).find('.description-ticket').text().trim();

          
            scrapePromises.push(
            scrapeFurther(headers, link)
            .then($ => {
              
              
              const addressElement = $('div.map-address h4');
              const addressText = addressElement.text().replace('Ünvan:', '').trim();

              // Split the address text into city and region
              [regionPlace, city] = addressText.split(',').map(part => part.trim());

              // Use city and regionPlace as needed
              console.log('City:', city);
              console.log('Region:', regionPlace);
              const sellerElement = $('p.name-seller');
              const sellerName = sellerElement.contents().filter(function () {
                  return this.nodeType === 3; 
              }).text().trim();
              ownerType = sellerElement.find('span').text().replace('(', '').replace(')', '').replace('Nömrəni göstər', '').trim();
                  
              const titleElement = $('h1.title');
              sellingRent = titleElement.text().split(' ')[0]; 

             
              console.log('Selling or Renting:', sellingOrRent);
              
              console.log('Seller Name:', sellerName);
              console.log('Seller Type:', ownerType);
             
              $('dl.technical-characteristics dd').each((index, element) => {
                  const label = $(element).find('span.label').text().trim();
                  const value = $(element).text().replace(label, '').trim();
      
                  switch (label) {
                      case 'Əmlakın növü':
                          propertyCategory = value;
                          break;
                      case 'Sahə':
                          area = value;
                          break;
                      case 'Otaqların sayı':
                          room = value;
                          break;
                      case 'Yerləşdiyi mərtəbə':
                          floor = value;
                          break;
                      case 'Mərtəbə sayı':
                          floor = value;
                          break;
                      case 'Təmiri':
                         
                          break;
                      case 'Sənədin tipi':
                          mortgage = value;
                          break;
                    
                  }
              });
      
             
              console.log('Price:', price);
              console.log('Selling/Rent:', sellingRent);
              console.log('City:', city);
              console.log('Region/Place:', regionPlace);
              console.log('Number of Floors:', floor);
              console.log('Number of Rooms:', room);
              console.log('Owner Type:', ownerType);
              console.log('Property Category:', propertyCategory);
              console.log('Mortgage:', mortgage);
              console.log('Area:', area)

              results.push({
                link,
                imageURL,
                price,
                description,
                sellingRent,
                city,
                regionPlace,
                floor,
                room,
                source: website.source,
                ownerType,
                propertyCategory,
                mortgage,
                area,
              });
            })
            .catch(error => {
                console.log(`An error occurred while scraping further data for ${link}: ${error}`);
            })
            );
           
            
        }
        else if (website.source === 'Arenda.az') {
            
            const linkElement = $(element).find('a');
            link = linkElement.attr('href');

            const imageBoxElement = $(element).find('.full.elan_img_box');
            
            const imageElement = imageBoxElement.find('img');
           
            imageURL = imageElement.attr('data-src');
            ////console.log('Image Link:',imageURL)
        
            const priceElement = $(element).find('.elan_price');
            price = priceElement.text().trim();
            
            const locationElement = $(element).find('.elan_unvan');
            const locationText = locationElement.text().trim();
            const locationParts = locationText.split(',');
            ////console.log('Location Parts', locationParts, 'Locaion Element', locationText)
            city = locationParts.length > 0 ? locationParts[0].trim() : 'Not Found';
            regionPlace = locationParts.length > 1 ? locationParts[1].trim() : city;
        
            ////console.log('Location Parts', locationParts, 'City', city, regionPlace)
            const tableElement = $(element).find('.n_elan_box_botom_params');
            room = tableElement.find('td:eq(0)').text().trim();
            area = tableElement.find('td:eq(1)').text().trim();
            floor = tableElement.find('td:eq(2)').text().trim();
            /* const sellingRentElement = $(element).find('.elan_property_title');
            sellingRent = sellingRentElement.text().trim();
            const propertyCategoryElement = sellingRent.match(/\(([^)]+)\)/);
            propertyCategory = propertyCategoryElement? propertyCategoryElement[1]: " " */
            const title = $('p.elan_property_title.elan_elan_nov').contents().filter(function () {
              return this.nodeType === 3; // Filter out text nodes
            }).text().trim();
            
            // Remove the content within parentheses
            const cleanedTitle = title.replace(/\([^)]*\)/g, '').trim();
            
            // Extract sellingOrRent and PropertyCategory
            [sellingRent, propertyCategory] = cleanedTitle.split(' ');
            documents = 'Visit the link for details'; // Not available on Arenda.az
            
            scrapePromises.push(
                scrapeFurther(headers, link)
                .then($ => {
                  //////console.log($);
                  /* const price = $('.elan_new_price_box p').text().trim(); */
                  const roomInfo = $('.elan_new_prop_list li:first-child').text().trim();
                  /* area = $('.elan_new_prop_list li:nth-child(2)').text().trim(); */
                  const pricePerSquareMeter = $('.elan_new_prop_list li:last-child').text().trim();

                  const agencyInfo = $('.new_elan_user_info p:first-child').text().trim();
                  const ownerTypeMatch = agencyInfo.match(/\(([^)]+)\)/);
                  ownerType = ownerTypeMatch[1]
                  
                  const userInfo = {
                    agency: $('.new_elan_user_info p:first-child').text().trim(),
                    contact: $('.new_elan_user_info p:nth-child(2) a').attr('href'),
                    userAds: $('.new_elan_user_info p:nth-child(3) a').attr('href'),
                  };
                  //console.log("USERINFO", userInfo)

                  const dateAndCode = {
                    date: $('.elan_date_box_rside p:first-child').text().trim(),
                    code: $('.elan_date_box_rside p:nth-child(2)').text().trim(),
                    views: $('.elan_date_box_rside p:nth-child(3)').text().trim(),
                  };
                  const descriptionElement = $('.full.elan_info_txt > p'); // Select the <p> element inside the div with classes "full" and "elan_info_txt"
                  description = descriptionElement.text().trim();
                  //console.log("Arendz", description)
                  if (price !== ''&&imageURL&&ownerType) {
                    results.push({
                      link,
                      imageURL,
                      price,
                      area,
                      sellingRent,
                      propertyCategory,
                      ownerType,
                      city,
                      regionPlace,
                      floor,
                      room,
                      source: website.source,
                      description,
                      mortgage: "",
                    });
                  }
                 
                })
                .catch(error => {
                  console.log(`An error occurred while scraping further data for ${link}: ${error}`);
                })
            )
            
            
        }
        else if (website.source === 'VipEmlak.az') {
          
          const linkElement = $(element).find('a');
          const link = 'https://vipemlak.az' + linkElement.attr('href');

          const imageElement = $(element).find('.holderimg img');
          const imageURL = 'https://vipemlak.az'+ imageElement.attr('src');

          const titleElement = $(element).find('h3');
          const description = titleElement.text().trim();

          /* const priceElement = $(element).find('.sprice');
          const price = priceElement.text().trim(); */
          /* console.log(" VIPEMLAK", link, imageURL, description) */
          scrapePromises.push(
                scrapeFurther(headers, link)
                .then($ => {

                  const breadcrumbElement = $('.breadcrumb a');
                  propertyCategory = breadcrumbElement.eq(1).text().trim();

                  const generalInfoElement = $('.infoth');
                  const generalInfo = generalInfoElement.next('.infotd100').text().trim();
                  

                  if (generalInfo.includes('Satış')||generalInfo.includes('satış')) {
                    sellingRent = 'Satış';
                  } else if (generalInfo.includes('Kirayə')||generalInfo.includes('kirayə')) {
                    sellingRent = 'Kirayə';
                  } else {
                    sellingRent = 'Satış/Kirayə'; // You can set a default value or handle other cases
                  }
            
                  const propertyTypeElement = $('.infotd:contains("Əmlakın növü")');
                  propertyCategory = propertyTypeElement.next('.infotd2').text().trim();
            
                  const roomCountElement = $('.infotd:contains("Otaq sayı")');
                  room = roomCountElement.next('.infotd2').text().trim();
            
                  const areaElement = $('.infotd:contains("Sahə")');
                  area = areaElement.next('.infotd2').text().trim();
            
                  const priceElement = $('.infotd:contains("Qiymət")');
                  price = priceElement.next('.infotd2').find('.pricecolor').text().trim();
            
                  const addressElement = $('.infotd100:contains("Ünvan")');
                  const addressText = addressElement.contents().filter((_, el) => el.nodeType === 3 || (el.nodeType === 1 && el.tagName === 'span' && el.className === 'sep')).text().trim();
                  
                
                  const addressParts = addressText.split('•').map(part => part.trim());
   
                  const filteredAddressParts = addressParts.filter(part => part !== '');
                 
  
                  city = addressParts[addressParts.length-1]
                  regionPlace = addressParts[addressParts.length-1]
            
                  const contactPersonElement = $('.infocontact strong:contains("Əlaqədar şəxs")');
                  const contactPerson = contactPersonElement.next('br').text().trim();
            
                  const phoneNumberElement = $('.telzona #telshow');
                  const phoneNumber = phoneNumberElement.text().trim();
            
                  console.log(" VIPEMLAK", /* link, imageURL, */ "Description:",description, "Room:" ,room , "SR:" ,sellingRent," Area:",area, " Price:", price, " PropertyType:",propertyCategory, " Region:",regionPlace," City: ", city)
                  // Add the further details to the existing results array
                  if (price !== ''&&imageURL) {
                      results.push({
                        link,
                        imageURL,
                        description,
                        room,
                        source: website.source,
                        city,
                        regionPlace,
                        sellingRent,
                        area,
                        price,
                        ownerType: "mülkiyyətçi",
                        propertyCategory,
                        mortgage: "",
                      });
                  }
                 /*  results.push({
                    link,
                    imageURL,
                    price,
                    description,
                    sellingRent,
                    city,
                    regionPlace,
                    floor,
                    room,
                    source: website.source,
                    ownerType,
                    propertyCategory,
                    mortgage,
                    area,
                  }); */
                })
                .catch(error => {
                  console.log(`An error occurred while scraping further data for ${link}: ${error}`);
                })
            )

         
        }
         
        
          
        });
      } else {
        console.log(`Failed to retrieve data from ${website.url}. Status code: ${response.status}`);
      }
    }
    await Promise.all(scrapePromises);
    /* let property = 1
    results.map((result)=>{
      if(result.source==='VipEmlak.az'){
        console.log(property,". ",result)
      }
      property++
    }) */
    /* const htmlContent = generateHTML(results); */
    await createProperties(results)
    
   /*  saveHTML(htmlContent); */

    ////console.log('Scraped data saved to HTML file.');
    //res.send('Scraping complete.'); // Stop execution and send response
  } catch (error) {
    console.log(`An error occurred: ${error}`);
    //res.status(500).send('An error occurred during scraping.'); // Stop execution and send error response
  }
}

const scrapeFurther = async(headers, link) =>{
  try {
    
    const response = await axios.get(link, { headers });

  if (response.status === 200) {
    ////console.log('Followning', link)
    const $ = cheerio.load(response.data);
    return $
  }else {
    ////console.log(`Failed to retrieve further data from ${website.url}. Status code: ${response.status}`);
  }

}catch(error){
    ////console.log(`An error occurred: ${error}`);
  }


}




cron.schedule('*/4 * * * *',   () => {
  ////console.log('Running scraper...');
  scrapeSite().catch(error => {
    ////console.log(`An error occurred in the scheduled task: ${error}`);
  });
});

module.exports = { scrapeSite };
