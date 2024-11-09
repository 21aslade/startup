import {
    Decoration,
    DecorationSet,
    EditorView,
    gutter,
    GutterMarker,
    RangeSet,
    RangeSetBuilder,
    StateEffect,
    StateEffectType,
    StateField,
    Text,
    ViewPlugin,
    ViewUpdate,
} from "@uiw/react-codemirror";

const activeLineDecoration = Decoration.line({
    attributes: {
        class: "cm-debuggerActive cm-activeLine",
    },
});

function activeDecoration(view: EditorView): DecorationSet {
    const activeLine = view.state.field(activeLineField);
    if (activeLine === undefined) {
        return RangeSet.empty;
    }

    const line = view.state.doc.line(activeLine + 1);
    return RangeSet.of([
        {
            from: line.from,
            to: line.from,
            value: activeLineDecoration,
        },
    ]);
}

const showActiveLine = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = activeDecoration(view);
        }

        update(update: ViewUpdate) {
            const stateChanged =
                update.state.field(activeLineField) !==
                update.startState.field(activeLineField);
            if (stateChanged || update.docChanged || update.viewportChanged) {
                this.decorations = activeDecoration(update.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    }
);

const baseTheme = EditorView.baseTheme({
    "& .cm-debuggerActive": { color: "var(--text)" },
});

function simpleField<T>(created: T): [StateField<T>, StateEffectType<T>] {
    const setter = StateEffect.define<T>();
    return [
        StateField.define({
            create() {
                return created;
            },
            update(value, transaction) {
                for (let effect of transaction.effects) {
                    if (effect.is(setter)) {
                        value = effect.value;
                    }
                }
                return value;
            },
        }),
        setter,
    ];
}

const [activeLineField, setActiveLine] = simpleField<number | undefined>(
    undefined
);

const activeLine = [baseTheme, activeLineField, showActiveLine];

const [lineFilterField, setLineFilter] = simpleField<
    (number | undefined)[] | undefined
>(undefined);

const lineFilterLinstener = EditorView.updateListener.of((update) => {
    const filter = update.state.field(lineFilterField);
    if (
        filter !== undefined &&
        filter !== update.startState.field(lineFilterField)
    ) {
        const view = update.view;
        const breakpoints = update.state.field(breakpointField);
        const newBreakpoints = adjustBreakpoints(
            update.state.doc,
            breakpoints,
            filter
        );

        // Dispatch follow-up effect
        view.dispatch({
            effects: replaceBreakpoints.of(newBreakpoints),
        });
    }
});

function rangesToLines(doc: Text, ranges: RangeSet<GutterMarker>): number[] {
    let lines = [];
    const iter = ranges.iter();
    for (; iter.value !== null; iter.next()) {
        lines.push(doc.lineAt(iter.from).number - 1);
    }

    return lines;
}

function linesToRange(doc: Text, lines: number[]): RangeSet<GutterMarker> {
    const builder = new RangeSetBuilder<GutterMarker>();
    for (const lineNumber of lines) {
        const line = doc.line(lineNumber + 1);
        builder.add(line.from, line.from, breakpointMarker);
    }

    return builder.finish();
}

function adjustBreakpoints(
    doc: Text,
    breakpoints: RangeSet<GutterMarker>,
    filter: (number | undefined)[]
): RangeSet<GutterMarker> {
    const lines = rangesToLines(doc, breakpoints);
    let resultLines: number[] = [];
    for (let lineNumber of lines) {
        while (lineNumber < filter.length && filter[lineNumber] === undefined) {
            lineNumber++;
        }

        if (
            lineNumber !== resultLines[resultLines.length - 1] &&
            lineNumber < filter.length
        ) {
            resultLines.push(lineNumber);
        }
    }

    return linesToRange(doc, resultLines);
}

const [setBreakpointsField, setSetBreakpoints] = simpleField<
    (n: number[]) => void
>(() => {});

const setBreakpoint = StateEffect.define<{ pos: number; on: boolean }>({
    map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

const replaceBreakpoints = StateEffect.define<RangeSet<GutterMarker>>();

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
    create() {
        return RangeSet.empty;
    },
    update(set, transaction) {
        set = set.map(transaction.changes);
        for (const effect of transaction.effects) {
            if (effect.is(setBreakpoint)) {
                if (effect.value.on) {
                    set = set.update({
                        add: [breakpointMarker.range(effect.value.pos)],
                    });
                } else {
                    set = set.update({
                        filter: (from) => from != effect.value.pos,
                    });
                }
            } else if (effect.is(replaceBreakpoints)) {
                set = effect.value;
            }
        }
        return set;
    },
});

const updateReactBreakpoints = EditorView.updateListener.of((update) => {
    const breakpoints = update.state.field(breakpointField);
    if (breakpoints !== update.startState.field(breakpointField)) {
        const setBreakpoints = update.state.field(setBreakpointsField);
        setBreakpoints(rangesToLines(update.state.doc, breakpoints));
    }
});

const breakpointMarker = new (class extends GutterMarker {
    toDOM() {
        return document.createTextNode("🔴");
    }
})();

function toggleBreakpoint(view: EditorView, from: number) {
    const breakpoints = view.state.field(breakpointField);
    let hasBreakpoint = false;
    breakpoints.between(from, from, () => {
        hasBreakpoint = true;
    });

    const lineFilter = view.state.field(lineFilterField);
    const line = view.state.doc.lineAt(from).number - 1;
    if (
        !hasBreakpoint &&
        lineFilter !== undefined &&
        lineFilter[line] === undefined
    ) {
        return;
    }

    view.dispatch({
        effects: setBreakpoint.of({ pos: from, on: !hasBreakpoint }),
    });
}

const breakpointGutterExtension = gutter({
    class: "cm-breakpoint-gutter",
    markers: (v) => v.state.field(breakpointField),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
        mousedown(view, line) {
            toggleBreakpoint(view, line.from);
            return true;
        },
    },
});

const breakpointGutterTheme = EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
        color: "red",
        paddingRight: "5px",
        cursor: "default",
    },
});

const breakpointGutter = [
    lineFilterField,
    breakpointField,
    setBreakpointsField,
    lineFilterLinstener,
    updateReactBreakpoints,
    breakpointGutterExtension,
    breakpointGutterTheme,
];

export {
    activeLine,
    breakpointGutter,
    setSetBreakpoints,
    setActiveLine,
    setLineFilter,
};
