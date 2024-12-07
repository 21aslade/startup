import { Diff } from "./diff.js";
import {
    chain,
    filter,
    Iter,
    iterate,
    map,
    range,
    scan,
    slice,
    zip,
} from "./util.js";
import { Instruction } from "chasm/instructions";

export type Merge = {
    instructionMerge: InstructionMerge;
    origDiff: Diff;
};

export function merge(a: Diff, b: Diff): Merge {
    const instructionMerge = mergeFromIter(mergeInstructions(a, b));
    const labels = new Map(mergeLabels(instructionMerge, a, b));

    return {
        instructionMerge,
        origDiff: {
            pcMap: instructionMerge.origPcMap,
            instructions: instructionMerge.instructions,
            labels,
        },
    };
}

type InstructionMerge = {
    instructions: Instruction[];
    aPcMap: number[];
    bPcMap: number[];
    origPcMap: number[];
};

function mergeLabels(
    instructions: InstructionMerge,
    a: Diff,
    b: Diff
): Iter<[string, number]> {
    const labels = chain(
        a.labels.keys(),
        filter(b.labels.keys(), (b) => !a.labels.has(b))
    );

    return map(labels, (l) => {
        const aPc = a.labels.get(l);
        const bPc = b.labels.get(l);

        const progMax = instructions.instructions.length;
        const [aMin, aMax] = labelRange(aPc, instructions.aPcMap, progMax);
        const [bMin, bMax] = labelRange(bPc, instructions.bPcMap, progMax);
        const max = Math.min(aMax, bMax);
        const min = Math.max(aMin, bMin);

        return [l, randRange(min, max + 1)];
    });
}

function labelRange(
    pc: number | undefined,
    pcMap: number[],
    len: number
): [number, number] {
    if (pc === undefined) {
        return [0, len];
    }
    const max = pcMap[pc] ?? len;
    const min = pc > 0 ? pcMap[pc - 1] + 1 : 0;
    return [min, max];
}

function randRange(min: number, max: number) {
    if (min > max) {
        return Math.random() > 0.5 ? min : max;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

function* mergeInstructions(a: Diff, b: Diff): Iter<[Source, Instruction]> {
    const aWindows = windows(iterate(a.pcMap));
    const bWindows = windows(iterate(b.pcMap));

    const pcMaps = zip(aWindows, bWindows);

    for (const [[aPrev, aPc], [bPrev, bPc]] of pcMaps) {
        const aGap = slice(a.instructions, aPrev + 1, aPc);
        const bGap = slice(b.instructions, bPrev + 1, bPc);

        yield* randomMerge(aGap, bGap);

        // a and b should have the same instruction at the same point
        yield ["orig", a.instructions[aPc]];
    }

    const lastA = a.pcMap[a.pcMap.length - 1] ?? -1;
    const aRemaining = slice(a.instructions, lastA + 1, a.instructions.length);
    const lastB = b.pcMap[b.pcMap.length - 1] ?? -1;
    const bRemaining = slice(b.instructions, lastB + 1, b.instructions.length);

    yield* randomMerge(aRemaining, bRemaining);
}

type Source = "a" | "b" | "orig";

function mergeFromIter(i: Iter<[Source, Instruction]>): InstructionMerge {
    let merge: InstructionMerge = {
        instructions: [],
        aPcMap: [],
        bPcMap: [],
        origPcMap: [],
    };

    for (const [source, instruction] of i) {
        addInstruction(merge, instruction, source);
    }

    return merge;
}

function addInstruction(
    merge: InstructionMerge,
    instruction: Instruction,
    source: Source
) {
    const pc = merge.instructions.length;
    switch (source) {
        case "a":
            merge.aPcMap.push(pc);
            break;
        case "b":
            merge.bPcMap.push(pc);
            break;
        case "orig":
            merge.origPcMap.push(pc);
            merge.aPcMap.push(pc);
            merge.bPcMap.push(pc);
    }
    merge.instructions.push(instruction);
}

function* randomMerge(
    a: Iter<Instruction>,
    b: Iter<Instruction>
): Iter<[Source, Instruction]> {
    let aNext = a.next();
    let bNext = b.next();
    while (!aNext.done && !bNext.done) {
        if (Math.random() > 0.5) {
            yield ["a", aNext.value];
            aNext = a.next();
        } else {
            yield ["b", bNext.value];
            bNext = b.next();
        }
    }

    if (!aNext.done) {
        yield ["a", aNext.value];
        yield* map(a, (a) => ["a", a]);
    } else if (!bNext.done) {
        yield ["b", bNext.value];
        yield* map(b, (b) => ["b", b]);
    }
}

function windows(i: Iter<number>): Iter<[number, number]> {
    return scan(i, (prev, current) => [current, [prev, current]], -1);
}
