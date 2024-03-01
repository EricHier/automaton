import { DFA } from '../../automata/dfa';
import { NFA } from '../../automata/nfa';

export function NFAtoDFA(nfa: NFA): DFA {
    const dfa = new DFA(nfa.nodes.get(), nfa.transitions.get());

    return dfa;
}
