import { Graph } from '../../graph';
import { DFA } from '../../automata/dfa';
import { v4 as uuidv4 } from 'uuid';

export function AddSinkstateToDFA(dfa: DFA): void {
    const meanX = dfa.nodes.get().reduce((acc, node) => acc + node.x, 0) / dfa.nodes.get().length;
    const meanY = dfa.nodes.get().reduce((acc, node) => acc + node.y, 0) / dfa.nodes.get().length;

    const sinkstateId = uuidv4();
    const sinkstate = dfa.addNode({
        id: sinkstateId,
        label: 'sink',

        final: false,
        initial: false,

        x: meanX,
        y: meanY + 100,
    });

    const alphabet = dfa.getFormalDefinition().alphabet.split(', ');
    console.log(alphabet);

    for (const node of dfa.nodes.get()) {
        if (node.id === Graph.initialGhostNode.id) continue;
        const transitions = dfa.getTransitionsFromNode(node);
        const missingSymbols = alphabet.filter((symbol) => !transitions.some((t) => t.symbols.includes(symbol)));
        if (missingSymbols.length === 0) continue;
        dfa.addTransition({
            id: uuidv4(),
            label: missingSymbols.join(','),
            from: node.id,
            to: sinkstateId,
            symbols: missingSymbols,
        });
    }
}
