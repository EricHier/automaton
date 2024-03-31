import { AutomatonComponent } from '../';
import { Automaton, AutomatonInfo, Node, SimulationFeedback, Simulator, Transition } from './';
import { PropertyValueMap, TemplateResult, html } from 'lit';
import { DataSet } from 'vis-data';
import { LitElementWw } from '@webwriter/lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { stackStyles } from '../styles/stack';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import { biTrash } from '../styles/icons';
import { Graph } from '../graph';
import { styleMap } from 'lit/directives/style-map.js';

export class PDA extends Automaton {
    public simulator: Simulator;
    public type: string = 'pda';

    public extension = document.createElement('stack-extension') as StackExtension;

    public checkAutomaton(): AutomatonInfo[] {
        return [];
    }

    constructor(nodes: Node[], transitions: Transition[]) {
        super(nodes, transitions);
        this.simulator = new PDASimulator(this);

        AutomatonComponent.log('Created PDA', this.nodes.get(), this.transitions.get());
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

        console.log('Loaded PDA', this.nodes.get(), this.transitions.get());
    }

    public saveAutomaton(): string {
        throw new Error('Method not implemented.');
    }

    public getTransitionLabel(transition: Transition): string {
        if (transition.stackOperations) {
            const operations = transition.stackOperations;
            const parts = transition.symbols.map((s, i) => {
                const stackSymbol = operations[i].condition || 'X';
                if (s === '') s = 'ε';
                switch (operations[i].operation) {
                    case 'push':
                        return `${s},${stackSymbol}|${operations[i].symbol}${stackSymbol}`;
                    case 'pop':
                        return `${s},${operations[i].symbol}|ε`;
                    case 'empty':
                        return `${s},Γ₀|Γ₀`;
                    default:
                        return `${s},${stackSymbol}|${stackSymbol}`;
                }
            });
            return parts.join('\n');
        }

        if (transition.symbols.length === 1) {
            return transition.symbols[0] === '' ? 'ε' : transition.symbols[0];
        }

        return transition.symbols.join(', ');
    }
}

class PDASimulator extends Simulator {
    private _currentNode: Node;

    private _previousTransitions: {
        node: Node;
        transitionSymbol: string;
        stackOperation: { operation: string; symbol: string };
    }[] = [];

    private _mode: 'simulation' | 'stepByStep' = 'simulation';
    private _graph: Graph | undefined;

    private _currentStep: number = 0;
    private _currentWordPosition: number = 0;

    private _interval: number | undefined;

    private _initialStack: string[] = [];

    constructor(protected _a: PDA) {
        super(_a);
        this._currentNode = this._a.getInitialNode();
        this._initialStack = this._a.extension.getStack();
    }

