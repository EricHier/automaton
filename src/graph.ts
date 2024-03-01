import { Transition, Node, Automaton, AutomatonInfo } from './automata';
import { Network } from 'vis-network';
import { v4 as uuidv4 } from 'uuid';
import { ContextMenu } from './components/ContextMenu';
import { ToolMenu } from './components/ToolMenu';
import { DRAW } from './utils/draw';
import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { biExclamationOctagon } from './styles/icons';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { COLORS } from './utils/colors';
import { AutomatonComponent } from './index';

export class Graph {
    private _a: Automaton;
    public get automaton(): Automaton {
        return this._a;
    }

    private _n: Network;
    public get network(): Network {
        return this._n;
    }

    private _ac: AutomatonComponent;
    public get component(): AutomatonComponent {
        return this._ac;
    }

    private _cm: ContextMenu;
    public get contextMenu(): ContextMenu {
        return this._cm;
    }

    private _tm: ToolMenu;

    private _hovered!: Node | Transition | null;
    private _hoveredType!: 'Node' | 'Transition';

    private _selected!: Node | Transition;
    private _selectedType!: 'Node' | 'Transition';

    private _errors: AutomatonInfo[] = [];
    public get errors(): AutomatonInfo[] {
        return this._errors;
    }

    private _currentError!: {
        offset: {
            x: number;
            y: number;
        };
        message: string;
    } | null;

    private _requestUpdate: () => void = () => {};
    public set requestUpdate(fn: () => void) {
        this._requestUpdate = () => {
            this._errors = this._a.checkAutomaton();
            if (!this._errors.some((e) => e.node?.id === this._hovered?.id)) {
                this._currentError = null;
            }

            fn();
            this.displayErrors();
        };

        this._cm.requestUpdate = this._requestUpdate;
    }
    public get requestUpdate(): () => void {
        return this._requestUpdate;
    }

    constructor(e: HTMLElement, a: Automaton, tm: ToolMenu, ac: AutomatonComponent) {
        this._a = a;
        this._ac = ac;
        this._tm = tm;
        this._cm = new ContextMenu();
        this._cm.requestUpdate = this._requestUpdate;

        const options = {
            physics: false,
            nodes: {
                shape: 'circle',
                ctxRenderer: DRAW.ctx.doubleCircle,
                color: {
                    background: 'white',
                    border: 'black',
                    hover: COLORS.blue,
                    highlight: COLORS.blue,
                },
                heightConstraint: { minimum: 40 },
                widthConstraint: { minimum: 40 },
            },
            edges: {
                color: 'black',
                smooth: {
                    enabled: true,
                    type: 'curvedCW',
                    forceDirection: 'none',
                    roundness: 0,
                },
                arrows: 'to',
                font: {},
            },
            layout: {
                randomSeed: 1,
            },
            interaction: { hover: true },
            manipulation: {
                enabled: true,
                addNode: this._tm.handleNodeAdd.bind(this._tm),
                addEdge: this._tm.handleTransitionAdd.bind(this._tm),
            },
        };

        this._n = new Network(e, a.getGraphData(), options);
        this._errors = this._a.checkAutomaton();
        this.displayErrors();
        this.setupListeners();
    }

    public setAutomaton(automaton: Automaton): void {
        this._a = automaton;
        this._n.setData(this._a.getGraphData());
        this._a.redrawNodes();
        this.requestUpdate();
    }

    static initialGhostNode: Node = {
        id: uuidv4(),
        label: '',
        x: -100,
        y: -100,
        initial: false,
        final: false,
    };

    private cmUpdate(data: Node | Transition) {
        if (this._selectedType === 'Node') {
            if (!data.label) this._a.updateNode(data.id, { ...(data as Node), label: undefined });
            else this._a.updateNode(data.id, data as Node);
        } else if (this._selectedType === 'Transition') {
            if (!data.label) this._a.updateTransition(data.id, { ...(data as Transition), label: undefined });
            this._a.updateTransition(data.id, data as Transition);
        }
        this._requestUpdate();
    }

    private cmDelete() {
        AutomatonComponent.log('Deleting', this._selected);

        if (this._selectedType === 'Node') {
            this._a.removeNode(this._selected.id);
        } else if (this._selectedType === 'Transition') {
            this._a.removeTransition(this._selected.id);
        }
        this._requestUpdate();
    }

    private setupListeners() {
        this._n.on('click', () => {
            this._cm.blur();
        });
        this._n.on('oncontext', (e: any) => {
            e.event.preventDefault();

            if (!this._hovered) {
                this._cm.blur();
                return;
            }

            if (
                this._hovered.id === Graph.initialGhostNode.id ||
                (this._hoveredType === 'Transition' && (this._hovered as Transition).from === Graph.initialGhostNode.id)
            ) {
                return;
            }

            this._selected = this._hovered;
            this._selectedType = this._hoveredType;
            this._cm.setData(this._selected, this._selectedType, this.cmUpdate.bind(this), this.cmDelete.bind(this));
            this._cm.setPosition(e.pointer.DOM);
            if (this._selectedType === 'Node') {
                this._n.selectNodes([this._selected.id]);
            } else if (this._selectedType === 'Transition') {
                this._n.selectEdges([this._selected.id]);
            }
            this._cm.show();
        });
        this._n.on('hoverNode', (e: any) => {
            this._hovered = this._a.getNode(e.node as string);
            this._hoveredType = 'Node';

            if (this._errors.some((e) => e.node?.id === this._hovered?.id)) {
                this._currentError = {
                    offset: this._n.canvasToDOM({
                        x: (this._hovered?.x as number) + 15,
                        y: (this._hovered?.y as number) + 15,
                    }),
                    message: this._errors.find((e) => e.node?.id === this._hovered?.id)?.message || '',
                };
                this.requestUpdate();
            }
        });
        this._n.on('blurNode', () => {
            this._hovered = null;
            this._currentError = null;
            this.requestUpdate();
        });
        this._n.on('hoverEdge', (e: any) => {
            this._hovered = this._a.getTransition(e.edge);
            this._hoveredType = 'Transition';
        });
        this._n.on('blurEdge', () => {
            this._hovered = null;
        });
        this._n.on('dragStart', (e: any) => {
            this._currentError = null;
            this._cm.blur();
            this.requestUpdate();
        });
        this._n.on('dragEnd', (e: any) => {
            this._n.storePositions();
        });
    }

    private displayErrors() {
        this._a.redrawNodes();
        for (const error of this._errors) {
            if (error.type === 'error' && error.node) {
                this._a.highlightErrorNode(error.node.id);
            }
        }
        this._n.redraw();
    }

    public renderErrorDisplay() {
        return html`<sl-alert
            class="errordisplay"
            variant="danger"
            style=${styleMap({
                display: this._currentError ? 'block' : 'none',
                left: `${this._currentError?.offset.x}px`,
                top: `${this._currentError?.offset.y}px`,
            })}
            open
            >${biExclamationOctagon} ${unsafeHTML(this._currentError?.message)}</sl-alert
        >`;
    }
}
