import { DFA } from '../../automata/dfa';
import { NFA } from '../../automata/nfa';

export function DFAtoNFA(dfa: DFA): NFA {
    const nfa = new NFA(dfa.nodes.get(), dfa.transitions.get());

    return nfa;
}
