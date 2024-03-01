import { DFA } from '../../automata/dfa';
import { PDA } from '../../automata/pda';

export function DFAtoPDA(a: DFA) {
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
