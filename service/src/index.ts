import express from "express";
import { isUserCredentials } from "linebreak-shared/user";
import { routeHandler } from "./handler.js";
import {
    createUser,
    deleteUser,
    friendRequest,
    getProfile,
    getSession,
    login,
    logout,
    unfriend,
} from "./routes.js";
import { initializeDBClient, isDBConfig } from "./database.js";
import * as fs from "node:fs/promises";
import cookieParser from "cookie-parser";
import { addWsListener } from "./ws.js";

const dbConfig = JSON.parse(
    await fs.readFile("dbConfig.json", { encoding: "utf-8" })
);

if (!isDBConfig(dbConfig)) {
    throw new Error(
        "Failed to start service: database credentials are invalid"
    );
}

console.log("[service] initialize db");
const data = await initializeDBClient(dbConfig);
console.log("[service] initialized db");

const app = express();

app.use(express.json());

app.use(cookieParser());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

app.set("trust proxy", true);

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post("/user", (req, res) =>
    routeHandler(
        data,
        req,
        res,
        (d, _c, b, _p) => createUser(d, b),
        isUserCredentials
    )
);

apiRouter.delete("/user/:user", (req, res) =>
    routeHandler(data, req, res, (d, c, _b, p) => deleteUser(d, c, p), isUnk)
);

apiRouter.get("/user/:user", (req, res) =>
    routeHandler(data, req, res, (d, _c, _b, p) => getProfile(d, p), isUnk)
);

apiRouter.put("/user/:user/friend/:other", (req, res) =>
    routeHandler(data, req, res, (d, c, _b, p) => friendRequest(d, c, p), isUnk)
);

apiRouter.delete("/user/:user/friend/:other", (req, res) =>
    routeHandler(data, req, res, (d, c, _b, p) => unfriend(d, c, p), isUnk)
);

apiRouter.get("/session", (req, res) =>
    routeHandler(data, req, res, (d, c, _b, _p) => getSession(d, c), isUnk)
);

apiRouter.post("/session", (req, res) =>
    routeHandler(
        data,
        req,
        res,
        (d, _c, b, _p) => login(d, b),
        isUserCredentials
    )
);

apiRouter.delete("/session", (req, res) =>
    routeHandler(data, req, res, (d, c, _b) => logout(d, c), isUnk)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

addWsListener(server, data);

function isUnk(o: unknown): o is unknown {
    return true;
}
