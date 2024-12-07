import { test, expect } from "@jest/globals";
import { merge } from "../dist/merge.js";
import { diff, Diff } from "../dist/diff.js";
import { parseFile, toProgram } from "chasm/parser";

test("merge empty", () => {
    const src = ``;
    const result = mergeFromText(src, src, src);
    expect(result.instructions).toEqual([]);
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([]);
});

test("merge same", () => {
    const src = `add r0, r0`;
    const result = mergeFromText(src, src, src);
    expect(result.instructions.length).toBe(1);
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([0]);
});

test("merge one addition", () => {
    const empty = ``;
    const a = `
        add r0, r0
        add r1, r1
        add r2, r2
    `;
    const result = mergeFromText(empty, a, empty);
    expect(result.instructions.length).toBe(3);
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([]);
});

test("merge both add", () => {
    const o = "add r1, r1";
    const a = `add r0, r0 \n add r1, r1`;
    const b = `add r1, r1 \n add r2, r2`;

    const result = mergeFromText(o, a, b);
    expect(result.instructions.length).toBe(3);
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([1]);
});

test("merge same place", () => {
    const o = "add r0, r0";
    const a = `add r0, r0 \n add r1, r1`;
    const b = `add r0, r0 \n add r2, r2`;

    const result = mergeFromText(o, a, b);
    expect(result.instructions.length).toBe(3);
    expect(result.labels.size).toBe(0);
    expect(result.pcMap).toEqual([0]);
});

test("merge labels end", () => {
    const o = "a:";
    const a = "nop \n a:";
    const b = "nop \n a:";

    const result = mergeFromText(o, a, b);
    expect(result.instructions.length).toBe(2);
    expect(result.labels.size).toBe(1);
    expect(result.labels.get("a")).toBe(2);
    expect(result.pcMap).toEqual([]);
});

function mergeFromText(o: string, a: string, b: string): Diff {
    const progO = parseFile(o).map(toProgram).unwrap();
    const progA = parseFile(a).map(toProgram).unwrap();
    const progB = parseFile(b).map(toProgram).unwrap();

    const diffA = diff(progO, progA).unwrap();
    const diffB = diff(progO, progB).unwrap();

    return merge(diffA, diffB);
}
