import express from 'express';
import { searchSerperImages, searchSerperImagesFiltered } from '../functions/serperSearch';

const apiRoute : express.Router = express.Router();

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