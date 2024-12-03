import type { Session } from "linebreak-service";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";

const SessionContext = createContext<Session | undefined>(undefined);

type RequireAuthProps = PropsWithChildren<{
    backupRoute: string | undefined;
}>;

export function RequireAuth({ backupRoute, children }: RequireAuthProps) {
    const session = useSession();
    const navigate = useNavigate();
    useLayoutEffect(() => {
        const now = Date.now();
        const redirect = session === undefined || now > session.expireAt;
        if (redirect && backupRoute !== undefined) {
            navigate(backupRoute);
            return;
        }
    }, [session, backupRoute]);

    return session ? children : <></>;
}

export function useSession(): Session | undefined {
    return useContext(SessionContext);
}

export const SessionProvider = SessionContext.Provider;