    public simulate(): { success: boolean; message: string } {
        console.log('Simulating PDA', this._word);
        this._initialStack = this._a.extension.getStack();
        const word = this._word;
        const result = this.simulationFromState(word, this._a.getInitialNode() as Node, [...this._initialStack]);
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

    private simulationFromState(
        word: string[],
        state: Node,
        stack: string[]
    ): { success: boolean; message: string; path: { node: Node; symbol: string; stack: string[] }[] } {
        const transitions = this._a.getTransitionsFromNode(state) as Transition[];
        let validTransitions = transitions.filter((t) => t.symbols.includes(word[0]) || t.symbols.includes(''));
        validTransitions = validTransitions.filter((t) => {
            for (let i = 0; i < t.stackOperations!.length; i++) {
                const symbol = t.symbols[i];
                const stackOperation = t.stackOperations![i];

                let validStackOperation: boolean = false;
                if (stackOperation.operation === 'none') validStackOperation = true;
                if (stackOperation.operation === 'push') validStackOperation = true;
                if (stackOperation.operation === 'pop' && stack[stack.length - 1] === stackOperation.symbol)
                    validStackOperation = true;
                if (stackOperation.operation === 'empty' && stack.length === 0) validStackOperation = true;

                if (validStackOperation && (symbol == word[0] || symbol == '')) return true;
            }

            return false;
        });

        if (word.length === 0 && validTransitions.length === 0) {
            return {
                success: state.final,
                message: state.final ? 'Accepted' : 'Rejected',
                path: [{ node: state, symbol: '', stack }],
            };
        }

        if (word.length === 0 && state.final) {
            return { success: true, message: 'Accepted', path: [{ node: state, symbol: '', stack }] };
        }

        AutomatonComponent.log(
            'Simulating from state',
            [state.label],
            'with word',
            [word.join('')],
            'and stack',
            [stack.join(',')],
            'valid transitions',
            validTransitions.map((t) => t.symbols.map((s) => (s === '' ? 'ε' : s)).join(',')).flat()
        );
        for (const transition of validTransitions) {
            const to = this._a.getNode(transition.to) as Node;

            for (let i = 0; i < transition.symbols.length; i++) {
                const symbol = transition.symbols[i];
                const stackOperation = transition.stackOperations![i];

                if (symbol !== word[0] && symbol !== '') continue;
                if (stackOperation.condition && stackOperation.condition !== stack[stack.length - 1]) continue;

                const newStack = [...stack];

                if (stackOperation.operation == 'push') newStack.push(stackOperation.symbol);
                if (stackOperation.operation == 'pop') newStack.pop();

                AutomatonComponent.log(
                    'Take transition from',
                    state.label,
                    'with',
                    symbol == '' ? 'ε' : symbol,
                    'with stack',
                    newStack.join(',')
                );

                let result;
                if (symbol === '') result = this.simulationFromState(word, to as Node, newStack);
                else result = this.simulationFromState(word.slice(1), to as Node, newStack);

                if (result.success) {
                    return {
                        success: true,
                        message: 'Accepted',
                        path: [{ node: state, symbol, stack }, ...result.path],
                    };
                }
            }
        }

        return { success: false, message: 'Rejected', path: [{ node: state, symbol: '', stack }] };
    }
    public init() {
        this._initialStack = this._a.extension.getStack();
    }

    public startAnimation(callback: (result: SimulationFeedback) => void): void {
        let { success, path } = this.simulationFromState(this._word, this._a.getInitialNode() as Node, [
            ...this._initialStack,
        ]);

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
            this._a.extension.setStack(path[this._currentStep]?.stack);

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
    public stopAnimation(callback: (result: SimulationFeedback) => void): void {
        clearInterval(this._interval);
        callback({
            success: false,
            message: `Simulation stopped on <b>${this._currentNode.label}</b>`,
            wordPosition: this._currentStep,
        });
    }
    public pauseAnimation(callback: (result: SimulationFeedback) => void): void {
        clearInterval(this._interval);
        callback({
            success: false,
            message: `Simulation paused on <b>${this._currentNode.label}</b>`,
            wordPosition: this._currentStep,
        });
    }

    public initStepByStep(graph: Graph, cb: Function): { graphInteraction: boolean } {
        this._currentNode = this._a.getInitialNode() as Node;
        this._currentStep = 0;
        this._currentWordPosition = 0;

        this._mode = 'stepByStep';

        this.highlightPossibleTransitions(this._currentNode);

        if (this._graph !== graph) {
            this._graph = graph;

            this._graph?.network.on('selectEdge', (e) => {
                this._graph?.network.selectEdges([]);
                if (this._mode !== 'stepByStep') return;

                const transition = this._a.getTransition(e.edges[0]);

                if (!transition) return;
                if (!this.isValidTransition(transition)) return;

                const posibleSymbols = transition.symbols.filter(
                    (s) => s == '' || s == this._word[this._currentWordPosition]
                );

                if (posibleSymbols.length > 1) {
                    const dialog = document.createElement('dialog');

                    const buttons = posibleSymbols.map((s, i) => {
                        const button = document.createElement('button');
                        button.innerHTML = s === '' ? 'ε' : s;
                        button.addEventListener('click', () => {
                            dialog.close();
                            this._a.clearHighlights();

                            const stackOperation = transition.stackOperations![i];

                            if (stackOperation.operation === 'push') {
                                this._a.extension.push(stackOperation.symbol);
                            }

                            if (stackOperation.operation === 'pop') {
                                stackOperation.symbol = this._a.extension.getTopItem();
                                this._a.extension.pop();
                            }

                            this._previousTransitions.push({
                                node: this._currentNode,
                                transitionSymbol: s,
                                stackOperation,
                            });

                            this._currentNode = this._a.getNode(transition.to) as Node;
                            this._currentStep++;

                            if (s !== '') {
                                this._currentWordPosition++;
                            }

                            this._a.highlightNode(this._currentNode);
                            this.highlightPossibleTransitions(this._currentNode);
                            cb({
                                success:
                                    this._currentWordPosition >= this._word.length
                                        ? this._currentNode.final
                                        : undefined,
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

                const stackOperation = transition.stackOperations![transition.symbols.indexOf(posibleSymbols[0])];

                if (stackOperation.operation === 'push') {
                    this._a.extension.push(stackOperation.symbol);
                }

                if (stackOperation.operation === 'pop') {
                    stackOperation.symbol = this._a.extension.getTopItem();
                    this._a.extension.pop();
                }

                const to = this._a.getNode(transition.to) as Node;

                this._previousTransitions.push({
                    node: this._currentNode,
                    transitionSymbol: posibleSymbols[0],
                    stackOperation,
                });

                this._currentNode = to;
                this._currentStep++;

                if (posibleSymbols[0] !== '') {
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
    public stepForward(): SimulationFeedback {
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

        if (this._previousTransitions[this._currentStep - 1].stackOperation.operation === 'push') {
            this._a.extension.pop();
        }

        if (this._previousTransitions[this._currentStep - 1].stackOperation.operation === 'pop') {
            this._a.extension.push(this._previousTransitions[this._currentStep - 1].stackOperation.symbol);
        }

        this._previousTransitions.pop();

        this._currentStep--;
        return {
            success: undefined,
            message: '',
            wordPosition: this._currentWordPosition,
            firstStep: this._currentStep === 0,
        };
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
        const stack = this._a.extension.getStack();

        console.log(stack);

        let validTransitions = transitions.filter((t) => t.symbols.includes(currentSymbol) || t.symbols.includes(''));
        validTransitions = validTransitions.filter((t) => {
            for (let i = 0; i < t.stackOperations!.length; i++) {
                const symbol = t.symbols[i];
                const stackOperation = t.stackOperations![i];

                let validStackOperation: boolean = false;
                if (stackOperation.operation === 'none') validStackOperation = true;
                if (stackOperation.operation === 'push') validStackOperation = true;
                if (stackOperation.operation === 'pop' && stack[0] === stackOperation.symbol)
                    validStackOperation = true;
                if (stackOperation.operation === 'empty' && stack.length === 0) validStackOperation = true;

                if (validStackOperation && (symbol == currentSymbol || symbol == '')) return true;
            }

            return false;
        });

        validTransitions.forEach((t) => {
            this._a.highlightTransition(t);
        });
    }

    public reset(): void {
        this._a.clearHighlights();
        this._currentStep = 0;
        this._currentWordPosition = 0;
        this._currentNode = this._a.getInitialNode();
        this._a.redrawNodes();
        this._errors = this._a.checkAutomaton();

        this._a.extension.setStack(this._initialStack);

        this.stopAnimation(() => {});
    }
}

type StackItem = {
    id: number;
    symbol: string;
};

@customElement('stack-extension')
export class StackExtension extends LitElementWw {
    private _stack: DataSet<StackItem> = new DataSet<StackItem>();

    @property({ type: Array }) public stack: StackItem[] = [];

    @property({ type: String, attribute: true, reflect: true })
    public add: boolean = true;

    @property({ type: String, attribute: true, reflect: true })
    public delete: boolean = true;

    @property({ type: String, attribute: true, reflect: true })
    public change: boolean = true;

    static get styles() {
        return stackStyles;
    }
    private afterElement: HTMLElement | null = null;
    @state() private _dragging: boolean = false;

    @query('.pda__stack-items') private _stackItems!: HTMLElement;
    @query('.pda__stack-button') private _stackButton!: HTMLElement;
    @query('.dragging') private _draggingElement!: HTMLElement;

    public static get scopedElements() {
        return {
            'sl-button': SlButton,
            'sl-input': SlInput,
            'sl-tooltip': SlTooltip,
        };
    }

    private isEditable(): boolean {
        return this.contentEditable === 'true';
    }

    constructor() {
        super();
        this._stack.on('*', () => {
            this.stack = [...this._stack.get()];
        });
    }

    public getStack(): string[] {
        return this._stack.get().map((s) => s.symbol);
    }

    public setStack(stack: string[]): void {
        this._stack.clear();
        this._stack.add(stack.reverse().map((s, i) => ({ id: i, symbol: s })));
    }

    public push(symbol: string): void {
        this.pushItemToStack(symbol);
    }

    public pop(): void {
        this.popItemFromStack();
    }

    public getTopItem(): string {
        return this._stack.get(0)?.symbol || '';
    }

    public checkEmpty(): boolean {
        return this._stack.length === 0;
    }

    public checkSymbol(symbol: string): boolean {
        const item = this._stack.get(0);
        return item?.symbol === symbol;
    }

    public render(): TemplateResult {
        return html`<div class="pda__stack">
            <div class="pda__stack-title">Stack</div>
            <sl-button
                class="pda__stack-button"
                style=${styleMap({ display: this.isEditable() ? 'block' : 'none' })}
                size="small"
                id="pda__stack-button"
                circle
                ?disabled=${!this.add}
                @click=${() => {
                    this.pushItemToStack('a');
                    this.requestUpdate();
                }}
                @dragover=${(e: DragEvent) => {
                    e.preventDefault();
                    if (!this.delete) return;
                    this.clearDropMarkers();
                    this._stackButton.classList.add('dragover');
                    this._draggingElement.classList.add('deleteable');
                }}
                @dragleave=${(e: DragEvent) => {
                    e.preventDefault();
                    this._stackButton.classList.remove('dragover');
                    this._draggingElement.classList.remove('deleteable');
                }}
                >${this._dragging && this.delete ? biTrash : '+'}</sl-button
            >
            <div
                class="pda__stack-items"
                id="pda__stack-items"
                @dragover=${(e: DragEvent) => {
                    e.preventDefault();
                    const afterObject = this.getDragPosition(this._stackItems, e.clientY) as {
                        element: HTMLElement;
                        offset: number;
                    };
                    this.afterElement = afterObject.element;
                    this.clearDropMarkers();

                    if (!this.afterElement) {
                        this._stackItems.classList.add('drop-before');
                    } else {
                        this.afterElement.classList.add('drop-after');
                    }
                }}
            >
                ${this.stack.map(
                    (s, i) => html`
                        <div
                            class="pda__stack-item"
                            @dragstart=${(e: DragEvent) => {
                                (e.target as HTMLElement).classList.add('dragging');
                                e.dataTransfer?.setData('index', i.toString());
                                e.dataTransfer?.setDragImage(document.createElement('div'), 0, 0);
                                this._dragging = true;
                            }}
                            @dragend=${(e: DragEvent) => {
                                console.log(this._draggingElement);
                                if (this._draggingElement.classList.contains('deleteable')) {
                                    this.deleteStackSymbol(i);
                                } else {
                                    this.reorderStack(
                                        i,
                                        this.afterElement
                                            ? parseInt(this.afterElement.dataset.index!)
                                            : this._stack.length
                                    );
                                }
                                this._draggingElement.classList.remove('dragging');
                                this._dragging = false;
                                this.clearDropMarkers();
                            }}
                            @dragover=${(e: DragEvent) => {
                                e.preventDefault();
                            }}
                            draggable=${this.isEditable() && this.change ? 'true' : 'false'}
                            data-index=${i}
                        >
                            <sl-tooltip content=${s.symbol} placement="left" class="pda__stack-item__tooltip">
                                <sl-input
                                    size="small"
                                    @sl-input=${(e: Event) =>
                                        this.changeStackSymbol(i, (e.target as HTMLInputElement).value)}
                                    value=${s.symbol}
                                    ?disabled=${!this.isEditable() || !this.change}
                                ></sl-input>
                            </sl-tooltip>
                        </div>
                    `
                )}
            </div>
        </div>`;
    }

    private pushItemToStack(symbol: string): void {
        const symbols = this._stack.get().map((s) => s.symbol);
        symbols.unshift(symbol);
        this._stack.clear();
        this._stack.add(symbols.map((s, i) => ({ id: i, symbol: s })));
    }

    private popItemFromStack(): void {
        const symbols = this._stack.get().map((s) => s.symbol);
        symbols.shift();
        this._stack.clear();
        this._stack.add(symbols.map((s, i) => ({ id: i, symbol: s })));
    }

    private changeStackSymbol(index: number, symbol: string): void {
        console.log('changeStackSymbol', index, symbol);
        this._stack.update({ id: index, symbol });
        this.requestUpdate();
    }

    private deleteStackSymbol(index: number): void {
        console.log('deleteStackSymbol', index, this._stack.get());
        this._stack.remove(index);
        const symbols = this._stack.get().map((s) => s.symbol);
        this._stack.clear();
        this._stack.add(symbols.map((s, i) => ({ id: i, symbol: s })));

        this.requestUpdate();
    }

    private clearDropMarkers(): void {
        const elements = [...this._stackItems.querySelectorAll('.pda__stack-item')];
        elements.forEach((e) => {
            e.classList.remove('drop-after');
            e.classList.remove('drop-before');
            if (e !== this._draggingElement) e.classList.remove('deleteable');
        });
        this._stackItems.classList.remove('drop-before');
        this._stackButton.classList.remove('dragover');
    }

    private reorderStack(oldIndex: number, newIndex: number): void {
        if (oldIndex === newIndex) return;

        if (oldIndex < newIndex) newIndex--;

        console.log('reorderStack', oldIndex, newIndex);

        const symbols = this._stack.get().map((s) => s.symbol);
        const item = symbols.splice(oldIndex, 1);
        symbols.splice(newIndex, 0, item[0]);
        this._stack.clear();
        this._stack.add(symbols.map((s, i) => ({ id: i, symbol: s })));
        this.requestUpdate();
    }

    private getDragPosition(container: HTMLElement, y: number) {
        let elements = [...container.querySelectorAll('.pda__stack-item:not(.dragging)')];
        return elements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        );
    }
}
