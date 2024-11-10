import { Doc } from "./documentation.jsx";

import { PropsWithChildren } from "react";
import { PrimaryButton } from "../../components/Button.jsx";

export type ExampleProps = PropsWithChildren<{
    path: string;
    title: string;
    setCode: (s: string) => void;
}>;
function Example({ path, title, setCode, children }: ExampleProps) {
    const loadExample = async () => {
        const result = await fetch(path);
        if (result.ok) {
            setCode(await result.text());
        }
    };

    return (
        <>
            <h2>{title}</h2>
            {children}
            <PrimaryButton onClick={loadExample}>Load Example</PrimaryButton>
        </>
    );
}

export default function examples(setCode: (s: string) => void): Doc[] {
    return [
        {
            id: "sort",
            label: "insertion sort",
            content: (
                <Example
                    path="/examples/insertion_sort.s"
                    title={"insertion sort"}
                    setCode={setCode}
                >
                    <p>
                        This example contains a function that performs insertion
                        sort in-place on a list of values.
                    </p>
                </Example>
            ),
        },
        {
            id: "mult",
            label: "multiplication",
            content: (
                <Example
                    path="/examples/mult.s"
                    title={"multiplication"}
                    setCode={setCode}
                >
                    <p>
                        This example contains a function that multiplies two
                        registers together. It uses it to multiply values all
                        across memory.
                    </p>
                </Example>
            ),
        },
    ];
}
