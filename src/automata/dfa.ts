import { Graph } from '../graph';
import { Automaton, AutomatonInfo, Node, Simulator, Transition } from '../automata';
import { DataSet } from 'vis-data';

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

class DFASimulator extends Simulator {
    private _currentNode: Node;
    private _currentStep: number = 0;

    private _interval: number | undefined;

    constructor(automaton: DFA) {
        super(automaton);
        this._currentNode = this._a.getInitialNode();
    }

    public init() {}

    public simulate(): {
        success: boolean;
        message: string;
    } {
        this._errors = this._a.checkAutomaton();

        for (let i = 0; i < this._word.length; i++) {
            const result = this.stepForward(false);
            if (!result.success && !result.finalStep) {
                this._a.highlightErrorNode(this._currentNode.id);
                return result;
            }
        }

        this._a.redrawNodes();
        this._a.highlightNode(this._currentNode);

        return {
            success: this._currentNode.final,
            message: `Finished simulation on <b>${this._currentNode.label}</b>`,
        };
    }

    public startAnimation(cb: Function): void {
        this._errors = this._a.checkAutomaton();

        //Step every 1s
        this._interval = setInterval(() => {
            const result = this.stepForward(true);
            if (!result.success && !result.finalStep) {
                this._a.highlightErrorNode(this._currentNode.id);
                cb(result);
                clearInterval(this._interval);
                return;
            }

            if (result.finalStep) {
                clearInterval(this._interval);
                cb(result);
                return;
            }

            cb({
                success: undefined,
                message: '',
                wordPosition: this._currentStep,
            });
        }, 1000);
    }

    public pauseAnimation(cb: Function): void {
        clearInterval(this._interval);
        cb({
            success: false,
            message: `Simulation paused on <b>${this._currentNode.label}</b>`,
        });
    }

    public stopAnimation(cb: Function): void {
        clearInterval(this._interval);
        cb({
            success: false,
            message: `Simulation stopped on <b>${this._currentNode.label}</b>`,
        });
    }

    public initStepByStep(): { graphInteraction: boolean } {
        return { graphInteraction: false };
    }

    public stepForward(highlight: boolean): {
        success: boolean;
        finalStep?: boolean;
        message: string;
        wordPosition: number;
    } {
        if (this._currentStep >= this._word.length) {
            return {
                success: this._currentNode.final,
                finalStep: true,
                message: `Simulation already finished on <b>${this._currentNode.label}</b>`,
                wordPosition: this._currentStep,
            };
        }

        if (this._errors.some((e) => e.node?.id === this._currentNode?.id)) {
            const nodeErrors = this._errors.filter((e) => e.node?.id === this._currentNode?.id);
            if (highlight) {
                this._a.highlightErrorNode(this._currentNode.id);
            }
            return {
                success: false,
                message: `Simulation stopped on <b>${this._currentNode.label}</b><br/>${nodeErrors
                    .map((e) => e.message)
                    .join('<br/>')}`,
                wordPosition: this._currentStep,
            };
        }

        const letter = this._word[this._currentStep];
        const transition = this._a.getTransitionsFromNode(this._currentNode).find((t) => t.symbols.includes(letter))!;
        this._currentNode = this._a.getNode(transition.to) as Node;

        this._currentStep++;

        if (highlight) {
            this._a.redrawNodes();
            this._a.highlightNode(this._currentNode);
        }

        if (this._currentStep >= this._word.length) {
            return {
                success: this._currentNode.final,
                finalStep: true,
                message: `Finished simulation on <b>${this._currentNode.label}</b><br/>The Automaton <b>${
                    this._currentNode.final ? 'accepts' : 'rejects'
                }</b> the word <b>${this._word.join('')}</b>`,
                wordPosition: this._currentStep,
            };
        }

        return {
            success: true,
            finalStep: false,
            message: '',
            wordPosition: this._currentStep,
        };
    }

    public stepBackward(): {
        success: boolean;
        message: string;
        wordPosition: number;
    } {
        this._currentStep--;

        return {
            success: true,
            message: '',
            wordPosition: this._currentStep,
        };
    }

    public reset(): void {
        this._currentStep = 0;
        this._currentNode = this._a.getInitialNode();
        this._a.redrawNodes();
        this._errors = this._a.checkAutomaton();
        this.stopAnimation(() => {});
    }
}
