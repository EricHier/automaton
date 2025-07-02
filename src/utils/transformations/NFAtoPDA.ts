import { StackOperation } from 'automata';
import { NFA } from '../../automata/nfa';
import { PDA } from '../../automata/pda';

export function NFAtoPDA(a: NFA) {
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
