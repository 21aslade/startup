import express from "express";
import * as uuid from "uuid";
import { isAuthToken, isUserCredentials } from "./user.js";
import { RouteException, routeHandler } from "./handler.js";
import {
    createUser,
    deleteUser,
    friendRequest,
    getProfile,
    login,
    logout,
} from "./routes.js";

const app = express();

app.use(express.json());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post("/user", (req, res, next) =>
    routeHandler(req, res, next, createUser, isUserCredentials)
);

apiRouter.delete("/user/:user", (req, res, next) =>
    routeHandler(req, res, next, deleteUser, isAuthToken)
);

apiRouter.get("/user/:user", (req, res, next) =>
    routeHandler(req, res, next, getProfile, (o) => typeof o === "undefined")
);

apiRouter.put("/user/:user/friend/:other", (req, res, next) =>
    routeHandler(req, res, next, friendRequest, isAuthToken)
);

apiRouter.post("/session", (req, res, next) =>
    routeHandler(req, res, next, login, isUserCredentials)
);

apiRouter.delete("/session", (req, res, next) =>
    routeHandler(req, res, next, logout, isAuthToken)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
