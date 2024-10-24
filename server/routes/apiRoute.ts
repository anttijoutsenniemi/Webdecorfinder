import express from "express";
import {
    searchSerperImages,
    searchSerperImagesFiltered,
    searchSerperWebStoresFiltered
} from "../functions/serperSearch";

const apiRoute: express.Router = express.Router();

apiRoute.post(
  "/serperImageSearch",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const searchQuery = req.body.searchQuery;
      const searchResults = await searchSerperImages(searchQuery);
      res.status(200).json(searchResults);
      console.log("searchResults", searchResults);
    } catch (e: any) {
      res.status(404).json({ error: `error fetching: ${e}` });
    }
  }
);

apiRoute.post(
  "/serperImageSearchFiltered",
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const searchQuery = req.body.searchQuery;
      let searchResults = await searchSerperImagesFiltered(searchQuery);
      res.status(200).json(searchResults);
    } catch (e: any) {
      res.status(404).json({ error: `error fetching: ${e}` });
    }
  }
);

apiRoute.post(
  "/searchSerperWebStoresFiltered",
  async (req: express.Request, res: express.Response): Promise<void> => {
    console.log("Received search request:", req.body);

    try {
      const searchQuery = req.body.searchQuery;
      if (!searchQuery) {
        res.status(400).json({ error: "Search query is required" });
        return;
      }

      const results = await searchSerperWebStoresFiltered(searchQuery);
      res.status(200).json(results);
    } catch (e: any) {
      console.error("Search error:", e);
      res.status(500).json({
        error: "Search failed",
        details: e.message,
        query: req.body.searchQuery,
      });
    }
  }
);

export default apiRoute;
