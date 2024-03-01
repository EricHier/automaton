import { DFA } from '../../automata/dfa';
import { PDA } from '../../automata/pda';

export function PDAtoDFA(a: PDA) {
    const dfa = new DFA(
        a.nodes.get(),
        a.transitions.get().map((t) => {
            return {
                from: t.from,
                to: t.to,
                symbols: t.symbols,
                id: t.id,
                label: t.label,
            };
        })
    );

    return dfa;
}
