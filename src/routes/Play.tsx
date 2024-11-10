import { styled } from "styled-components";
import { Processor } from "../components/Processor.jsx";
import { initializeProcessor } from "chasm/processor";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Debugger from "../components/Debugger.jsx";
import Editor from "../components/Editor.jsx";
import { Reload } from "../components/Icons.jsx";
import { GhostButton } from "../components/Button.jsx";
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

const FlexRow = styled.section`
    display: flex;
    flex-direction: row;
    min-width: fit-content;
    height: 100%;
`;

const PlaySection = styled.section`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
`;

const MiddleSection = styled(PlaySection)`
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
`;

const DebuggerWrapper = styled.footer`
    flex: 0 56px;
    background-color: var(--bg-zero);
    border-top: 1px solid var(--border);
    padding: 0 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ProcessorWrapper = styled.div`
    flex: 1;
    padding: 24px;

    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const processor = initializeProcessor();
const initialState: DebuggerState = {
    processor,
    undo: [],
    stepLimit: 20000,
    play: false,
    breakpoints: new Set(),
};

function isProgramStarter(type: DebuggerCommandName): boolean {
    switch (type) {
        case "step-back":
        case "pause":
        case "skip-back":
            return false;
        default:
            return true;
    }
}

function loadProgram(code: string): Program | undefined {
    const parsed = parseFile(code);
    if (parsed.isErr()) {
        return; // todo: signal to user
    }

    const lines = parsed.value;
    return toProgram(lines);
}

export default function Play() {
    const [code, setCode] = useState("");
    const [[state, program], dispatch] = useReducer(dispatchState, [
        initialState,
        undefined,
    ]);

    const epoch = state.undo.length;

    const reloadCode = () => dispatch({ type: "reload" });

    const dispatchDebugger = (type: DebuggerCommandName) => {
        if (program === undefined) {
            if (!isProgramStarter(type)) {
                return;
            }

            const newProgram = loadProgram(code);
            if (
                newProgram === undefined ||
                newProgram.instructions.length <= 0
            ) {
                return;
            }

            dispatch({ type: "load-code", program: newProgram });
        }

        dispatch({ type });
    };

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
        return getDocs(set);
    }, [setCode, dispatch]);

    return (
        <FlexRow>
            <PlaySection>
                <Editor
                    value={code}
                    activeLine={activeLine}
                    onChange={setCode}
                    setBreakpoints={setBreakpoints}
                    readOnly={program !== undefined}
                    lineToPc={lineToPc}
                />
            </PlaySection>
            <MiddleSection>
                <ProcessorWrapper>
                    <h2>Processor Status</h2>
                    <Processor processor={state.processor} epoch={epoch} />
                    <h3>PC: {state.processor.pc}</h3>
                    <h3>
                        Step: {epoch} / {state.stepLimit}
                    </h3>
                    <progress max={state.stepLimit} value={epoch} />
                </ProcessorWrapper>
                <DebuggerWrapper>
                    <div>
                        <Debugger
                            dispatch={dispatchDebugger}
                            play={state.play}
                        />
                    </div>
                    <GhostButton onClick={reloadCode}>
                        <Reload />
                    </GhostButton>
                </DebuggerWrapper>
            </MiddleSection>
            <PlaySection>
                <DocsViewer docs={docs}>
                    {docsList.map(([label, items]) => {
                        return (
                            <Collapsible title={label}>
                                <DocsList items={items} />
                            </Collapsible>
                        );
                    })}
                </DocsViewer>
            </PlaySection>
        </FlexRow>
    );
}
