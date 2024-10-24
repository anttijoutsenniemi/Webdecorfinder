import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import expressBasicAuth from "express-basic-auth";
import helmet from "helmet";
import aiRoute from "./routes/aiRoute";
import apiRoute from "./routes/apiRoute";
dotenv.config();

const app: Application = express();

// Tarkista että ympäristömuuttujat ovat olemassa
if (!process.env.TESTER_USERNAME || !process.env.TESTER_PASSWORD) {
  console.error("Missing required environment variables! Check your .env file");
  process.exit(1);
}

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//http basic auth
const authenticate = expressBasicAuth({
  users: {
    [process.env.TESTER_USERNAME]: process.env.TESTER_PASSWORD,
  },
  unauthorizedResponse: getUnauthorizedResponse,
  challenge: true,
});

// app.use((req, res, next) => {
//   console.log("Auth header:", req.headers.authorization);
//   next();
// });

function getUnauthorizedResponse(req: any) {
  return req.auth ? "Credentials rejected" : "No credentials provided";
}

//content security policy config to only accept scripts from self source
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "*"], //have to have asterix "*" to accept images from web
    connectSrc: ["'self'", "http://localhost:3000", "http://localhost:8000"],
  },
};

//secure server headers
app.use(
  helmet({
    contentSecurityPolicy: cspConfig,
  })
);

const port = process.env.PORT || 8000;

app.use(express.json({ limit: "50mb" })); //receive req.body

app.use(express.static("public_chat"));

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
