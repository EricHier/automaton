import { Network } from 'vis-network';
import { AutomatonComponent } from '../';
import { Automaton, AutomatonInfo, Node, SimulationFeedback, Simulator, Transition } from '../automata';
import { html } from 'lit';
import { Graph } from '../graph';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';

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

        return transition.symbols.map((s) => (s === '' ? 'ε' : s)).join(', ');
    }
}

class NFASimulator extends Simulator {
    private _currentNode: Node;

    private _previousTransitions: {
        node: Node;
        transitionSymbol: string;
    }[] = [];

    private _mode: 'simulation' | 'stepByStep' = 'simulation';
    private _graph: Graph | undefined;

    private _currentStep: number = 0;
    private _currentWordPosition: number = 0;

    private _interval: number | undefined;

    public simulate(): { success: boolean; message: string } {
        console.log('Simulating NFA', this._word);
        const word = this._word;
        const result = this.simulationFromState(word, this._a.getInitialNode() as Node);
        console.log('Result', result);
        const lastNode = result.path[result.path.length - 1].node;
        this._a.highlightNode(lastNode);
        return {
            success: result.success,
            message: `Finished simulation on <b>${lastNode.label}</b>.<br />Path: ${result.path
                .map((n) => `<b>${n.node.label}</b>`)
                .join(',')}`,
        };
    }

    constructor(automaton: NFA) {
        super(automaton);
        this._currentNode = this._a.getInitialNode() as Node;
    }

    private simulationFromState(
        word: string[],
        state: Node
    ): { success: boolean; message: string; path: { node: Node; symbol: string }[] } {
        const transitions = this._a.getTransitionsFromNode(state);
        let validTransitions = transitions.filter((t) => t.symbols.includes(word[0]) || t.symbols.includes(''));

        if (word.length === 0 && validTransitions.length === 0) {
            return {
                success: state.final,
                message: state.final ? 'Accepted' : 'Rejected',
                path: [{ node: state, symbol: '' }],
            };
        }

        AutomatonComponent.log(
            'Simulating from state',
            [state.label],
            'with word',
            [word.join('')],
            'valid transitions',
            validTransitions.map((t) => t.symbols.map((s) => (s === '' ? 'ε' : s)).join(',')).flat()
        );
        for (const transition of validTransitions) {
            const to = this._a.getNode(transition.to) as Node;

            for (const symbol of transition.symbols) {
                if (symbol !== word[0] && symbol !== '') continue;

                if (symbol === '') {
                    const result = this.simulationFromState(word, to);
                    if (result.success) {
                        return { success: true, message: 'Accepted', path: [{ node: state, symbol }, ...result.path] };
                    }
                } else {
                    const result = this.simulationFromState(word.slice(1), to);
                    if (result.success) {
                        return { success: true, message: 'Accepted', path: [{ node: state, symbol }, ...result.path] };
                    }
                }
            }
        }

        return { success: false, message: 'Rejected', path: [{ node: state, symbol: '' }] };
    }

    public startAnimation(
        callback: (result: { success: boolean | undefined; message: string; wordPosition: number }) => void
    ): void {
        let { success, path } = this.simulationFromState(this._word, this._a.getInitialNode() as Node);

        if (!success) {
            callback({ success, message: 'No valid path found', wordPosition: 0 });
            return;
        }

        console.log('Path', path);

        this._interval = setInterval(() => {
            this._currentStep++;
            this._currentNode = path[this._currentStep]?.node;
            this._a.clearHighlights();

            if (this._currentStep >= path.length) {
                clearInterval(this._interval);
                this._a.highlightNode(path[path.length - 1].node);
                callback({ success: true, message: 'Finished', wordPosition: 0 });
                return;
            }

            this._a.highlightNode(path[this._currentStep]?.node);

            if (path[this._currentStep - 1]?.symbol !== '') {
                this._currentWordPosition++;
            }

            callback({
                success: undefined,
                message: '',
                wordPosition: this._currentWordPosition,
            });
        }, 1000);
    }
    public stopAnimation(
        callback: (result: { success: boolean | undefined; message: string; wordPosition: number }) => void
    ): void {
        clearInterval(this._interval);
        callback({
            success: false,
            message: `Simulation stopped on <b>${this._currentNode.label}</b>`,
            wordPosition: this._currentStep,
        });
    }
    public pauseAnimation(
        callback: (result: { success: boolean | undefined; message: string; wordPosition: number }) => void
    ): void {
        clearInterval(this._interval);
        callback({
            success: false,
            message: `Simulation paused on <b>${this._currentNode.label}</b>`,
            wordPosition: this._currentStep,
        });
    }

