import { styled } from "styled-components";
import { Processor } from "../components/Processor.jsx";
import { initializeProcessor } from "chasm/processor";
import { useState } from "react";
import Debugger from "../components/Debugger.jsx";
import Editor from "../components/Editor.jsx";

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
`;

const ProcessorWrapper = styled.div`
    flex: 1;
    padding: 24px;

    display: flex;
    flex-direction: column;
    justify-content: center;
`;

export default function Play() {
    const [state, _setState] = useState({
        processor,
        undo: [],
        play: false,
    });

    const epoch = state.undo.length;

    return (
        <FlexRow>
            <PlaySection>
                <Editor />
            </PlaySection>
            <MiddleSection>
                <ProcessorWrapper>
                    <h2>Processor Status</h2>
                    <Processor processor={state.processor} epoch={epoch} />
                    <h3>PC: {state.processor.pc}</h3>
                    <h3>Step: {epoch}</h3>
                </ProcessorWrapper>

                <DebuggerWrapper>
                    <Debugger dispatch={() => {}} play={state.play} />
                </DebuggerWrapper>
            </MiddleSection>
            <PlaySection></PlaySection>
        </FlexRow>
    );
}
