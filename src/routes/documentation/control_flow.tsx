const Cmp = () => {
    return (
        <>
            <h2>
                <code>cmp rA, value</code>
            </h2>
            <p>
                Subtracts <code>value</code> from <code>rA</code> and updates
                the condition flags, discarding the result.
            </p>
            <p>
                This instruction is often useful in conjunction with{" "}
                <code>bxx</code>, as it allows comparing values without
                modifying any registers.
            </p>
        </>
    );
};

const B = () => {
    return (
        <>
            <h2>
                <code>bxx label</code>
            </h2>
            <p>
                If condition <code>xx</code> is met, jump exectution to{" "}
                <code>label</code>
            </p>
            <p>Possible conditions are as follows:</p>
            <ul>
                <li>
                    <code>al</code> (always) - the default, always branch
                </li>
                <li>
                    <code>eq</code> (equal) - branch if <code>z</code> is set
                </li>
                <li>
                    <code>ne</code> (not equal) - branch if <code>z</code> is
                    unset
                </li>
                <li>
                    <code>gt</code> (signed greater than)
                </li>
                <li>
                    <code>lt</code> (signed less than)
                </li>
                <li>
                    <code>ge</code> (signed greater than or equal to)
                </li>
                <li>
                    <code>le</code> (signed less than or equal to)
                </li>
                <li>
                    <code>hi</code> (unsigned higher than)
                </li>
                <li>
                    <code>lo</code> (unsigned lower than)
                </li>
                <li>
                    <code>hs</code> (unsigned higher-or-same)
                </li>
                <li>
                    <code>ls</code> (unsigned lower-or-same)
                </li>
                <li>
                    <code>pl</code> (plus) - branch if <code>n</code> is unset
                </li>
                <li>
                    <code>mi</code> (minus) - branch if <code>n</code> is set
                </li>
                <li>
                    <code>vs</code> (overflow set) - branch if <code>v</code> is
                    set
                </li>
                <li>
                    <code>vc</code> (overflow clear) - branch if <code>v</code>{" "}
                    is unset
                </li>
            </ul>
            <p>
                Condition codes are named after their effect when combined with{" "}
                <code>cmp</code>. For example, if <code>r0 {">"} r1</code>, then
                after executing <code>cmp r0, r1</code> the instruction{" "}
                <code>bgt greater</code> would branch (whereas{" "}
                <code>ble less_or_equal</code> would not).
            </p>
        </>
    );
};

const Call = () => {
    return (
        <>
            <h2>
                <code>call label</code>
            </h2>
            <p>
                Jump to <code>label</code> and add the current <code>pc</code>{" "}
                to the call stack.
            </p>
            <p>
                The next <code>ret</code> instruction will return to the
                instruction after this <code>call</code>.
            </p>
        </>
    );
};

const Ret = () => {
    return (
        <>
            <h2>
                <code>ret</code>
            </h2>
            <p>
                Pop the top return address from the call stack and jump to it.
            </p>
            <p>
                This instruction will jump to the instruction after the previous{" "}
                <code>call</code> instruction.
            </p>
        </>
    );
};

export default [
    {
        id: "cmp",
        label: "cmp",
        content: <Cmp />,
    },
    {
        id: "b",
        label: "bxx",
        content: <B />,
    },
    {
        id: "call",
        label: "call",
        content: <Call />,
    },
    {
        id: "ret",
        label: "ret",
        content: <Ret />,
    },
];