    public init() {}

    public initStepByStep(graph: Graph, cb: Function): { graphInteraction: boolean } {
        this._currentNode = this._a.getInitialNode() as Node;
        this._currentStep = 0;
        this._currentWordPosition = 0;

        this._mode = 'stepByStep';

        this.highlightPossibleTransitions(this._currentNode);

        if (this._graph !== graph) {
            this._graph = graph;

            this._graph?.network.on('selectEdge', (e) => {
                if (this._mode !== 'stepByStep') return;

                const transition = this._a.getTransition(e.edges[0]);

                if (!transition) return;
                if (!this.isValidTransition(transition)) return;

                const posibleSymbols = transition.symbols.filter(
                    (s) => s == '' || s == this._word[this._currentWordPosition]
                );
                if (posibleSymbols.length > 1) {
                    const dialog = document.createElement('dialog');

                    const buttons = posibleSymbols.map((s) => {
                        const button = document.createElement('button');
                        button.innerHTML = s === '' ? 'ε' : s;
                        button.addEventListener('click', () => {
                            dialog.close();
                            this._a.clearHighlights();

                            this._previousTransitions.push({
                                node: this._currentNode,
                                transitionSymbol: s,
                            });

                            this._currentNode = this._a.getNode(transition.to) as Node;
                            this._currentStep++;

                            if (s !== '') {
                                this._currentWordPosition++;
                            }

                            this._a.highlightNode(this._currentNode);
                            this.highlightPossibleTransitions(this._currentNode);
                            cb({
                                success: undefined,
                                message: '',
                                wordPosition: this._currentWordPosition,
                            });
                            dialog.remove();
                        });
                        return button;
                    });

                    dialog.append(...buttons);
                    graph.component.shadowRoot?.appendChild(dialog);
                    dialog.showModal();
                    return;
                }

                const to = this._a.getNode(transition.to) as Node;

                this._previousTransitions.push({
                    node: this._currentNode,
                    transitionSymbol: posibleSymbols[0],
                });

                this._currentNode = to;
                this._currentStep++;

                if (transition.symbols[0] !== '') {
                    this._currentWordPosition++;
                }

                this._a.clearHighlights();
                this._a.highlightNode(to);
                this.highlightPossibleTransitions(to);
                cb({
                    success: undefined,
                    message: '',
                    wordPosition: this._currentWordPosition,
                });
            });
        }

        return { graphInteraction: true };
    }

    private isValidTransition(transition: Transition): boolean {
        const validSymbol =
            transition.symbols.includes(this._word[this._currentWordPosition]) || transition.symbols.includes('');
        const validFrom = transition.from === this._currentNode.id;

        return validSymbol && validFrom;
    }

    private highlightPossibleTransitions(node: Node): void {
        const transitions = this._a.getTransitionsFromNode(node);
        const currentSymbol = this._word[this._currentWordPosition];
        const validTransitions = transitions.filter((t) => t.symbols.includes(currentSymbol) || t.symbols.includes(''));

        validTransitions.forEach((t) => {
            this._a.highlightTransition(t);
        });
    }

    public stepForward(): {
        success: boolean;
        message: string;
        wordPosition: number;
        finalStep?: boolean | undefined;
    } {
        throw new Error('Method not implemented.');
    }
    public stepBackward(): SimulationFeedback {
        console.log('StepBackward', this._previousTransitions, this._currentStep, this._currentWordPosition);

        this._a.clearHighlights();
        if (this._previousTransitions[this._currentStep - 1].transitionSymbol !== '') {
            this._currentWordPosition--;
        }

        this._currentNode = this._previousTransitions[this._currentStep - 1].node;
        this._a.highlightNode(this._currentNode);
        this.highlightPossibleTransitions(this._currentNode);

        this._previousTransitions.pop();

        this._currentStep--;
        return {
            success: undefined,
            message: '',
            wordPosition: this._currentWordPosition,
            firstStep: this._currentStep === 0,
        };
    }
    public reset(): void {
        this._a.clearHighlights();
        this._currentStep = 0;
        this._currentWordPosition = 0;
        this._currentNode = this._a.getInitialNode();
        this._a.redrawNodes();
        this._errors = this._a.checkAutomaton();
        this.stopAnimation(() => {});
    }
}
