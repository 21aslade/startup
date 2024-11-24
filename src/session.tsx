import type { AuthToken } from "linebreak-service";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type Session = {
    auth: AuthToken;
    username: string;
};

const SessionContext = createContext<Session | undefined>(undefined);

type RequireAuthProps = PropsWithChildren<{
    backupRoute: string | undefined;
}>;

export function RequireAuth({ backupRoute, children }: RequireAuthProps) {
    const session = useSession();
    const navigate = useNavigate();
    useEffect(() => {
        if (session === undefined && backupRoute !== undefined) {
            navigate(backupRoute);
            return;
        }
    }, [session, backupRoute]);

    return session ? (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    ) : (
        <></>
    );
}

export function useSession(): Session | undefined {
    return useContext(SessionContext);
}

export const SessionProvider = SessionContext.Provider;
