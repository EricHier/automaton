import { NFA } from '../../automata/nfa';
import { PDA } from '../../automata/pda';

export function NFAtoPDA(a: NFA) {
    const pda = new PDA(
        a.nodes.get(),
        a.transitions.get().map((t) => {
            return {
                ...t,
                stackOperations: t.symbols.map((s) => {
                    return { symbol: '', operation: 'none' };
                }),
            };
        })
    );

    return pda;
}
