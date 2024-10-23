import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import apiRoute from "./routes/apiRoute";
import aiRoute from "./routes/aiRoute";
import expressBasicAuth from "express-basic-auth";
import { setupCronJobs } from "./functions/scheduledFunctions";
import clientPublic from './styleJson/clientPublic.json';

const app : Application = express();

//http basic auth
const authenticate =
  expressBasicAuth({
    users: {
      [process.env.TESTER_USERNAME!]: process.env.TESTER_PASSWORD!
    },
    unauthorizedResponse: getUnauthorizedResponse,
    challenge: true
});

function getUnauthorizedResponse(req:any) {
    return req.auth
        ? 'Credentials rejected'
        : 'No credentials provided';
}

//content security policy config to only accept scripts from self source
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", clientPublic.webStoreUrl, "data:"],
  },
};

//secure server headers
app.use(helmet({
  contentSecurityPolicy: cspConfig
}));

const port = process.env.PORT || 8000;

setupCronJobs(); //start scheduled scraping and ai functions

app.use(express.json({limit: '50mb'})); //receive req.body

app.use(express.static('public_chat'));

//here only these routes are authenticated at the moment
app.use("/apiroute", authenticate, apiRoute);
app.use("/airoute", authenticate, aiRoute);

app.get("/", (req: Request, res: Response) => {
  try {
    res.status(200).json({ Message: "Welcome to the homepage" });
  } catch (e: any) {
    res.status(404).json({ error: `error fetching: ${e}` });
  }
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});