import {
    applyEffect,
    applyEffectCoW,
    Effect,
    invertEffect,
} from "chasm/effect";
import { Instruction, instructionEffect } from "chasm/instructions";
import { Program } from "chasm/parser";
import {
    cloneProcessor,
    initializeProcessor,
    Processor,
} from "chasm/processor";

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
    | { type: "set-breakpoints"; breakpoints: number[] }
    | { type: "load-code"; program: Program };

const stepLimit = 20000;

export type DebuggerState = {
    processor: Processor;
    undo: Effect[];
    stepTotal: number;
    play: boolean;
    breakpoints: Set<number>;
};

export function dispatchState(
    [state, program]: [DebuggerState, Program?],
    action: DebuggerCommand
): [DebuggerState, Program?] {
    switch (action.type) {
        case "reload":
            return [
                {
                    processor: state.processor,
                    undo: [],
                    play: false,
                    stepTotal: 0,
                    breakpoints: new Set(),
                },
                undefined,
            ];
        case "set-breakpoints":
            if (program !== undefined) {
                const breakpoints = new Set(
                    action.breakpoints
                        .map((l) => program.lineToPc[l])
                        .filter((l) => l !== undefined)
                );
                return [{ ...state, breakpoints }, program];
            } else {
                return [state, program];
            }
        case "load-code": {
            const stepTotal = countSteps(action.program);
            const processor = initializeProcessor();
            return [{ ...state, processor, stepTotal }, action.program];
        }
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
    let result;
    switch (action) {
        case "reload":
            return state;
        case "step-in":
            result = step(state, program);
            break;
        case "step-over":
            result = applyToClone(stepOver, state, program);
            break;
        case "step-out":
            result = applyToClone(stepOut, state, program);
            break;
        case "step-back":
            result = unstep(state);
            break;
        case "play":
            return { ...state, play: true };
        case "pause":
            return { ...state, play: false };
        case "skip":
            result = skipForward(state, program);
            break;
        case "skip-back":
            result = skipBack(state);
            break;
    }

    if (
        result.breakpoints.has(result.processor.pc) ||
        !canMoveForward(program, state.processor, state.undo)
    ) {
        return { ...result, play: false };
    } else {
        return result;
    }
}

function applyToClone(
    f: (
        program: Program,
        processor: Processor,
        undo: Effect[],
        breakpoints: Set<number>
    ) => void,
    state: DebuggerState,
    program: Program
): DebuggerState {
    const processor = cloneProcessor(state.processor);
    const undo = [...state.undo];
    const breakpoints = state.breakpoints;

    f(program, processor, undo, breakpoints);

    return { ...state, processor, undo };
}

function countSteps(program: Program): number {
    let stepCount = 0;

    const effects: Effect[] = [];
    const processor = initializeProcessor();
    const labels = program.labels;

    while (
        canMoveForward(program, processor, effects) &&
        stepCount < stepLimit
    ) {
        const instruction = program.instructions[processor.pc];
        const effect = instructionEffect(processor, labels, instruction);
        applyEffect(processor, effect);
        stepCount++;
    }

    return stepCount;
}

function canMoveForward(
    program: Program,
    processor: Processor,
    undo: Effect[]
): boolean {
    return (
        !processor.halted &&
        processor.pc < program.instructions.length &&
        undo.length < stepLimit
    );
}

function runInPlace(
    processor: Processor,
    undo: Effect[],
    labels: Map<string, number>,
    instruction: Instruction
) {
    const effect = instructionEffect(processor, labels, instruction);
    const inverse = invertEffect(processor, effect);
    applyEffect(processor, effect);
    undo.push(inverse);
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
    const processor = applyEffectCoW(state.processor, effect);
    const undo = [...state.undo, inverse];

    return {
        ...state,
        processor,
        undo,
    };
}

function skipForward(state: DebuggerState, program: Program): DebuggerState {
    const processor = cloneProcessor(state.processor);
    const undo = [...state.undo];
    const labels = program.labels;

    let run = false;
    while (
        canMoveForward(program, processor, undo) &&
        (!run || !state.breakpoints.has(processor.pc))
    ) {
        const instruction = program.instructions[processor.pc];
        runInPlace(processor, undo, labels, instruction);
        run = true;
    }

    return { ...state, processor, undo, play: false };
}

function skipBack(state: DebuggerState): DebuggerState {
    const processor = cloneProcessor(state.processor);
    const undo = [...state.undo];

    let run = false;
    while (undo.length > 0 && (!run || !state.breakpoints.has(processor.pc))) {
        unstepInPlace(processor, undo);
        run = true;
    }

    return { ...state, processor, undo, play: false };
}

function step(state: DebuggerState, program: Program): DebuggerState {
    if (!canMoveForward(program, state.processor, state.undo)) {
        return { ...state, play: false };
    }
    const instruction = program.instructions[state.processor.pc];
    return runInstruction(state, program, instruction);
}

function stepOut(
    program: Program,
    processor: Processor,
    undo: Effect[],
    breakpoints: Set<number>
) {
    if (!canMoveForward(program, processor, undo)) {
        return;
    }

    const labels = program.labels;

    if (processor.callStack.length === 0) {
        const instruction = program.instructions[processor.pc];
        runInPlace(processor, undo, labels, instruction);
        return;
    }

    let instruction;
    do {
        instruction = program.instructions[processor.pc];
        if (instruction.op === "call") {
            stepOver(program, processor, undo, breakpoints);
        } else {
            runInPlace(processor, undo, labels, instruction);
        }
    } while (
        instruction.op !== "ret" &&
        canMoveForward(program, processor, undo) &&
        !breakpoints.has(processor.pc)
    );
}

function stepOver(
    program: Program,
    processor: Processor,
    undo: Effect[],
    breakpoints: Set<number>
) {
    if (!canMoveForward(program, processor, undo)) {
        return;
    }

    const instruction = program.instructions[processor.pc];
    runInPlace(processor, undo, program.labels, instruction);
    if (instruction.op !== "call" || breakpoints.has(processor.pc)) {
        return;
    }

    stepOut(program, processor, undo, breakpoints);
}

function unstep(state: DebuggerState): DebuggerState {
    const effect = state.undo[state.undo.length - 1];
    if (effect === undefined) {
        return state;
    }

    const processor = applyEffectCoW(state.processor, effect);
    return {
        ...state,
        processor,
        undo: state.undo.slice(0, -1),
    };
}

function unstepInPlace(processor: Processor, undo: Effect[]) {
    applyEffect(processor, undo.pop() ?? {});
}
