import type { Session } from "linebreak-service";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";

type SessionContext = {
    session: Session | undefined;
    logout(): Promise<void>;
};

const SessionContext = createContext<SessionContext>({
    session: undefined,
    logout: async () => {},
});

type RequireAuthProps = PropsWithChildren<{
    backupRoute: string | undefined;
}>;

export function RequireAuth({ backupRoute, children }: RequireAuthProps) {
    const { session, logout } = useContext(SessionContext);
    const navigate = useNavigate();
    useLayoutEffect(() => {
        const now = Date.now();
        const expired = session !== undefined && now > session?.expireAt;
        if (expired) {
            logout();
            return;
        }

        if (session === undefined && backupRoute !== undefined) {
            navigate(backupRoute);
            return;
        }
    }, [session, backupRoute]);

    return session ? children : <></>;
}

export function useSession(): Session | undefined {
    return useContext(SessionContext).session;
}

export const SessionProvider = SessionContext.Provider;
