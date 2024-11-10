import { JSX } from "react";
import basics from "./basics.jsx";
import memory from "./memory.jsx";
import arithmetic from "./arithmetic.jsx";

const allDocs: [string, Doc[]][] = [
    ["Basics", basics],
    ["Memory", memory],
    ["Arithmetic", arithmetic],
];

export type Doc = {
    id: string;
    label: string;
    content: JSX.Element | string;
};

const docsList: [string, [string, string][]][] = allDocs.map(
    ([group, docs]) => [group, docs.map(({ id, label }) => [id, label])]
);

const docs = new Map(
    allDocs.flatMap(([_, docs]) => docs).map(({ id, content }) => [id, content])
);

export { docsList, docs };
