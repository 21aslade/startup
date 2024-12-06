import { test, expect } from "@jest/globals";
import { diff } from "../dist/diff.js";
import { parseFile, toProgram } from "chasm/parser";

test("identical", () => {
    const a = `add r0, r0`;
    const result = diffFromText(a, a).unwrap();
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([0]);
});

test("additions", () => {
    const a = `add r1, r1`;
    const b = `
        sub r0, r0
        add r1, r1
        sub r2, r2
    `;

    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([1]);
});

function diffFromText(a: string, b: string) {
    const progA = parseFile(a).map(toProgram).unwrap();
    const progB = parseFile(b).map(toProgram).unwrap();

    return diff(progA, progB);
}
