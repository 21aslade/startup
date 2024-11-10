const Ldr = () => {
    return (
        <>
            <h2>
                <code>ldr rA, [addr]</code>
            </h2>
            <p>
                Loads the value of memory at address <code>addr</code> into{" "}
                <code>rA</code>.
            </p>
        </>
    );
};

const Str = () => {
    return (
        <>
            <h2>
                <code>str [addr], rB</code>
            </h2>
            <p>
                Stores the value of <code>rB</code> into memory at{" "}
                <code>addr</code>.
            </p>
        </>
    );
};

export default [
    {
        id: "ldr",
        label: "ldr",
        content: <Ldr />,
    },
    {
        id: "str",
        label: "str",
        content: <Str />,
    },
];
