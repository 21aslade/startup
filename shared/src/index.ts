import { Program } from "chasm/parser";
import { Result } from "wombo/result";
import { diff, DiffError } from "./diff.js";
import { filter, gaps, iterable } from "./util.js";

export type UserDiffError =
    | DiffError
    | { type: "multiple"; insertions: number[] }
    | { type: "unused-labels"; labels: string[] };

export function validateDiff(
    orig: Program,
    other: Program
): Result<void, UserDiffError> {
    const difference = diff(orig, other);
    if (difference.isErr()) {
        return difference.castOk();
    }

    const result = difference.value;
    if (other.instructions.length - orig.instructions.length > 1) {
        const [_, ...insertions] = iterable(
            gaps(result.pcMap[Symbol.iterator]())
        );
        return Result.err({ type: "multiple", insertions });
    }

    const labels = labelsUsed(other);
    if (labels.isErr()) {
        return Result.err({ type: "unused-labels", labels: labels.error });
    }

    return Result.ok(undefined);
}

function labelsUsed(p: Program): Result<void, string[]> {
    const usedLabels = new Set(
        p.instructions
            .filter((i) => i.op === "call" || i.op === "b")
            .map((i) => i.label)
    );

    const unusedLabels = Array.from(
        iterable(filter(p.labels.keys(), (k) => !usedLabels.has(k)))
    );

    if (unusedLabels.length === 0) {
        return Result.ok(undefined);
    } else {
        return Result.err(unusedLabels);
    }
}
