import { Graph } from '../graph';
import { Automaton, AutomatonInfo, Node, SimulationResult, Simulator, Transition } from '../automata';
import { AutoSimulator } from './auto';

export class DFA extends Automaton {
    public simulator: Simulator;

    public type = 'dfa';

    constructor(nodes: Node[], transitions: Transition[]) {
        super(nodes, transitions);
        this.simulator = new DFASimulator(this);
    }

    checkAutomaton(): AutomatonInfo[] {
        const alphabet = this.getAlphabet();
        const errors: AutomatonInfo[] = [];

        this.resetColors();

        for (const node of this.nodes.get()) {
            if (node.id === Graph.initialGhostNode.id) continue;

            const transitions = this.getTransitionsFromNode(node);

            let errorText = '';
            for (const letter of alphabet) {
                if (!transitions.some((t) => t.symbols.includes(letter))) {
                    errorText += `Missing transition for <b>${letter}</b><br/>`;
                }

                if (transitions.filter((t) => t.symbols.includes(letter)).length > 1) {
                    errorText += `Multiple transitions for <b>${letter}</b><br/>`;
                }

                if (
                    transitions
                        .map((t) => t.symbols)
                        .flat()
                        .filter((s) => s === letter).length > 1
                ) {
                    errorText += `Multiple transitions for <b>${letter}</b><br/>`;
                }
            }

            if (transitions.some((t) => t.symbols.includes(''))) {
                errorText += `Transition with empty symbol<br/>`;
            }

            if (errorText !== '') {
                errors.push({ node, type: 'error', message: errorText });
                this.highlightErrorNode(node.id);
            }
        }

        if (errors.length > 0) {
            return errors;
        }

        return [];
    }

    loadAutomaton(data: { nodes: Node[]; transitions: Transition[] }): void {
        this.nodes.clear();
        this.transitions.clear();

        this.nodes.update(data.nodes);
        this.transitions.update(data.transitions);

        for (const node of this.nodes.get()) {
            if (node.final) this.updateNode(node.id, { final: true });
            if (node.initial) this.updateNode(node.id, { initial: true });
        }

        console.log('Loaded DFA', this.nodes.get(), this.transitions.get());
    }

    saveAutomaton(): string {
        return '';
    }

    public getTransitionLabel(transition: Transition): string {
        if (transition.symbols.length === 1) {
            return transition.symbols[0] === '' ? ' ' : transition.symbols[0];
        }

        return transition.symbols.join(', ');
    }
}

class DFASimulator extends AutoSimulator {
    constructor(automaton: DFA) {
        super(automaton);
        this._currentNode = this._a.getInitialNode();
    }

    protected getPath(): SimulationResult {
        this._errors = this._a.checkAutomaton();
        if (this._errors.length > 0) {
            return { accepted: false, path: {nodes: [], transitions: []}, errors: this._errors };
        }

        const pathNodes: Node[] = [];
        let currentNode = this._a.getInitialNode();
        pathNodes.push(currentNode);

        const pathTransitions: { transition: Transition; symbol: string }[] = [];

        for (const letter of this._word) {
            const transition = this._a.getTransitionsFromNode(currentNode).find((t) => t.symbols.includes(letter));
            if (!transition) {
                return { accepted: false, path: { nodes: pathNodes, transitions: pathTransitions } };
            }
            currentNode = this._a.getNode(transition.to) as Node;
            pathNodes.push(currentNode);
            pathTransitions.push({ transition, symbol: letter });
        }

        return { accepted: currentNode.final, path: { nodes: pathNodes, transitions: pathTransitions } };
    }
}
