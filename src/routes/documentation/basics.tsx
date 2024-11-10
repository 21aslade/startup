const Instructions = () => {
    return (
        <>
            <h2>Instructions</h2>
            <p>Instructions are the basic way to </p>
        </>
    );
};

const Registers = () => {
    return (
        <>
            <h2>Registers</h2>
            <p>
                Registers are chasm's working variables. When you need to store
                some data somewhere, do it in a register.
            </p>
        </>
    );
};

export default [
    {
        id: "instructions",
        label: "instructions",
        content: <Instructions />,
    },
    {
        id: "registers",
        label: "registers",
        content: <Registers />,
    },
];
