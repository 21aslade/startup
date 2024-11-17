import express from "express";
import * as uuid from "uuid";
import {
    isAuthToken,
    isUserCredentials,
    Session,
    User,
    UserCredentials,
} from "./user.js";
import { RouteException, routeHandler } from "./handler.js";

const users: Map<string, User> = new Map();
const auth: Map<string, Session> = new Map();

// auth tokens last for one week
const tokenDuration = 7 * 24 * 60 * 60 * 1000;

const app = express();

app.use(express.json());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post(
    "/user/:username",
    routeHandler((req, res) => {
        if (users.get(req.body.username) !== undefined) {
            res.status(409).send({ msg: "Username already taken" });
            return;
        }

        const user: User = {
            credentials: req.body,
            statistics: { wins: 0, plays: 0 },
            friendRequests: [],
            friends: [],
        };
        users.set(req.body.username, user);

        const now = Date.now();
        const session: Session = {
            expiresAt: now + tokenDuration,
            username: req.body.username,
        };

        const token = uuid.v4();
        auth.set(token, session);

        res.send({ token });
    }, isUserCredentials)
);

apiRouter.delete(
    "/user",
    routeHandler((req, res) => {
        const authToken = req.body.token;
        const session = auth.get(authToken);
        const now = Date.now();
        if (session === undefined || session.expiresAt < now) {
            throw new RouteException(401, "Unauthorized");
        }

        users.delete(session.username);

        res.status(204).end();
    }, isAuthToken)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
