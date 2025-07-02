import { StackOperation } from 'automata';
import { DFA } from '../../automata/dfa';
import { PDA } from '../../automata/pda';

export function DFAtoPDA(a: DFA) {
    const pda = new PDA(
        a.nodes.get(),
        a.transitions.get().map((t) => {
            return {
                ...t,
                stackOperations: t.symbols.map(() => {
                    return { symbol: '', operation: 'none', condition: '' } as StackOperation;
                }),
            };
        })
    );

    return pda;
}
