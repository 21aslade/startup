import { Program } from "chasm/parser";
import { Result } from "wombo/result";
import isEqual from "lodash.isequal";
import { Instruction } from "chasm/instructions";
import { enumerate, filter, Iter, iterable } from "./util.js";

export type Diff = {
    pcMap: number[];
    labels: Map<string, number>;
};

export type DiffError =
    | { type: "deletion"; pc: number; instruction: Instruction }
    | { type: "label"; label: string };

export function diff(
    original: Program,
    modified: Program
): Result<Diff, DiffError> {
    const instructions = diffInstructions(
        original.instructions,
        modified.instructions
    );

    if (instructions.isErr()) {
        const [pc, instruction] = instructions.error;
        return Result.err({ type: "deletion", pc, instruction });
    }

    const pcMap = instructions.value;

    const labelCheck = checkLabels(original.labels, modified.labels, pcMap);
    if (labelCheck.isErr()) {
        return Result.err({ type: "label", label: labelCheck.error });
    }

    const labelIter = newLabels(original.labels, modified.labels);
    const labels = new Map(iterable(labelIter));

    return Result.ok({
        pcMap,
        labels,
    });
}

function checkLabels(
    original: Map<string, number>,
    modified: Map<string, number>,
    pcMap: number[]
): Result<void, string> {
    for (const [label, pc] of original) {
        const newPc = modified.get(label);
        if (newPc === undefined) {
            return Result.err(label);
        }

        // new pc must not move to the previous instruction or the next instruction
        // however, it can move to new instructions in between those two
        if ((pc > 0 && newPc <= pcMap[pc - 1]) || newPc > pcMap[pc]) {
            return Result.err(label);
        }
    }

    return Result.ok(undefined);
}

function newLabels(
    original: Map<string, number>,
    modified: Map<string, number>
): Iter<[string, number]> {
    return filter(modified.entries(), ([l, p]) => original.get(l) !== p);
}

function diffInstructions(
    original: Instruction[],
    modified: Instruction[]
): Result<number[], [number, Instruction]> {
    let pcMap: number[] = [];

    const origIter = original[Symbol.iterator]();
    const modIter = enumerate(modified[Symbol.iterator]());

    let origNext = origIter.next();
    while (true) {
        const modNext = modIter.next();
        if (origNext.done && modNext.done) {
            break;
        }

        if (modNext.done) {
            const instruction = origNext.value!!;
            const pc = pcMap.length > 0 ? pcMap[pcMap.length - 1] + 1 : 0;
            return Result.err([pc, instruction]);
        }

        if (isEqual(origNext.value, modNext.value[1])) {
            pcMap.push(modNext.value[0]);
            origNext = origIter.next();
        }
    }

    return Result.ok(pcMap);
}
