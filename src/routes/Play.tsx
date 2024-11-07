import { styled } from "styled-components";
import { Processor } from "../components/Processor.jsx";
import { initializeProcessor } from "chasm/processor";
import { useEffect, useReducer, useState } from "react";
import Debugger from "../components/Debugger.jsx";
import Editor from "../components/Editor.jsx";
import { Reload } from "../components/Icons.jsx";
import { GhostButton } from "../components/Button.jsx";
import { DebuggerCommandName, dispatchState } from "../debugger.js";
import { parseFile, toInstructions } from "chasm/parser";

const processor = initializeProcessor();

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

const starterCode = ` mov r0, 2
 str [0], r0
 mov r0, 3
 str [1], r0
 mov r6, 1
loop:
 ldr r0, [r5]
 ldr r1, [r6]
 call mult
 cmp r0, 0
 bne continue
 add r0, r6
continue:
 add r5, 1
 add r6, r5, 1
 str [r6], r0
 cmp r6, 255
 bne loop
 hlt

; mult(a: u8, b: u8) -> u8
mult:
 mov r2, r0
 mov r0, 0
 mov r3, 7
mult_loop:
 lsr r4, r1, r3
 and r4, 1
 beq mult_loop_end
 add r0, r2
mult_loop_end:
 lsl r0, 1
 sub r3, 1
 bpl mult_loop
mult_end:
 ret
`;

const initialState = {
    processor,
    labels: new Map(),
    instructions: [],
    undo: [],
    play: false,
};

export default function Play() {
    const [code, setCode] = useState(starterCode);
    const [state, dispatch] = useReducer(dispatchState, initialState);
    const [running, setRunning] = useState(false);

    const epoch = state.undo.length;

    const reloadCode = () => {
        setRunning(false);
        dispatch({ type: "reload" });
    };

    const dispatchDebugger = (type: DebuggerCommandName) => {
        if (running) {
            console.log("Running step");
            console.log(state.instructions);
            dispatch({ type });
            return;
        }

        switch (type) {
            case "step-back":
            case "pause":
            case "skip-back":
            case "reload":
                return;
        }

        const parsed = parseFile(code);
        if (parsed.isErr()) {
            return; // todo: signal to user
        }

        const lines = parsed.value;
        const [instructions, labels] = toInstructions(lines);

        setRunning(true);
        dispatch({ type: "load-code", labels, instructions });
        dispatch({ type });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (state.play && !state.processor.halted) {
                dispatch({ type: "step-in" });
            }
        }, 20);

        return () => clearInterval(interval);
    }, [state.play]);

    return (
        <FlexRow>
            <PlaySection>
                <Editor value={code} onChange={setCode} readOnly={running} />
            </PlaySection>
            <MiddleSection>
                <ProcessorWrapper>
                    <h2>Processor Status</h2>
                    <Processor processor={state.processor} epoch={epoch} />
                    <h3>PC: {state.processor.pc}</h3>
                    <h3>Step: {epoch}</h3>
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
            <PlaySection></PlaySection>
        </FlexRow>
    );
}
