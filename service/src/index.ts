import express from "express";
import * as uuid from "uuid";
import {
    AuthToken,
    isAuthToken,
    isUserCredentials,
    Session,
    User,
    UserCredentials,
} from "./user.js";
import { RouteException, routeHandler } from "./handler.js";

const users: Map<string, User> = new Map();
let auth: Map<string, Session> = new Map();

// auth tokens last for one week
const tokenDuration = 7 * 24 * 60 * 60 * 1000;

const app = express();

app.use(express.json());

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.static("public"));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post(
    "/user",
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

        res.end(createSession(req.body.username));
    }, isUserCredentials)
);

apiRouter.delete(
    "/user",
    routeHandler((req, res) => {
        const authToken = req.body.token;
        const { username } = requireAuth(authToken);

        if (!users.has(username)) {
            res.status(404).end();
            return;
        }

        users.delete(username);
        auth = new Map(
            auth
                .entries()
                .filter(([_, session]) => session.username !== username)
        );

        res.status(204).end();
    }, isAuthToken)
);

apiRouter.get("/user/:user", (req, res) => {
    const username = req.params.user;
    const { statistics } = users.get(username);

    res.status(200).end({ username, statistics });
});

apiRouter.post(
    "/session",
    routeHandler((req, res) => {
        const user = users.get(req.body.username);
        if (req.body.password !== user.credentials.password) {
            throw new RouteException(401, "Unauthorized");
        }

        res.end(createSession(req.body.username));
    }, isUserCredentials)
);

apiRouter.delete(
    "/session",
    routeHandler((req, res) => {
        const authToken = req.body.token;
        requireAuth(authToken);

        auth.delete(authToken);
        res.status(204).end();
    }, isAuthToken)
);

app.use((_req, res) => {
    res.sendFile("index.html", { root: "public" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function createSession(username: string): AuthToken {
    const now = Date.now();
    const session: Session = {
        expiresAt: now + tokenDuration,
        username,
    };

    const token = uuid.v4();
    auth.set(token, session);

    return { token };
}

function requireAuth(token: string): Session {
    const session = auth.get(token);
    const now = Date.now();
    if (session === undefined || session.expiresAt < now) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}
