import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { gruvboxDarkInit } from "@uiw/codemirror-theme-gruvbox-dark";
import { styled } from "styled-components";
import { EditorView } from "@codemirror/view";
import { Diagnostic, linter } from "@codemirror/lint";
import { parseFile } from "chasm/parser";

const EditorWrapper = styled.div`
    height: 100%;

    & > div {
        height: 100%;
        max-height: initial;
    }
`;

function diagnosticSource(view: EditorView): Diagnostic[] {
    const text = view.state.doc.toString();
    const parseResult = parseFile(text);

    if (parseResult.isOk()) {
        return [];
    }

    const error = parseResult.error;

    const remaining = text.substring(error.consumed);
    const match = /^\S*/.exec(remaining)?.[0] ?? "";

    const expected = [...error.expected].map((s) => `"${s}"`).join(", ");

    return [
        {
            from: error.consumed,
            to: error.consumed + match.length,
            severity: "error",
            message: `Parsing failed. Expected: ${expected}`,
        },
    ];
}

const chasmLinter = linter(diagnosticSource);
const extensions = [chasmLinter];

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
                extensions={extensions}
                options={{
                    viewportMargin: Infinity,
                }}
                onChange={onChange}
            />
        </EditorWrapper>
    );
}
