import express from "express";
import { isAuthToken, isUserCredentials } from "./user.js";
import { routeHandler } from "./handler.js";
import {
    createUser,
    deleteUser,
    friendRequest,
    getProfile,
    login,
    logout,
    unfriend,
} from "./routes.js";
import { initializeDBClient, isDBConfig } from "./database.js";
import * as fs from "node:fs/promises";

const dbConfig = JSON.parse(
    await fs.readFile("dbConfig.json", { encoding: "utf-8" })
);
if (!isDBConfig(dbConfig)) {
    throw new Error(
        "Failed to start service: database credentials are invalid"
    );
}

const data = await initializeDBClient(dbConfig);

const app = express();

app.use(express.json());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post("/user", (req, res) =>
    routeHandler(data, req, res, createUser, isUserCredentials)
);

apiRouter.delete("/user/:user", (req, res) =>
    routeHandler(data, req, res, deleteUser, isAuthToken)
);

apiRouter.get("/user/:user", (req, res) =>
    routeHandler(
        data,
        req,
        res,
        (d, _, p) => getProfile(d, p),
        (o) => typeof o === "object"
    )
);

apiRouter.put("/user/:user/friend/:other", (req, res) =>
    routeHandler(data, req, res, friendRequest, isAuthToken)
);

apiRouter.delete("/user/:user/friend/:other", (req, res) =>
    routeHandler(data, req, res, unfriend, isAuthToken)
);

apiRouter.post("/session", (req, res) =>
    routeHandler(data, req, res, login, isUserCredentials)
);

apiRouter.delete("/session", (req, res) =>
    routeHandler(data, req, res, logout, isAuthToken)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
