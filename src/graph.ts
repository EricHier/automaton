import { Transition, Node, Automaton, AutomatonInfo } from './automata';
import { Network, Position } from 'vis-network';
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

/**
 * Represents a graph that combines an automaton, network, and other components.
 */
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

    private _interactive: boolean = true;

    private _tm: ToolMenu;

    private _hovered!: Node | Transition | null;
    private _hoveredType!: 'Node' | 'Transition';

    private _selected!: Node | Transition;
    private _selectedType!: 'Node' | 'Transition';

    private _keys: Map<string, boolean> = new Map();

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

    private _lastPosition: Position = { x: 0, y: 0 };

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
        this._cm = new ContextMenu(ac);
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

    /**
     * Sets the interactive mode of the graph.
     * @param interactive - A boolean value indicating whether the graph should be interactive or not.
     */
    public setInteractve(interactive: boolean): void {
        this._interactive = interactive;
        if (this._interactive) {
            this._n.setOptions({
                interaction: {
                    dragNodes: true,
                    // dragView: true,
                    // zoomView: true,
                },
            });
        } else {
            this._n.setOptions({
                interaction: {
                    dragNodes: false,
                    // dragView: false,
                    // zoomView: false,
                },
            });
        }
    }

    /**
     * Sets the automaton for the graph.
     *
     * @param automaton - The automaton to set.
     */
    public setAutomaton(automaton: Automaton): void {
        this._a = automaton;
        this._n.setData(this._a.getGraphData());
        this._a.redrawNodes();
        this.requestUpdate();
    }

    /**
     * Represents the initial ghost node in the graph.
     */
    static initialGhostNode: Node = {
        id: uuidv4(),
        label: '',
        x: -100,
        y: -100,
        initial: false,
        final: false,
    };

    /**
     * Updates the selected data (either a Node or a Transition) in the graph.
     *
     * @param data - The data (Node or Transition) to be updated.
     */
    private updateSelectedData(data: Node | Transition) {
        if (this._selectedType === 'Node') {
            if (!data.label) this._a.updateNode(data.id, { ...(data as Node), label: undefined });
            else this._a.updateNode(data.id, data as Node);

            this._selected = this._a.getNode(data.id) as Node;
        } else if (this._selectedType === 'Transition') {
            if (!data.label) this._a.updateTransition(data.id, { ...(data as Transition), label: undefined });
            this._a.updateTransition(data.id, data as Transition);

            this._selected = this._a.getTransition(data.id) as Transition;
        }
        this._requestUpdate();
    }

    /**
     * Deletes the selected node or transition from the automaton.
     */
    private deleteSelected() {
        AutomatonComponent.log('Deleting', this._selected);

        if (this._selectedType === 'Node') {
            this._a.removeNode(this._selected.id);
        } else if (this._selectedType === 'Transition') {
            this._a.removeTransition(this._selected.id);
        }
        this._requestUpdate();

        if (this._tm.mode === 'addEdge') {
            this.network.addEdgeMode();
        }

        this._cm.blur();
        this._selected = null as any;
    }

    /**
     * Sets up event listeners for the graph.
     * This method handles various events such as click, context menu, node selection, node hover, etc.
     * It also handles keyboard events for adding nodes, adding edges, deleting selected elements, etc.
     */
    private setupListeners() {
        this._n.on('click', () => {
            this._cm.blur();
        });
        this._n.on('oncontext', (e: any) => {
            e.event.preventDefault();

            if (!this._interactive) return;

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
            this._cm.setData(
                this._selected,
                this._selectedType,
                this.updateSelectedData.bind(this),
                this.deleteSelected.bind(this)
            );
            this._cm.setPosition(e.pointer.DOM);
            if (this._selectedType === 'Node') {
                this._n.selectNodes([this._selected.id]);
            } else if (this._selectedType === 'Transition') {
                this._n.selectEdges([this._selected.id]);
            }
            this._cm.show();
        });
        this._n.on('selectNode', (e: any) => {
            this._selected = this._a.getNode(e.nodes[0]) as Node;
            this._selectedType = 'Node';
        });
        this._n.on('hoverNode', (e: any) => {
            this._hovered = this._a.getNode(e.node as string);
            this._hoveredType = 'Node';

            if (this._ac.showHelp == 'false') return;

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
            this._lastPosition = this._n.getViewPosition();
        });
        this._n.on('zoom', (e: any) => {
            if (e.scale < 0.5) {
                this._n.moveTo({ scale: 0.5, position: this._lastPosition });
            } else if (e.scale > 5) {
                this._n.moveTo({ scale: 5, position: this._lastPosition });
            } else {
                this._lastPosition = this._n.getViewPosition();
            }
        });
        this._ac.addEventListener('keyup', (e: KeyboardEvent) => {
            this._keys.set(e.key, false);
        });
        this._ac.addEventListener('keydown', (e: KeyboardEvent) => {
            this._keys.set(e.key, true);

            if (this._keys.get('Delete') && this._selected) {
                this.deleteSelected();
            }

            if (this._keys.get('Escape')) {
                this._cm.blur();
                this._tm.mode = 'idle';
            }

            if (this._keys.get('Control') && this._keys.get('Tab')) {
                this._ac.toggleMode();
            }

            if (this._keys.get('s') && this._keys.get('Control') && !this._keys.get('ShiftLeft')) {
                this._tm.addNode();
                this._tm.visible = true;
            }

            if (this._keys.get('Control') && this._keys.get('s') && this._keys.get('ShiftLeft')) {
                this._tm.lockNodeAdd = !this._tm.lockNodeAdd;
                this._tm.visible = true;
            }

            if (this._keys.get('t') && this._keys.get('Control') && !this._keys.get('ShiftLeft')) {
                this._tm.addEdge();
                this._tm.visible = true;
            }

            if (this._keys.get('Control') && this._keys.get('t') && this._keys.get('ShiftLeft')) {
                this._tm.lockEdgeAdd = !this._tm.lockEdgeAdd;
                this._tm.visible = true;
            }

            if (this._keys.get('ArrowLeft') && this._selected && this._selectedType === 'Node') {
                const x = (this._selected as Node).x || 0;
                this.updateSelectedData({ ...this._selected, x: x - 10 });
            }

            if (this._keys.get('ArrowRight') && this._selected && this._selectedType === 'Node') {
                const x = (this._selected as Node).x || 0;
                this.updateSelectedData({ ...this._selected, x: x + 10 });
            }

            if (this._keys.get('ArrowUp') && this._selected && this._selectedType === 'Node') {
                const y = (this._selected as Node).y || 0;
                this.updateSelectedData({ ...this._selected, y: y - 10 });
            }

            if (this._keys.get('ArrowDown') && this._selected && this._selectedType === 'Node') {
                const y = (this._selected as Node).y || 0;
                this.updateSelectedData({ ...this._selected, y: y + 10 });
            }
        });
    }

    /**
     * Displays the errors in the graph by highlighting the error nodes.
     */
    private displayErrors() {
        this._a.redrawNodes();
        for (const error of this._errors) {
            if (error.type === 'error' && error.node) {
                this._a.highlightErrorNode(error.node.id);
            }
        }
        this._n.redraw();
    }

    /**
     * Renders the error display.
     * @returns The HTML representation of the error display.
     */
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
