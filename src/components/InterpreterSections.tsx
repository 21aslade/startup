import { styled } from "styled-components";
import { Processor as ProcessorDisplay } from "./Processor.jsx";
import Debugger from "./Debugger.jsx";
import { GhostButton } from "./Button.jsx";
import { Play, Reload } from "./Icons.jsx";
import { Processor } from "chasm/processor";
import { DebuggerCommandName } from "../debugger.js";

export const InterpreterSection = styled.section`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
`;

export const MiddleSection = styled(InterpreterSection)`
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

const ProgramProgressWrapper = styled.div<{ $hidden: boolean }>`
    visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
    display: flex;
    flex-direction: column;
`;

const ProgramProgress = styled.progress`
    background-color: var(--bg-code);
    accent-color: #00ff00;
    border-radius: 100dvh;
    height: 0.5em;
    border: 1px solid var(--border);
    width: 90%;
    align-self: center;
`;

export type ProcessorSectionProps = {
    processor: Processor;
    step: number;
    stepTotal: number;
    play: boolean;
    dispatchDebugger?: (c: DebuggerCommandName) => void;
    loadCode: () => void;
};

export function ProcessorSection({
    processor,
    step,
    stepTotal,
    dispatchDebugger,
    loadCode,
    play,
}: ProcessorSectionProps) {
    const loadButton =
        dispatchDebugger === undefined
            ? loadCode
            : () => dispatchDebugger("reload");

    return (
        <>
            <ProcessorWrapper>
                <h2>Processor Status</h2>
                <ProcessorDisplay processor={processor} epoch={step} />
                <h3>PC: {processor.pc}</h3>
                <ProgramProgressWrapper
                    $hidden={dispatchDebugger === undefined}
                >
                    <h3>
                        Step: {step} / {stepTotal}
                    </h3>
                    <ProgramProgress max={stepTotal} value={step} />
                </ProgramProgressWrapper>
            </ProcessorWrapper>
            <DebuggerWrapper>
                <div>
                    {dispatchDebugger !== undefined && (
                        <Debugger dispatch={dispatchDebugger} play={play} />
                    )}
                </div>
                <GhostButton onClick={loadButton}>
                    {dispatchDebugger ? <Reload /> : <Play />}
                </GhostButton>
            </DebuggerWrapper>
        </>
    );
}
