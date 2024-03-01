import { NFA } from '../../automata/nfa';
import { PDA } from '../../automata/pda';

export function PDAtoNFA(a: PDA) {
    const nfa = new NFA(
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

    return nfa;
}
