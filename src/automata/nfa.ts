import { Automaton, AutomatonInfo, Node, Simulator, Transition } from '../automata';
import { DataSet } from 'vis-data';

export class NFA extends Automaton {
    public simulator: Simulator;

    public type = 'nfa';

    constructor(nodes: Node[], transitions: Transition[]) {
        super(nodes, transitions);
        this.simulator = new NFASimulator(this);
    }
    public checkAutomaton(): AutomatonInfo[] {
        return [];
    }
    public loadAutomaton(data: { nodes: Node[]; transitions: Transition[] }): void {
        this.nodes.clear();
        this.transitions.clear();

        this.nodes.update(data.nodes);
        this.transitions.update(data.transitions);

        for (const node of this.nodes.get()) {
            if (node.final) this.updateNode(node.id, { final: true });
            if (node.initial) this.updateNode(node.id, { initial: true });
        }

        console.log('Loaded NFA', this.nodes.get(), this.transitions.get());
    }
    public saveAutomaton(): string {
        throw new Error('Method not implemented.');
    }

    public getTransitionLabel(transition: Transition): string {
        if (transition.symbols.length === 1) {
            return transition.symbols[0] === '' ? 'ε' : transition.symbols[0];
        }

        return transition.symbols.join(', ');
    }
}

class NFASimulator extends Simulator {
    public simulate(): { success: boolean; message: string } {
        throw new Error('Method not implemented.');
    }
    public startAnimation(callback: (result: { success: boolean; message: string }) => void): void {
        throw new Error('Method not implemented.');
    }
    public stopAnimation(callback: (result: { success: boolean; message: string }) => void): void {
        throw new Error('Method not implemented.');
    }
    public pauseAnimation(callback: (result: { success: boolean; message: string }) => void): void {
        throw new Error('Method not implemented.');
    }
    public stepForward(highlight: boolean): { success: boolean; message: string; finalStep?: boolean | undefined } {
        throw new Error('Method not implemented.');
    }
    public stepBackward(highlight: boolean): { success: boolean; message: string } {
        throw new Error('Method not implemented.');
    }
    public reset(): void {
        throw new Error('Method not implemented.');
    }
}
