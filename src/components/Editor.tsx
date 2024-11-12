import {
    MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";
import CodeMirror, {
    ReactCodeMirrorRef,
    StateEffectType,
    ViewUpdate,
    EditorView,
} from "@uiw/react-codemirror";
import { gruvboxDarkInit } from "@uiw/codemirror-theme-gruvbox-dark";
import { styled } from "styled-components";
import { EditorView as LintEditorView } from "@codemirror/view";
import { Diagnostic, linter } from "@codemirror/lint";
import { parseFile } from "chasm/parser";
import {
    activeLine,
    breakpointGutter,
    setActiveLine,
    setLineFilter,
    setSetBreakpoints,
} from "../editor-plugins.js";

const EditorWrapper = styled.div`
    height: 100%;
    min-width: 300px;
    font-size: 1.2em;

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

function diagnosticSource(view: LintEditorView): Diagnostic[] {
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
const extensions = [chasmLinter, activeLine, breakpointGutter];

export type EditorProps = {
    value: string;
    readOnly: boolean;
    activeLine: number | undefined;
    lineToPc: (number | undefined)[] | undefined;
    onChange: (s: string) => void;
    setBreakpoints: (n: number[]) => void;
};

export default function Editor({
    value,
    lineToPc,
    onChange,
    setBreakpoints,
    activeLine,
    readOnly = false,
}: EditorProps) {
    const editorRef = useRef<ReactCodeMirrorRef | undefined>(undefined);

    const updateLine = useEditorProp(editorRef, activeLine, setActiveLine);
    const updateLineToPc = useEditorProp(editorRef, lineToPc, setLineFilter);
    const updateSetBreakpoints = useEditorProp(
        editorRef,
        setBreakpoints,
        setSetBreakpoints
    );

    const onCreateEditor = useCallback(
        (view: EditorView) => {
            updateLine(view);
            updateLineToPc(view);
            updateSetBreakpoints(view);
        },
        [activeLine, lineToPc, setBreakpoints]
    );

    const onEditorChange = useCallback(
        (val: string, _viewUpdate: ViewUpdate) => {
            onChange(val);
        },
        [onChange]
    );

    const textColor = readOnly ? "var(--address)" : "var(--text)";

    const theme = useMemo(() => {
        return gruvboxDarkInit({
            settings: {
                background: "#1d2021",
                foreground: textColor,
            },
        });
    }, [textColor]);

    return (
        <EditorWrapper>
            {/* @ts-expect-error */}
            <CodeMirror
                ref={editorRef}
                readOnly={readOnly}
                value={value}
                height="100%"
                theme={theme}
                extensions={extensions}
                onCreateEditor={onCreateEditor}
                options={{
                    viewportMargin: Infinity,
                }}
                onChange={onEditorChange}
            />
        </EditorWrapper>
    );
}

function useEditorProp<T>(
    editorRef: MutableRefObject<ReactCodeMirrorRef | undefined>,
    value: T,
    effect: StateEffectType<T>
) {
    const updateCodemirror = useCallback(
        (view: EditorView) => {
            view.dispatch({
                effects: effect.of(value),
            });
        },
        [value]
    );

    useEffect(() => {
        if (editorRef.current) {
            const view = editorRef.current.view;
            if (view === undefined) {
                return;
            }

            updateCodemirror(view);
        }
    }, [value]);

    return updateCodemirror;
}
