import { applyEffect, Effect, invertEffect } from "chasm/effect";
import { Instruction, instructionEffect } from "chasm/instructions";
import { Program } from "chasm/parser";
import { initializeProcessor, Processor } from "chasm/processor";

export type DebuggerCommandName =
    | "step-over"
    | "step-in"
    | "step-out"
    | "step-back"
    | "play"
    | "pause"
    | "skip"
    | "skip-back";

export type DebuggerCommand =
    | { type: DebuggerCommandName }
    | { type: "reload" }
    | { type: "load-code"; program: Program };

export type DebuggerState = {
    processor: Processor;
    undo: Effect[];
    stepLimit: number;
    play: boolean;
};

export function dispatchState(
    [state, program]: [DebuggerState, Program?],
    action: DebuggerCommand
): [DebuggerState, Program?] {
    switch (action.type) {
        case "reload":
            return [
                {
                    processor: initializeProcessor(),
                    undo: [],
                    play: false,
                    stepLimit: state.stepLimit,
                },
                undefined,
            ];
        case "load-code":
            return [state, action.program];
        default:
            if (program !== undefined) {
                return [
                    dispatchProgramStep(action.type, state, program),
                    program,
                ];
            } else {
                return [{ ...state, play: false }, program];
            }
    }
}

function dispatchProgramStep(
    action: DebuggerCommandName,
    state: DebuggerState,
    program: Program
): DebuggerState {
    switch (action) {
        case "step-in":
            return step(state, program);
        case "step-over":
            return stepOver(state, program);
        case "step-out":
            return stepOut(state, program);
        case "step-back":
            return unstep(state);
        case "play":
            return { ...state, play: true };
        case "pause":
            return { ...state, play: false };
        case "skip":
            return skipForward(state, program);
        case "skip-back":
            return skipBack(state);
    }
}

function canMoveForward(state: DebuggerState, program: Program): boolean {
    return (
        !state.processor.halted &&
        state.processor.pc < program.instructions.length &&
        state.undo.length < state.stepLimit
    );
}

function runInstruction(
    state: DebuggerState,
    program: Program,
    instruction: Instruction
): DebuggerState {
    const effect = instructionEffect(
        state.processor,
        program.labels,
        instruction
    );
    const inverse = invertEffect(state.processor, effect);
    const processor = applyEffect(state.processor, effect);
    const undo = [...state.undo, inverse];

    return {
        ...state,
        processor,
        undo,
    };
}

function skipForward(state: DebuggerState, program: Program): DebuggerState {
    while (canMoveForward(state, program)) {
        state = step(state, program);
    }

    return { ...state, play: false };
}

function skipBack(state: DebuggerState): DebuggerState {
    while (state.undo.length > 0) {
        state = unstep(state);
    }

    return { ...state, play: false };
}

function step(state: DebuggerState, program: Program): DebuggerState {
    if (!canMoveForward(state, program)) {
        return { ...state, play: false };
    }
    const instruction = program.instructions[state.processor.pc];
    return runInstruction(state, program, instruction);
}

function stepOut(state: DebuggerState, program: Program): DebuggerState {
    if (!canMoveForward(state, program)) {
        return { ...state, play: false };
    }

    if (state.processor.callStack.length === 0) {
        return step(state, program);
    }

    let instruction;
    do {
        instruction = program.instructions[state.processor.pc];
        if (instruction.op === "call") {
            state = stepOver(state, program);
        } else {
            state = runInstruction(state, program, instruction);
        }
    } while (instruction.op !== "ret" && canMoveForward(state, program));

    return state;
}

function stepOver(state: DebuggerState, program: Program): DebuggerState {
    if (!canMoveForward(state, program)) {
        return { ...state, play: false };
    }

    let instruction = program.instructions[state.processor.pc];
    const resultState = runInstruction(state, program, instruction);
    if (instruction.op !== "call") {
        return resultState;
    }

    return stepOut(resultState, program);
}

function unstep(state: DebuggerState): DebuggerState {
    const effect = state.undo[state.undo.length - 1];
    if (effect === undefined) {
        return state;
    }

    const processor = applyEffect(state.processor, effect);
    return {
        ...state,
        processor,
        undo: state.undo.slice(0, -1),
    };
}
