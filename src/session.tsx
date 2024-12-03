import type { Session } from "linebreak-service";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";

type SessionContext = Session | null | undefined;
const SessionContext = createContext<SessionContext>(undefined);

type RequireAuthProps = PropsWithChildren<{
    backupRoute: string | undefined;
}>;

export function ProfileRedirect() {
    const navigate = useNavigate();
    const session = useContext(SessionContext);
    useLayoutEffect(() => {
        if (session !== undefined && session !== null) {
            const userURL = encodeURIComponent(session.username);
            navigate(`/profile/${userURL}`);
        } else if (session === null) {
            navigate("/");
        }
    }, [session]);

    return <></>;
}

export function RequireAuth({ backupRoute, children }: RequireAuthProps) {
    const session = useContext(SessionContext);
    const navigate = useNavigate();
    useLayoutEffect(() => {
        if (session === null && backupRoute !== undefined) {
            navigate(backupRoute);
        }
    }, [session, backupRoute]);

    return session ? children : <></>;
}

export function useSession(): Session | undefined {
    return useContext(SessionContext) ?? undefined;
}

export const SessionProvider = SessionContext.Provider;
