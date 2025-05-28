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

    private _speed: number = 1000;

    private _stepByStepPath: {
        accepted: boolean;
        path: Node[];
        errors?: AutomatonInfo[];
    } | undefined = undefined;
    private _stepByStepHightlightTimeouts: number[] = [];

    constructor(automaton: DFA) {
        super(automaton);
        this._currentNode = this._a.getInitialNode();
    }

    public init() {}

    private getPath(): {
        accepted: boolean;
        path: Node[];
        errors?: AutomatonInfo[];
    } {
        this._errors = this._a.checkAutomaton();
        if (this._errors.length > 0) {
            return { accepted: false, path: [], errors: this._errors };
        }

        const path: Node[] = [];
        let currentNode = this._a.getInitialNode();
        path.push(currentNode);

        for (const letter of this._word) {
            const transition = this._a.getTransitionsFromNode(currentNode).find((t) => t.symbols.includes(letter));
            if (!transition) {
                return { accepted: false, path };
            }
            currentNode = this._a.getNode(transition.to) as Node;
            path.push(currentNode);
        }

        return { accepted: currentNode.final, path };
    }

    public simulate(): {
        success: boolean;
        message: string;
    } {
        const result = this.getPath();
        this._a.redrawNodes();

        if (result.errors && result.errors.length > 0) {
            return {
                success: false,
                message: `Please fix the following errors to run the simulation:<br/>${result.errors
                    .map((e) => e.message)
                    .join('<br/>')}`,
            };
        }

        const lastNode = result.path[result.path.length - 1];
        this._a.highlightNode(lastNode);

        return {
            success: result.accepted,
            message: `Finished simulation on <b>${lastNode.label}</b>.<br />Path: ${result.path
                .map((n: Node) => `<b>${n.label}</b>`)
                .join(', ')}`,
        };
    }

    public startAnimation(cb: Function): void {
        const result = this.getPath();

        if (result.errors && result.errors.length > 0) {
            cb({
                success: false,
                message: `Please fix the following errors to run the simulation:<br/>${result.errors
                    .map((e) => e.message)
                    .join('<br/>')}`,
            });
            return;
        }

        const iteration = () => {
            const node = result.path[this._currentStep];

            if (this._currentStep >= this._word.length) {
                // This is the last step, so we highlight the node and stop the simulation
                clearInterval(this._interval);
                this._a.highlightNode(node);
                cb({
                    success: result.accepted,
                    message: `Finished simulation on <b>${node.label}</b>.<br />The Automaton <b>${
                        result.accepted ? 'accepts' : 'rejects'
                    }</b> the word <b>${this._word.join('')}</b>.<br />Path: ${result.path
                        .map((n: Node) => `<b>${n.label}</b>`)
                        .join(', ')}`,
                    wordPosition: this._word.length,
                });
                return;
            }

            const transition = this._a.getTransitionsFromNode(node).find((t) => t.symbols.includes(this._word[this._currentStep]))!;
            this._a.flashHighlightNode(node, this._speed / 2);
            setTimeout(() => this._a.flashHighlightTransition(transition, this._speed / 2), this._speed / 2);

            cb({
                success: undefined,
                message: `<br />Path: ${result.path.slice(0, this._currentStep + 1)
                .map((n: Node) => `<b>${n.label}</b>`)
                .join(', ')}`,
                wordPosition: this._currentStep,
            });
            this._currentNode = node;
            this._currentStep++;
        }

        iteration();
        this._interval = setInterval(iteration, this._speed);
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

    public initStepByStep(_: Graph, callback: Function): { graphInteraction: boolean } {
        console.log('Initializing step-by-step mode');

        this._stepByStepPath = this.getPath();
        this._currentStep = 0;
        this._currentNode = this._a.getInitialNode();

        if (this._stepByStepPath.errors && this._stepByStepPath.errors.length > 0) {
            callback({
                success: false,
                message: `Please fix the following errors:<br/>${this._stepByStepPath.errors
                    .map((e) => e.message)
                    .join('<br/>')}`,
            });
            return { graphInteraction: false };
        }

        callback({
            success: true,
            message: `Current step: ${this._currentStep}/${this._word.length}<br/>Path: ${this._stepByStepPath.path
                .map((n: Node) => `<b>${n.label}</b>`)
                .join(', ')}`,
            wordPosition: this._currentStep,
        })

        return { graphInteraction: false };
    }

    public stepForward(highlight: boolean): {
        success: boolean;
        finalStep?: boolean;
        message: string;
        wordPosition: number;
    } {
        if (!this._stepByStepPath) {
            return {
                success: false,
                message: 'Error: No path calculated',
                wordPosition: this._currentStep,
            };
        }

        if (this._stepByStepPath.errors && this._stepByStepPath.errors.length > 0) {
            return {
                success: false,
                message: `Please fix the following errors:<br/>${this._stepByStepPath.errors
                    .map((e) => e.message)
                    .join('<br/>')}`,
                wordPosition: this._currentStep,
            };
        }

        if (this._currentStep >= this._word.length) {
            const finalNode = this._stepByStepPath.path[this._stepByStepPath.path.length - 1];
            return {
                success: finalNode.final,
                finalStep: true,
                message: `Simulation already finished on <b>${finalNode.label}</b>`,
                wordPosition: this._currentStep,
            };
        }

        this._currentNode = this._stepByStepPath.path[this._currentStep];
        const nextNode = this._stepByStepPath.path[this._currentStep + 1];
        
        const letter = this._word[this._currentStep];
        const transition = this._a.getTransitionsFromNode(this._currentNode).find((t) => 
            t.symbols.includes(letter) && t.to === nextNode.id
        );

        this._currentStep++;

        if (highlight) {
            this._a.redrawNodes();
            this._stepByStepHightlightTimeouts.forEach((timeout) => clearTimeout(timeout));
            this._stepByStepHightlightTimeouts = [];
            this._a.clearHighlights();
            if (transition) {
                this._a.flashHighlightTransition(transition, this._speed / 2);
                this._stepByStepHightlightTimeouts.push(setTimeout(() => {
                    this._a.highlightNode(nextNode);
                }, this._speed / 2));
            } else {
                this._a.highlightNode(nextNode);
            }
        }

        if (this._currentStep >= this._word.length) {
            const finalNode = this._stepByStepPath.path[this._stepByStepPath.path.length - 1];
            return {
                success: finalNode.final,
                finalStep: true,
                message: `Finished simulation on <b>${finalNode.label}</b><br/>The Automaton <b>${
                    finalNode.final ? 'accepts' : 'rejects'
                }</b> the word <b>${this._word.join('')}</b><br/>Path: ${this._stepByStepPath.path
                    .map((n: Node) => `<b>${n.label}</b>`)
                    .join(', ')}`,
                wordPosition: this._currentStep,
            };
        }

        return {
            success: true,
            finalStep: false,
            message: `Current step: ${this._currentStep}/${this._word.length}<br/>Path: ${this._stepByStepPath.path
                .slice(0, this._currentStep + 1)
                .map((n: Node) => `<b>${n.label}</b>`)
                .join(', ')}`,
            wordPosition: this._currentStep,
        };
    }

    public stepBackward(highlight: boolean): {
        success: boolean;
        message: string;
        wordPosition: number;
    } {
        if (!this._stepByStepPath) {
            return {
                success: false,
                message: 'No path calculated. Please initialize step-by-step mode first.',
                wordPosition: this._currentStep,
            };
        }

        if (this._currentStep <= 0) {
            this._currentStep = 0;
            this._currentNode = this._a.getInitialNode();
            return {
                success: true,
                message: 'Already at the beginning of simulation',
                wordPosition: this._currentStep,
            };
        }

        this._currentStep--;
        this._currentNode = this._stepByStepPath.path[this._currentStep];

        const letter = this._word[this._currentStep];
        const transition = this._a.getTransitionsFromNode(this._currentNode).find((t) => 
            t.symbols.includes(letter)
        );

        if (highlight) {
            this._a.redrawNodes();
            this._stepByStepHightlightTimeouts.forEach((timeout) => clearTimeout(timeout));
            this._stepByStepHightlightTimeouts = [];
            this._a.clearHighlights();
            if (transition) {
                this._a.flashHighlightTransition(transition, this._speed / 2);
                this._stepByStepHightlightTimeouts.push(setTimeout(() => {
                    this._a.highlightNode(this._currentNode);
                }, this._speed / 2));
            } else {
                this._a.highlightNode(this._currentNode);
            }
        }

        return {
            success: true,
            message: `Current step: ${this._currentStep}/${this._word.length}<br/>Path: ${this._stepByStepPath.path
                .slice(0, this._currentStep + 1)
                .map((n: Node) => `<b>${n.label}</b>`)
                .join(', ')}`,
            wordPosition: this._currentStep,
        };
    }

    public reset(): void {
        this._currentStep = 0;
        this._currentNode = this._a.getInitialNode();
        this._a.redrawNodes();
        this._errors = this._a.checkAutomaton();
        this._stepByStepPath = undefined;
        this.stopAnimation(() => {});
    }
}
