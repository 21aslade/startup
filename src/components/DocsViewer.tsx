import {
    createContext,
    JSX,
    PropsWithChildren,
    useContext,
    useRef,
    useState,
} from "react";
import { styled } from "styled-components";

const DocContext = createContext<[string | undefined, (doc: string) => void]>([
    undefined,
    () => {
        throw new Error(
            "useSetDoc should only be used under a Documentation element"
        );
    },
]);

export function useDoc(): [string | undefined, (doc: string) => void] {
    return useContext(DocContext);
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

    return (
        <DocContext.Provider value={[doc, setDoc]}>
            <DocsWrapper>
                <DividerBar ref={docDiv}>
                    {doc !== undefined && docs.get(doc)}
                </DividerBar>
                <div>{children}</div>
            </DocsWrapper>
        </DocContext.Provider>
    );
}
