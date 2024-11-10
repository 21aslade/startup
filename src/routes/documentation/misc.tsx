const Mov = () => {
    return (
        <>
            <h2>
                <code>mov rA, value</code>
            </h2>
            <p>
                Moves <code>value</code> into <code>rA</code>. Does not update
                condition flags.
            </p>
        </>
    );
};

const Hlt = () => {
    return (
        <>
            <h2>
                <code>hlt</code>
            </h2>
            <p>Halts the processor when executed, ending the program.</p>
        </>
    );
};

const Nop = () => {
    return (
        <>
            <h2>
                <code>nop</code>
            </h2>
            <p>Does nothing when executed.</p>
        </>
    );
};

export default [
    {
        id: "mov",
        label: "mov",
        content: <Mov />,
    },
    {
        id: "hlt",
        label: "hlt",
        content: <Hlt />,
    },
    {
        id: "nop",
        label: "nop",
        content: <Nop />,
    },
];
