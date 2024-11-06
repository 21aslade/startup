import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { gruvboxDarkInit } from "@uiw/codemirror-theme-gruvbox-dark";
import { styled } from "styled-components";

const EditorWrapper = styled.div`
    height: 100%;

    & > div {
        height: 100%;
        max-height: initial;
    }
`;

export default function Editor() {
    const [value, setValue] = useState("");
    // @ts-ignore
    const onChange = useCallback((val, viewUpdate) => {
        setValue(val);
    }, []);
    return (
        <EditorWrapper>
            {/* @ts-expect-error */}
            <CodeMirror
                value={value}
                height="100%"
                theme={gruvboxDarkInit({
                    settings: {
                        background: "#1d2021",
                    },
                })}
                extensions={[]}
                options={{
                    viewportMargin: Infinity,
                }}
                onChange={onChange}
            />
        </EditorWrapper>
    );
}
