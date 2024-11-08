import {
    Decoration,
    DecorationSet,
    EditorView,
    Extension,
    RangeSet,
    StateEffect,
    StateField,
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

export const setActiveLine = StateEffect.define<number | undefined>();

const activeLineField = StateField.define<number | undefined>({
    create() {
        return undefined;
    },
    update(value, transaction) {
        for (let effect of transaction.effects) {
            if (effect.is(setActiveLine)) {
                return effect.value;
            }
        }
        return value;
    },
});

export function activeLine(): Extension {
    return [baseTheme, activeLineField, showActiveLine];
}
