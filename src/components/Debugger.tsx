import { DebuggerCommandName } from "../debugger.js";
import { GhostButton } from "./Button.jsx";
import {
    Pause,
    Play,
    Skip,
    SkipBack,
    StepBack,
    StepInto,
    StepOut,
    StepOver,
} from "./Icons.jsx";

export type DebuggerProps = {
    dispatch: (d: DebuggerCommandName) => void;
    play: boolean;
};
export default function Debugger({ dispatch, play }: DebuggerProps) {
    return (
        <>
            <GhostButton onClick={() => dispatch("skip-back")}>
                <SkipBack />
            </GhostButton>
            <GhostButton onClick={() => dispatch("step-back")}>
                <StepBack />
            </GhostButton>
            {!play ? (
                <GhostButton onClick={() => dispatch("play")}>
                    <Play />
                </GhostButton>
            ) : (
                <GhostButton onClick={() => dispatch("pause")}>
                    <Pause />
                </GhostButton>
            )}
            <GhostButton onClick={() => dispatch("step-over")}>
                <StepOver />
            </GhostButton>
            <GhostButton onClick={() => dispatch("step-in")}>
                <StepInto />
            </GhostButton>
            <GhostButton onClick={() => dispatch("step-out")}>
                <StepOut />
            </GhostButton>
            <GhostButton onClick={() => dispatch("skip")}>
                <Skip />
            </GhostButton>
        </>
    );
}
