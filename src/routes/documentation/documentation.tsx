import { JSX } from "react";
import basics from "./basics.jsx";
import memory from "./memory.jsx";
import arithmetic from "./arithmetic.jsx";
import controlFlow from "./control_flow.jsx";
import misc from "./misc.jsx";
import examples from "./examples.jsx";

export type Doc = {
    id: string;
    label: string;
    content: JSX.Element | string;
};

function getDocs(
    setCode: (s: string) => void
): [[string, [string, string][]][], Map<string, JSX.Element | string>] {
    const allDocs: [string, Doc[]][] = [
        ["Basics", basics],
        ["Memory", memory],
        ["Arithmetic", arithmetic],
        ["Control Flow", controlFlow],
        ["Misc", misc],
        ["Examples", examples(setCode)],
    ];
    return [
        allDocs.map(([group, docs]) => [
            group,
            docs.map(({ id, label }) => [id, label]),
        ]),
        new Map(
            allDocs
                .flatMap(([_, docs]) => docs)
                .map(({ id, content }) => [id, content])
        ),
    ];
}

export { getDocs };
