import { test, expect } from "@jest/globals";
import { diff } from "../dist/diff.js";
import { parseFile, toProgram } from "chasm/parser";

test("from empty", () => {
    const a = ``;
    const b = `add r0, r0`;
    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([]);
});

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

test("different instruction", () => {
    const a = `add r1, r1`;
    const b = `add r1, r2`;

    const result = diffFromText(a, b);
    if (result.isOk()) {
        throw new Error("Attempted to unwrapErr Ok value");
    }

    expect(result.error).toEqual({
        type: "deletion",
        pc: 0,
        instruction: {
            op: "add",
            dest: 1,
            a: 1,
            b: { type: "register", reg: 1 },
        },
    });
});

test("reordered instruction", () => {
    const a = `
        add r0, r0
        add r1, r1
        add r2, r2
    `;
    const b = `
        add r1, r1
        add r0, r0
        add r2, r2
    `;

    const result = diffFromText(a, b);
    if (result.isOk()) {
        throw new Error("Attempted to unwrapErr Ok value");
    }

    expect(result.error).toEqual({
        type: "deletion",
        pc: 2,
        instruction: {
            op: "add",
            dest: 1,
            a: 1,
            b: { type: "register", reg: 1 },
        },
    });
});

test("empty label", () => {
    const a = `a:`;
    const b = `a: \n add r0, r0`;
    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([]);
});

test("label same pc", () => {
    const a = `a: \n add r1, r1`;
    const b = `
        a:
        sub r0, r0
        add r1, r1
    `;

    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([1]);
});

test("label same instruction", () => {
    const a = `a: \n add r1, r1`;
    const b = `
        sub r0, r0
        a:
        add r1, r1
    `;

    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(1);
    expect(result.labels.get("a")).toBe(1);
    expect(result.pcMap).toEqual([1]);
});

test("label different pc", () => {
    const a = `a: \n add r1, r1`;
    const b = `
        sub r0, r0
        a:
        add r2, r2
        add r1, r1
    `;

    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(1);
    expect(result.labels.get("a")).toBe(1);
    expect(result.pcMap).toEqual([2]);
});

test("label removed", () => {
    const a = `a: \n add r1, r1`;
    const b = `add r1, r1`;

    const result = diffFromText(a, b);
    if (result.isOk()) {
        throw new Error("Attempted to unwrapErr Ok value");
    }

    expect(result.error).toEqual({ type: "label", label: "a" });
});

test("label added", () => {
    const a = `add r1, r1`;
    const b = `a: \n add r1, r1`;

    const result = diffFromText(a, b).unwrap();
    expect(result.labels.size).toBe(1);
    expect(result.labels.get("a")).toBe(0);
    expect(result.pcMap).toEqual([0]);
});

function diffFromText(a: string, b: string) {
    const progA = parseFile(a).map(toProgram).unwrap();
    const progB = parseFile(b).map(toProgram).unwrap();

    return diff(progA, progB);
}
