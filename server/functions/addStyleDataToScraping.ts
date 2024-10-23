import { Product } from "./webScraping"
import furnitureModel from "../dbModels/furnitureModel";
import { fetchStyleForSingleFurniture } from "./visionHandler";
import { createTimestamp } from "./timestampFi";

export const combineScrapingAndAi =  async (scrapingData : Product[], furnitureCategory : string) => {
    try {
        const databaseModule = furnitureModel(furnitureCategory);

        //first we check which products are deleted from website (exist in old dbdata but does not exist in new scrapingdata, we turn those into objects with deleted flag true)
        let newProductTitles = scrapingData.map(product => product.title);

        if(newProductTitles.length > 1){ //we check length so all products dont turn to deleted if array is empty
            databaseModule?.checkDeletedAndUpdate(newProductTitles);
        }
        else{
            return;
        }

        // Iterate over each product asynchronously and send images for ai process
        let maxLimit : number = 500;
        let counter : number = 0;
        for (const product of scrapingData) {
            if(counter > maxLimit){ //we have to have maxlimit if array is bugged and has too many items
                break;
            }
            counter++;
            let uniqueCheck = await databaseModule?.fetchOneWithStyles(product.title);

            if(!uniqueCheck){
                
                //send pic to vision
                const processedResult = await fetchStyleForSingleFurniture(product.picUrl);

                // If an object is returned, merge it into the original product
                if (processedResult) {
                    let assignableObject = JSON.parse(processedResult)
                    product['styleJson'] = assignableObject;
                    product['timeStamp'] = createTimestamp();

                    databaseModule?.addData(product); //lastly add product tp db
                }
                else{
                    console.log(`An error occured creating product info with title: ${product.title}`);
                }
                
                console.log(`Completed processing for product title: ${product.title}`);
            }
            else{
                if(uniqueCheck.deleted){
                    databaseModule?.updateDeleted(uniqueCheck.title);
                    console.log(`Product with title: ${uniqueCheck.title} bringed back to existing from deleted`);
                }
                else{
                    console.log(`Product with title: ${product.title} already created, jumping to next one`);
                }
   
            }
            
        }
    } catch (error) {
        console.log(`Error combining data: `, error);
    }
     
}