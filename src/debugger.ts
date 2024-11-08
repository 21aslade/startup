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
    | "skip-back"
    | "reload";

export type DebuggerCommand =
    | { type: DebuggerCommandName }
    | ({ type: "load-code" } & Program);

export type DebuggerState = {
    processor: Processor;
    labels: Map<string, number>;
    instructions: Instruction[];
    pcToLine: number[];
    undo: Effect[];
    stepLimit: number;
    play: boolean;
};

export function dispatchState(
    state: DebuggerState,
    action: DebuggerCommand
): DebuggerState {
    switch (action.type) {
        case "step-in":
            return step(state);
        case "step-over":
            return stepOver(state);
        case "step-out":
            return stepOut(state);
        case "step-back":
            return unstep(state);
        case "play":
            return { ...state, play: true };
        case "pause":
            return { ...state, play: false };
        case "skip":
            return skipForward(state);
        case "skip-back":
            return skipBack(state);
        case "reload":
            return {
                processor: initializeProcessor(),
                labels: new Map(),
                instructions: [],
                pcToLine: [],
                undo: [],
                play: false,
                stepLimit: state.stepLimit,
            };
        case "load-code":
            return {
                ...state,
                labels: action.labels,
                instructions: action.instructions,
                pcToLine: action.pcToLine,
            };
    }
}

function canMoveForward(state: DebuggerState): boolean {
    return (
        !state.processor.halted &&
        state.processor.pc < state.instructions.length &&
        state.undo.length < state.stepLimit
    );
}

function runInstruction(
    state: DebuggerState,
    instruction: Instruction
): DebuggerState {
    const effect = instructionEffect(
        state.processor,
        state.labels,
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

function skipForward(state: DebuggerState): DebuggerState {
    while (canMoveForward(state)) {
        state = step(state);
    }

    return { ...state, play: false };
}

function skipBack(state: DebuggerState): DebuggerState {
    while (state.undo.length > 0) {
        state = unstep(state);
    }

    return { ...state, play: false };
}

function step(state: DebuggerState): DebuggerState {
    if (!canMoveForward(state)) {
        return { ...state, play: false };
    }
    const instruction = state.instructions[state.processor.pc];
    return runInstruction(state, instruction);
}

function stepOut(state: DebuggerState): DebuggerState {
    if (!canMoveForward(state)) {
        return { ...state, play: false };
    }

    if (state.processor.callStack.length === 0) {
        return step(state);
    }

    let instruction;
    do {
        instruction = state.instructions[state.processor.pc];
        if (instruction.op === "call") {
            state = stepOver(state);
        } else {
            state = runInstruction(state, instruction);
        }
    } while (instruction.op !== "ret" && canMoveForward(state));

    return state;
}

function stepOver(state: DebuggerState): DebuggerState {
    if (!canMoveForward(state)) {
        return { ...state, play: false };
    }

    let instruction = state.instructions[state.processor.pc];
    const resultState = runInstruction(state, instruction);
    if (instruction.op !== "call") {
        return resultState;
    }

    return stepOut(resultState);
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
