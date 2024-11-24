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
    unfriend,
} from "./routes.js";

const app = express();

app.use(express.json());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post("/user", (req, res) =>
    routeHandler(req, res, createUser, isUserCredentials)
);

apiRouter.delete("/user/:user", (req, res) =>
    routeHandler(req, res, deleteUser, isAuthToken)
);

apiRouter.get("/user/:user", (req, res) =>
    routeHandler(
        req,
        res,
        (_, p) => getProfile(p),
        (o) => typeof o === "object"
    )
);

apiRouter.put("/user/:user/friend/:other", (req, res) =>
    routeHandler(req, res, friendRequest, isAuthToken)
);

apiRouter.delete("/user/:user/friend/:other", (req, res) =>
    routeHandler(req, res, unfriend, isAuthToken)
);

apiRouter.post("/session", (req, res) =>
    routeHandler(req, res, login, isUserCredentials)
);

apiRouter.delete("/session", (req, res) =>
    routeHandler(req, res, logout, isAuthToken)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
