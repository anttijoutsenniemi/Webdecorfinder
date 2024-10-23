import * as cron from 'node-cron';
import { scrapeWebsite } from './webScraping';
import { combineScrapingAndAi } from './addStyleDataToScraping';
import clientPublic from './../styleJson/clientPublic.json';

export const scrapeCategory = async (url : string, category : string) => {
    try {
        console.log('Starting ctaegory: ', category);
        const products = await scrapeWebsite(url);
        await combineScrapingAndAi(products, category);
        console.log(`Completed category: ${category}`);
    } catch (error) {
        console.error(`Error scraping ${category} website:`, error);
    }
};

export const scrapeAndMakeAiData = async () => {
    const scrapePromises = [
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=2`, 'tyotuolit'), //työtuolit
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=196`, 'korkeat_tuolit'), //korkeat tuolit
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=11`, 'neuvottelu-_ja_asiakastuolit'), //neuvottelu- ja asiakastuolit
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=29`, 'sohvat_nojatuolit_ja_rahit'), //sohvat, nojatuolit ja rahit
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=8`, 'sailytyskalusteet'), //säilytyskalusteet
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=5`, 'tyopoydat'), //työpöydät
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=195`, 'korkeat_poydat'), //korkeat pöydät
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=173`, 'neuvottelupoydat'), //neuvottelupöydät
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=54`, 'sahkopoydat'), //sähköpöydät
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=190`, 'sohva-_ja_pikkupoydat'), //sohva- ja pikkupöydät
        scrapeCategory(`${clientPublic.webStoreUrl}/kaytetyt/?category[]=139`, 'neuvotteluryhmat') //neuvotteluryhmät
    ];

    try {
        await Promise.all(scrapePromises);
        console.log('All categories have been scraped and processed.');
    } catch (error) {
        console.error('Error in scraping one or more categories:', error);
    }
};

//this is for new products
export const scrapeAndMakeAiDataNew = async () => {
    const scrapePromises = [
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/3/tyo-satula-ja-valvomotuolit/uudet-tyotuolit`, category: 'new_tyotuolit' }, // OK työtuolit
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/198/korkeat-poydat-ja-tuolit/uudet-korkeat-tuolit`, category: 'new_korkeat_tuolit' }, // korkeat tuolit bugaa
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/12/neuvottelupoydat-ja-tuolit/uudet-neuvottelu-ja-asiakastuolit`, category: 'new_neuvottelu-_ja_asiakastuolit' }, // neuvottelu- ja asiakastuolit
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/30/sohvat-nojatuolit-penkit-ja-rahit/uudet-sohvat-ja-nojatuolit`, category: 'new_sohvat_nojatuolit_ja_rahit' }, // sohvat, nojatuolit ja rahit
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/9/sailytys/uudet-sailytyskaapit`, category: 'new_sailytyskalusteet' }, // säilytyskalusteet
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/6/tyopoydat/uudet-tyopoydat`, category: 'new_tyopoydat' }, // OK työpöydät
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/197/korkeat-poydat-ja-tuolit/uudet-korkeat-poydat`, category: 'new_korkeat_poydat' }, // OK korkeat pöydät
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/86/neuvottelupoydat-ja-tuolit/uudet-neuvottelupoydat`, category: 'new_neuvottelupoydat' }, // neuvottelupöydät
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/49/sahkopoydat/uudet-sahkopoydat`, category: 'new_sahkopoydat' }, // OK sähköpöydät
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/191/sohvapoydat-pikku-poydat-ja-jakkarat/uudet-sohva-pikku-ja-yopoydat`, category: 'new_sohva-_ja_pikkupoydat' }, // sohva- ja pikkupöydät
        { url: `${clientPublic.webStoreUrl}/toimistokalusteet/140/neuvottelupoydat-ja-tuolit/uudet-neuvotteluryhmat`, category: 'new_neuvotteluryhmat' } // OK neuvotteluryhmät
    ];

    try {
        for (const { url, category } of scrapePromises) {
            await scrapeCategory(url, category);
        }
        console.log('All categories have been scraped and processed in order.');
    } catch (error) {
        console.error('Error in scraping one or more categories:', error);
    }
};


export const setupCronJobs = (): void => {
    //here first number is the starting minute and the other is hours, so this runs on the first minute of every 12 hours
    cron.schedule('0 */12 * * *', scrapeAndMakeAiData, {
        scheduled: true,
        timezone: "Europe/Helsinki"
    });
    cron.schedule('0 1,13 * * *', scrapeAndMakeAiDataNew, {
        scheduled: true,
        timezone: "Europe/Helsinki"
    });
};
