import {
    createContext,
    JSX,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { styled } from "styled-components";

const SetDocContext = createContext<(doc: string) => void>(() => {
    throw new Error(
        "useSetDoc should only be used under a Documentation element"
    );
});

export function useSetDoc(): (doc: string) => void {
    return useContext(SetDocContext);
}

const DocsWrapper = styled.div`
    padding: 24px;
`;

const DividerBar = styled.div`
    border-bottom: 1px solid var(--border);
    padding-bottom: 24px;
    margin-bottom: 24px;
`;

export type DocumentationProps = PropsWithChildren<{
    docs: Map<string, JSX.Element | string | null>;
    defaultDoc?: string;
}>;

export function DocsViewer({ docs, defaultDoc, children }: DocumentationProps) {
    const [doc, setDoc] = useState<string | undefined>(defaultDoc);
    const docDiv = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (doc !== undefined && docDiv.current) {
            docDiv.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [doc]);

    return (
        <SetDocContext.Provider value={setDoc}>
            <DocsWrapper>
                <DividerBar ref={docDiv}>
                    {doc !== undefined && docs.get(doc)}
                </DividerBar>
                <div>{children}</div>
            </DocsWrapper>
        </SetDocContext.Provider>
    );
}
