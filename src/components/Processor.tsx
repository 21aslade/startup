import { styled } from "styled-components";
import type { Flags, Processor } from "chasm/processor";

const ProcessorTable = styled.table`
    font-family: "Courier New", Courier, monospace;
    background-color: var(--bg-code);
    padding: 4px;
    margin: 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
`;

const Header = styled.td`
    font-weight: bold;
    color: var(--address);
`;

const memoryWidth = 16;

function toHexString(n: number, padding: number = 2): string {
    return n.toString(16).padStart(padding, "0");
}

const ProcessorWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
`;

const RegsFlags = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export type ProcessorProps = { processor: Processor; epoch: number };
export function Processor({ processor, epoch }: ProcessorProps) {
    return (
        <ProcessorWrapper>
            <Memory memory={processor.memory} _epoch={epoch} />
            <RegsFlags>
                <Registers registers={processor.registers} _epoch={epoch} />
                <Flags flags={processor.flags} _epoch={epoch} />
            </RegsFlags>
        </ProcessorWrapper>
    );
}

type MemoryProps = { memory: Uint8Array; _epoch: number };
function Memory({ memory }: MemoryProps) {
    const height = Math.ceil(memory.length / memoryWidth);

    const headers = range(memoryWidth)
        .map((i) => i.toString(16))
        .map((s) => <Header>&nbsp;{s}</Header>);

    const values = range(height).map((h) =>
        range(memoryWidth)
            .map((w) => memory[h * memoryWidth + w])
            .map((val, i) => <td key={i}>{toHexString(val)}</td>)
    );

    const rows = values.map((r, i) => (
        <tr key={i}>
            <Header>{toHexString(i << 4)}</Header>
            {[...r]}
        </tr>
    ));

    return (
        <ProcessorTable>
            <tbody>
                <tr>
                    <td></td>
                    {[...headers]}
                </tr>
                {[...rows]}
            </tbody>
        </ProcessorTable>
    );
}

type RegisterProps = { registers: Uint8Array; _epoch: number };
function Registers({ registers }: RegisterProps) {
    const rows = range(registers.length).map((i) => (
        <tr>
            <td>r{i}</td>
            <td>{toHexString(registers[i])}</td>
        </tr>
    ));

    return (
        <ProcessorTable>
            <tbody>{[...rows]}</tbody>
        </ProcessorTable>
    );
}

type FlagsProps = { flags: Flags; _epoch: number };
function Flags({ flags }: FlagsProps) {
    return (
        <ProcessorTable>
            <tbody>
                <tr>
                    <Header>z</Header>
                    <td>{+flags.zero}</td>
                </tr>
                <tr>
                    <Header>c</Header>
                    <td>{+flags.carry}</td>
                </tr>
                <tr>
                    <Header>v</Header>
                    <td>{+flags.overflow}</td>
                </tr>
                <tr>
                    <Header>n</Header>
                    <td>{+flags.negative}</td>
                </tr>
            </tbody>
        </ProcessorTable>
    );
}

function* range(n: number) {
    let i = 0;
    while (i < n) {
        yield i;
        i++;
    }
}
