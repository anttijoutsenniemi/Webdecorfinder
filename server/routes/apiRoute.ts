import express from 'express';
import { scrapeWebsite } from '../functions/webScraping';
import furnitureModel from '../dbModels/furnitureModel';
import counterModel from '../dbModels/counterModel';
import feedbackModel from '../dbModels/feedbackModel';
import { scrapeAndMakeAiData, scrapeAndMakeAiDataNew, scrapeCategory } from '../functions/scheduledFunctions';
import parameterLibrary from './../styleJson/parameterLibrary.json';
import { searchSerperImages, searchSerperImagesFiltered } from '../functions/serperSearch';

const apiRoute : express.Router = express.Router();

const counterModule = counterModel();
const feedbackModule = feedbackModel();

apiRoute.get("/", async (req : express.Request, res : express.Response) : Promise<void> => { 
    try {
        res.status(200).json({ "message" : "apiroute initialized"});
    } catch (e : any) {
        res.status(404).json({ "error" : `error fetching: ${e}` });
    }
});

apiRoute.post("/furnitureCategory", async (req : express.Request, res : express.Response) : Promise<void> => { 
    try {
        let category : string = req.body.category;
        if(parameterLibrary.includes(category)){
            let data = await furnitureModel(category).fetchData();
            res.status(200).json(data);
        }
        else{
            res.status(404).json({ "error" : `invalid data` });
        }
    } catch (e : any) {
        res.status(404).json({ "error" : `error fetching: ${e}` });
    }
});

apiRoute.post("/categoryWithQuantity", async (req : express.Request, res : express.Response) : Promise<void> => { 
    try {
        let category : string = req.body.category;
        let quantity : number = req.body.quantity;
        if(parameterLibrary.includes(category) && typeof quantity === 'number'){
            let data = await furnitureModel(category).fetchDataWithQuantity(quantity);
            res.status(200).json(data);
        }
        else{
            res.status(404).json({ "error" : `invalid data` });
        }
    } catch (e : any) {
        res.status(404).json({ "error" : `error fetching: ${e}` });
    }
});

apiRoute.get("/testScraping", async (req : express.Request, res : express.Response) : Promise<void> => { 
    try {

        // let automaticScraping = await scrapeAndMakeAiDataNew();
        let scraping = await scrapeCategory(`https://www.tavaratrading.com/kaytetyt/?category[]=29`, 'sohvat_nojatuolit_ja_rahit');
        // let scraping2 = await scrapeCategory(`www.tavaratrading.com/kaytetyt/?category[]=196`, 'korkeat_tuolit')
        res.status(200).json({ "message" : "apiroute initialized"});
    } catch (e : any) {
        res.status(404).json({ "error" : `error fetching: ${e}` });
    }
});

apiRoute.post("/sendFeedback", async (req : express.Request, res : express.Response) : Promise<void> => { 
    try {
        let success: boolean = req.body.success;
        if(req.body.feedback){
            await feedbackModule.addData({ feedback: req.body.feedback });
        }
        await counterModule.updateFeedbackCounter(success);
        
        res.status(200).json({ "message" : "feedback updated"});
    } catch (e : any) {
        res.status(404).json({ "error" : `error fetching: ${e}` });
    }
});

apiRoute.post("/serperImageSearch", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const searchQuery = req.body.searchQuery;
        const searchResults = await searchSerperImages(searchQuery);
        res.status(200).json(searchResults);
        console.log('searchResults', searchResults);
    } catch (e: any) {
        res.status(404).json({ "error": `error fetching: ${e}` });
    }
});

apiRoute.post("/serperImageSearchFiltered", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const searchQuery = req.body.searchQuery;
        let searchResults = await searchSerperImagesFiltered(searchQuery);
        res.status(200).json(searchResults);
    } catch (e: any) {
        res.status(404).json({ "error": `error fetching: ${e}` });
    }
});

export default apiRoute;