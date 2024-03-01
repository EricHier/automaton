import { AutomatonComponent } from '../';
import { Automaton, AutomatonInfo, Node, Simulator, Transition } from './';
import { PropertyValueMap, TemplateResult, html } from 'lit';
import { DataSet } from 'vis-data';
import { LitElementWw } from '@webwriter/lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { stackStyles } from '../styles/stack';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import { biTrash } from '../styles/icons';

export class PDA extends Automaton {
    public simulator: Simulator;
    public type: string = 'pda';

    public extension = document.createElement('stack-extension');

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
                if (s === '') s = 'ε';
                switch (operations[i].operation) {
                    case 'push':
                        return `${s},X|${operations[i].symbol}X`;
                    case 'pop':
                        return `${s},${operations[i].symbol}|ε`;
                    case 'empty':
                        return `${s},Γ₀|Γ₀`;
                    default:
                        return `${s},X|X`;
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

type StackItem = {
    id: number;
    symbol: string;
};

@customElement('stack-extension')
export class StackExtension extends LitElementWw {
    private _stack: DataSet<StackItem> = new DataSet<StackItem>();

    @property({ type: Array }) public stack: StackItem[] = [];

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

    constructor() {
        super();
        this._stack.on('*', () => {
            this.stack = [...this._stack.get()];
        });

        this._stack.add([{ id: 0, symbol: '0' }]);
        this._stack.add([{ id: 1, symbol: '1' }]);
        this._stack.add([{ id: 2, symbol: '2' }]);
        this._stack.add([{ id: 3, symbol: '3' }]);
        this._stack.add([{ id: 4, symbol: '4' }]);
    }

    public render(): TemplateResult {
        return html`<div class="pda__stack">
            <div class="pda__stack-title">Stack</div>
            <sl-button
                class="pda__stack-button"
                size="small"
                id="pda__stack-button"
                circle
                @click=${() => {
                    this.pushItemToStack('a');
                    this.requestUpdate();
                }}
                @dragover=${(e: DragEvent) => {
                    e.preventDefault();
                    this.clearDropMarkers();
                    this._stackButton.classList.add('dragover');
                    this._draggingElement.classList.add('deleteable');
                }}
                @dragleave=${(e: DragEvent) => {
                    e.preventDefault();
                    this._stackButton.classList.remove('dragover');
                    this._draggingElement.classList.remove('deleteable');
                }}
                >${this._dragging ? biTrash : '+'}</sl-button
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
                            draggable="true"
                            data-index=${i}
                        >
                            <sl-tooltip content=${s.symbol} placement="left" class="pda__stack-item__tooltip">
                                <sl-input
                                    size="small"
                                    @sl-input=${(e: Event) =>
                                        this.changeStackSymbol(i, (e.target as HTMLInputElement).value)}
                                    value=${s.symbol}
                                ></sl-input>
                            </sl-tooltip>
                        </div>
                    `
                )}
            </div>
        </div>`;
    }

    public pushItemToStack(symbol: string): void {
        const symbols = this._stack.get().map((s) => s.symbol);
        symbols.unshift(symbol);
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
