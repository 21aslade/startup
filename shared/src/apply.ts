import { Line, Program, toProgram } from "chasm/parser";
import { Diff } from "./diff.js";
import { chain, enumerate, filter, Iter, iterate, map, slice } from "./util.js";

export function apply(lines: Line[], diff: Diff): Iter<Line> {
    const program = toProgram(lines);
    const labelLines = labelToLine(lines);
    const pcLabels = pcToLabel(labelLines, program.labels, diff.labels);

    return modifiedLines(lines, program, diff, pcLabels);
}

function* modifiedLines(
    lines: Line[],
    program: Program,
    diff: Diff,
    pcToLabel: Map<number, Line[]>
): Iter<Line> {
    let pc = 0;
    for (const line of modifiedInstructions(lines, program, diff)) {
        if (line.type === "instruction") {
            yield* pcToLabel.get(pc) ?? [];
            pc++;
        }
        yield line;
    }
}

function* modifiedInstructions(
    lines: Line[],
    program: Program,
    diff: Diff
): Iter<Line> {
    let prevOldLine = -1;
    let prevNewPc = -1;
    for (const [oldPc, newPc] of enumerate(iterate(diff.pcMap))) {
        const oldLine = program.pcToLine[oldPc];
        yield* filter(
            slice(lines, prevOldLine + 1, oldLine),
            (l) => l.type !== "label"
        );

        yield* map(slice(diff.instructions, prevNewPc + 1, newPc), (i) => ({
            type: "instruction",
            instruction: i,
        }));

        yield lines[program.pcToLine[oldPc]];

        prevOldLine = oldLine;
        prevNewPc = newPc;
    }
}

function pcToLabel(
    labelToLine: Map<string, Line>,
    old: Map<string, number>,
    diff: Map<string, number>
): Map<number, Line[]> {
    let result = new Map<number, Line[]>();
    const entries = chain(
        diff.entries(),
        filter(old.entries(), ([k, _]) => !diff.has(k))
    );

    for (let next = entries.next(); !next.done; next = entries.next()) {
        const [label, pc] = next.value;
        const current = result.get(pc) ?? [];
        const line = labelToLine.get(label) ?? { type: "label", label };
        current.push(line);
        result.set(pc, current);
    }

    return result;
}

function labelToLine(lines: Line[]): Map<string, Line> {
    let map = new Map<string, Line>();
    for (const line of lines) {
        if (line.type === "label") {
            map.set(line.label, line);
        }
    }

    return map;
}
