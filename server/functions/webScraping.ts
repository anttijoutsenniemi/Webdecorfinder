import axios from 'axios';
import cheerio, { load } from 'cheerio';
import iconv from 'iconv-lite';
import clientPublic from './../styleJson/clientPublic.json';
var charset = require('charset');

export interface Product {
    picUrl: string;
    price: string,
    quantity: string,
    title: string;
    productUrl: string;
    styleJson?: any,
    deleted?: boolean,
    timeStamp?: string
}

export async function scrapeWebsite(url: string): Promise<Product[]> {
    try {
        const products: Product[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        const userAgent = 'Chrome/91.0.4472.124';
        let duplicateFound = false; // flag to stop the outer loop
    
        while(hasMorePages && currentPage < 50 && !duplicateFound){ //setting limit at 50 so no infiloops can happen
            let response;
            if(currentPage > 1){
                response = await axios.get(`${url}?page=${currentPage}`, {
                    responseType: 'arraybuffer', 
                    headers: {
                        "User-Agent": userAgent
                    }
                });
            } else {
                response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    headers: {
                        "User-Agent": userAgent
                    }
                });
            }
            
            //here we make sure we use utf-8 encoding so we maintain nordic characters
            const encoding = charset(response.headers) || 'utf-8';
            //const html = response.data;
            const html = iconv.decode(response.data, encoding);
            const $ = load(html);

            $('.listatuote').each((_idx, el) => {
                let productInfoObject: Product = {
                    picUrl: "",
                    title: "",
                    price: "",
                    quantity: "",
                    productUrl: "",
                    deleted: false
                };
    
                //find products title or name
                let title = $(el).find('.nimi a').text().trim();
                if(title){
                    productInfoObject['title'] = title;
                }
    
                //find products picture https url
                let picUrl = $(el).find('img').data('src');
                if(picUrl){
                    let thumbUrl : string = clientPublic.webStoreUrl + picUrl;
                    let bigPictureUrl : string = thumbUrl.replace('_thumb', ''); //use this variable as value if you want to use big pictures and not thumbnails
                    productInfoObject['picUrl'] = thumbUrl;
                }
    
                //find products product page url
                let productUrl = $(el).find('.nimi a').attr('href');
                if(productUrl){
                    productInfoObject['productUrl'] = clientPublic.webStoreUrl + productUrl;
                }
    
                // Find the product's price
                let price = $(el).find('.price_out').text().trim();
    
                // Find the VAT (alv) notice
                let vatNotice = $(el).find('.vat_notice').text().trim();
    
                // Extract the VAT percentage from the VAT notice
                let vatPercentageMatch = vatNotice.match(/\d+/);
                let vatPercentage = vatPercentageMatch ? vatPercentageMatch[0] + "%" : "";
    
                // Combine the price and VAT percentage
                if(price){
                    productInfoObject['price'] = `${price} € (ALV ${vatPercentage})`;
                }
    
                //find how many of the product are available
                let quantity = $(el).find('.availability .available').text().trim();
                if(quantity){
                    productInfoObject['quantity'] = quantity;
                }

                // Check if the product is already in the array to prevent duplicates
                if (!products.some(product => product.productUrl === productInfoObject.productUrl)) {
                    products.push(productInfoObject);
                }
                else{
                    duplicateFound = true; // Set flag if duplicate found
                    return false; // Break out of the `each` loop
                }

            });

            // Check if there is a "next page" link that contains the next page icon.
            if (!duplicateFound) {
                const hasNextPage = $('.page_numbers a:has(i.icon-seuraava-sivu-icon)').length > 0;
                hasMorePages = hasNextPage;
                if (hasNextPage) currentPage++;
            }
            
        }
        return products;
    } catch (error) {
        console.log(error);
        return [];
    }
   
}
