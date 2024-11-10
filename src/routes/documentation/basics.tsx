import { styled } from "styled-components";
import {
    Play,
    Reload,
    Skip,
    SkipBack,
    StepBack,
    StepInto,
    StepOut,
    StepOver,
} from "../../components/Icons.jsx";

const Instructions = () => {
    return (
        <>
            <h2>Instructions</h2>
            <p>
                Instructions are the main output of source code. There are a few
                basic categories of instructions:
            </p>
            <ul>
                <li>
                    Memory instructions (<code>ldr</code> and <code>str</code>)
                </li>
                <li>
                    Arithmetic instructions (e.g. <code>add</code> and{" "}
                    <code>xor</code>)
                </li>
                <li>
                    Control flow instructions (<code>cmp</code>, <code>b</code>,{" "}
                    <code>call</code>, and <code>ret</code>)
                </li>
                <li>
                    Misc instructions (<code>mov</code>, <code>hlt</code>, and{" "}
                    <code>nop</code>)
                </li>
            </ul>
            <p>
                A single instruction generally only does one thing. Many things
                that would be accomplished in one statement in most programming
                languages often take several instructions in chasm.
            </p>
            <p>
                The number labeled "PC" in the processor status window and the
                highlighted line in the code indicate which instruction will be
                executed next.
            </p>
        </>
    );
};

const Registers = () => {
    return (
        <>
            <h2>Registers</h2>
            <p>
                Registers are chasm's working variables. There are 8 registers
                in total, labeled <code>r0-r7</code>, and each one is one byte
                large. Most instructions use a register in some capacity or
                another. In particular:
                <ul>
                    <li>All writes to memory go through a register</li>
                    <li>
                        All arithmetic operations use at least one register as
                        an input and store the result in a register
                    </li>
                </ul>
                It's often useful to assign specific meanings to each register
                in each portion of the code.
            </p>
            <p>
                The values of each register are shown in hexadecimal in the
                table on the upper-right side of the processor state window.
            </p>
        </>
    );
};

const Memory = () => {
    return (
        <>
            <h2>Memory</h2>
            <p>
                Memory is a larger, longer-term storage than registers. Each
                byte of memory has an address, and operations on memory take an
                address as input. Memory is essentially an array of bytes, and
                the address is the index to the array. There are 256 bytes of
                memory.
            </p>
            <p>
                The values of each byte of memory are shown in hexadecimal in
                the large table on the left side of the processor state window.
            </p>
        </>
    );
};

const Flags = () => {
    return (
        <>
            <h2>Flags</h2>
            <p>
                Flags indicate the results of the previous arithmetic operation.
                Each flag can either be set (<code>1</code>) or unset (
                <code>0</code>). There are four flags:
            </p>
            <ul>
                <li>
                    <code>z</code> - set if the result equals zero (modulo 256)
                </li>
                <li>
                    <code>c</code> - set if the result was greater than 256
                </li>
                <li>
                    <code>v</code> - set if the operation overflowed
                    (transitioned from positive to negative)
                </li>
                <li>
                    <code>n</code> - set if the result is negative (the high bit
                    is set)
                </li>
            </ul>
            <p>
                Flags are used to decide whether or not conditional branches
                should be taken.
            </p>
            <p>
                Flags are shown in the table on the lower-right side of the
                processor state window.
            </p>
        </>
    );
};

const Operands = () => {
    return (
        <>
            <h2>Operands</h2>
            <p>
                Operands are the inputs to instructions. There are four types of
                operands:
            </p>
            <ul>
                <li>
                    Registers, written <code>rN</code> (e.g. <code>r3</code>)
                </li>
                <li>
                    Values, which are either literal numbers or registers (e.g.{" "}
                    <code>5</code>, <code>-0xf2</code>, <code>r2</code>)
                </li>
                <li>
                    Addresses, which are either literal numbers or registers
                    enclosed with square brackets (e.g. <code>[r5]</code>,{" "}
                    <code>[0x20]</code>, <code>[-1]</code>){" "}
                </li>
                <li>
                    Labels, which are targets for a jump (e.g.{" "}
                    <code>loop_end</code>)
                </li>
            </ul>
            <p>
                Each instruction takes specific types of operands, shown in
                their documentation pages. When register is used as a value or
                an address, the current value of that register (before the
                instruction is executed) is used.
            </p>
        </>
    );
};

const Labels = () => {
    return (
        <>
            <h2>Labels</h2>
            <p>
                Labels are markers that indicate the destination of a jump. For
                example, in this code, the final <code>b</code> instruction will
                move execution back to the <code>add</code> instruction (the
                first instruction after the label):
            </p>
            <code style={{ display: "block", padding: "16px;" }}>
                <pre>{`loop_start:
 add r0, 1
 b loop_start`}</pre>
            </code>
        </>
    );
};

const Icon = styled.span`
    display: inline-block;
    margin: 8px;
`;

const Debugger = () => {
    return (
        <>
            <h2>Debugger</h2>
            <p>
                The debugger precisely controls the execution of code, making it
                easy to figure out what code is doing.
            </p>
            <p>
                To create a breakpoint, click on the line number to the left of
                the line you want to break on. Execution will automatically
                pause when a breakpoint is hit. You can only place a breakpoint
                on an instruction (not a blank line or a label).
            </p>
            <p>
                The buttons at the bottom of the processor status window allow
                you to control execution:
            </p>
            <div>
                <Icon>
                    <SkipBack />
                </Icon>
                This button skips back to the very beginning of execution,
                stopping at any breakpoints along the way.
            </div>
            <div>
                <Icon>
                    <StepBack />
                </Icon>
                This button undoes exactly one instruction of execution.
            </div>
            <div>
                <Icon>
                    <Play />
                </Icon>
                This button starts or stops execution at a constant rate and
                stops when it reaches a breakpoint.
            </div>
            <div>
                <Icon>
                    <StepOver />
                </Icon>
                This button steps forward by one instruction, skipping over
                function calls.
            </div>
            <div>
                <Icon>
                    <StepInto />
                </Icon>
                This button steps forward by one instruction, including into
                function calls (<code>call</code>).
            </div>
            <div>
                <Icon>
                    <StepOut />
                </Icon>
                This button runs until the current function ends, or a
                breakpoint is reached.
            </div>
            <div>
                <Icon>
                    <Skip />
                </Icon>
                This button runs until the processor halts, or a breakpoint is
                reached.
            </div>
            <div>
                <Icon>
                    <Reload />
                </Icon>
                This button resets the processor, allowing you to make changes
                to the code.
            </div>
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
    {
        id: "memory",
        label: "memory",
        content: <Memory />,
    },
    {
        id: "flags",
        label: "flags",
        content: <Flags />,
    },
    {
        id: "operands",
        label: "operands",
        content: <Operands />,
    },
    {
        id: "labels",
        label: "labels",
        content: <Labels />,
    },
    {
        id: "debugger",
        label: "debugger",
        content: <Debugger />,
    },
];
