type ArithmeticProps = {
    name: string;
    description: string;
};

const Footer = () => {
    return (
        <p>
            As with all arithmetic operations, if <code>rDest</code> is not
            specified, the result is stored in <code>rA</code>.
        </p>
    );
};

const Arithmetic = ({ name, description }: ArithmeticProps) => {
    return (
        <>
            <h2>
                <code>{name} rDest, rA, value</code>
            </h2>
            <p>
                Sets <code>rDest</code> to the {description} of <code>rA</code>{" "}
                and <code>value</code>; also updates the flags based on the
                results of the operation.
            </p>
            <Footer />
        </>
    );
};

const Shift = ({ name, description }: ArithmeticProps) => {
    return (
        <>
            <h2>
                <code>{name} rDest, rA, value</code>
            </h2>
            <p>
                Sets <code>rDest</code> to <code>rA</code> {description} by{" "}
                <code>value</code>; also updates the flags based on the results
                of the operation.
            </p>
            <Footer />
        </>
    );
};

const arithmetic = [
    { name: "add", description: "sum" },
    { name: "sub", description: "difference" },
    { name: "and", description: "bitwise and" },
    { name: "or", description: "bitwise or" },
    { name: "xor", description: "bitwise xor" },
].map(({ name, description }) => ({
    id: name,
    label: name,
    content: <Arithmetic name={name} description={description} />,
}));

const shift = [
    { name: "lsl", description: "shifted left" },
    { name: "lsr", description: "logically shifted right" },
    { name: "asr", description: "shifted right (preserving sign)" },
    { name: "rol", description: "rotated left" },
    { name: "ror", description: "roated right" },
].map(({ name, description }) => ({
    id: name,
    label: name,
    content: <Shift name={name} description={description} />,
}));

export default [...arithmetic, ...shift];
