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

function getNextDiagnostic(
    text: string,
    offset: number
): [string, Diagnostic] | undefined {
    const parseResult = parseFile(text);

    if (parseResult.isOk()) {
        return undefined;
    }

    const error = parseResult.error;

    const remaining = text.substring(error.consumed);
    const match = /^\S*/.exec(remaining)?.[0] ?? "";

    const currentLine = /^[^\n]*(\n|$)|/.exec(remaining)?.[0].length ?? 0;
    const remainingLines = remaining.substring(currentLine);

    const expected = [...error.expected].map((s) => `"${s}"`).join(", ");

    return [
        remainingLines,
        {
            from: error.consumed + offset,
            to: error.consumed + match.length + offset,
            severity: "error",
            message: `Parsing failed. Expected: ${expected}`,
        },
    ];
}

function diagnosticSource(view: EditorView): Diagnostic[] {
    const initialText = view.state.doc.toString();
    let text = initialText;
    let diagnostics: Diagnostic[] = [];
    do {
        const next = getNextDiagnostic(text, initialText.length - text.length);
        if (next !== undefined) {
            const [remaining, diagnostic] = next;
            text = remaining;
            diagnostics.push(diagnostic);
        } else {
            text = "";
        }
    } while (text.length > 0);

    return diagnostics;
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
