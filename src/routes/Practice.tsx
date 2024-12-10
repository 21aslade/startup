import { styled } from "styled-components";
import { initializeProcessor } from "chasm/processor";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Editor from "../components/Editor.jsx";
import {
    DebuggerCommandName,
    DebuggerState,
    dispatchState,
} from "../debugger.js";
import { parseFile, Program, toProgram } from "chasm/parser";
import { DocsViewer } from "../components/DocsViewer.jsx";
import { Collapsible } from "../components/Collapsible.jsx";
import { getDocs } from "./documentation/documentation.jsx";
import DocsList from "../components/DocsList.jsx";
import {
    InterpreterSection,
    MiddleSection,
    ProcessorSection,
} from "../components/InterpreterSections.jsx";

const FlexRow = styled.section`
    display: flex;
    flex-direction: row;
    min-width: fit-content;
    height: 100%;
`;

const processor = initializeProcessor();
const initialState: DebuggerState = {
    processor,
    undo: [],
    stepTotal: 0,
    play: false,
    breakpoints: new Set(),
};

function loadProgram(code: string): Program | undefined {
    const parsed = parseFile(code);
    if (parsed.isErr()) {
        return; // todo: signal to user
    }

    const lines = parsed.value;
    return toProgram(lines);
}

export default function Practice() {
    const [code, setCode] = useState("");
    const [[state, program], dispatch] = useReducer(dispatchState, [
        initialState,
        undefined,
    ]);

    const loadCode = () => {
        const newProgram = loadProgram(code);
        if (newProgram === undefined || newProgram.instructions.length <= 0) {
            return;
        }

        dispatch({ type: "load-code", program: newProgram });
    };

    const dispatchDebugger =
        program !== undefined
            ? (type: DebuggerCommandName) => {
                  dispatch({ type });
              }
            : undefined;

    const play = state.play;

    useEffect(() => {
        const interval = setInterval(() => {
            if (play) {
                if (program === undefined) {
                    dispatch({ type: "pause" });
                    return;
                }

                dispatch({ type: "step-in" });
            }
        }, 20);

        return () => clearInterval(interval);
    }, [play, program]);

    const activeLine = program?.pcToLine[state.processor.pc];
    const lineToPc = program?.lineToPc;

    const setBreakpoints = useCallback((breakpoints: number[]) => {
        dispatch({ type: "set-breakpoints", breakpoints });
    }, []);

    const [docsList, docs] = useMemo(() => {
        const set = (code: string) => {
            dispatch({ type: "reload" });
            setCode(code);
        };
        return getDocs(undefined, set);
    }, [setCode, dispatch]);

    return (
        <FlexRow>
            <InterpreterSection>
                <Editor
                    value={code}
                    activeLine={activeLine}
                    onChange={setCode}
                    setBreakpoints={setBreakpoints}
                    readOnly={program !== undefined}
                    lineToPc={lineToPc}
                />
            </InterpreterSection>
            <MiddleSection>
                <ProcessorSection
                    processor={state.processor}
                    play={state.play}
                    step={state.undo.length}
                    stepTotal={state.stepTotal}
                    dispatchDebugger={dispatchDebugger}
                    loadCode={loadCode}
                />
            </MiddleSection>
            <InterpreterSection>
                <DocsViewer docs={docs}>
                    {docsList.map(([label, items]) => {
                        return (
                            <Collapsible key={label} title={label}>
                                <DocsList items={items} />
                            </Collapsible>
                        );
                    })}
                </DocsViewer>
            </InterpreterSection>
        </FlexRow>
    );
}
