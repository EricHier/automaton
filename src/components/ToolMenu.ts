import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { biLock, biNodePlus, biPlus, biShare, biUnlock } from '../styles/icons';

import '@shoelace-style/shoelace/dist/themes/light.css';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import { Graph } from '../graph';
import { toolMenuStyles } from '../styles/toolMenu';
import { LitElementWw } from '@webwriter/lit';

@customElement('webwriter-automaton-toolmenu')
export class ToolMenu extends LitElementWw {
    @property({ type: Boolean, attribute: false })
    private accessor _visible = false;
    public set visible(visible: boolean) {
        this._visible = visible;
    }

    @property({ type: String, attribute: false })
    private accessor _mode: 'idle' | 'addNode' | 'addEdge' = 'idle';
    public set mode(mode: 'idle' | 'addNode' | 'addEdge') {
        this._mode = mode;
    }
    public get mode() {
        return this._mode;
    }

    @property({ type: Object, attribute: false })
    private accessor _graph!: Graph;
    public set graph(graph: Graph) {
        this._graph = graph;
    }

    @property({ type: Boolean, attribute: false })
    private accessor _lockNodeAdd = false;
    public set lockNodeAdd(lockNodeAdd: boolean) {
        this._lockNodeAdd = lockNodeAdd;
    }
    public get lockNodeAdd() {
        return this._lockNodeAdd;
    }

    @property({ type: Boolean, attribute: false })
    private accessor _lockEdgeAdd = false;
    public set lockEdgeAdd(lockEdgeAdd: boolean) {
        this._lockEdgeAdd = lockEdgeAdd;
    }
    public get lockEdgeAdd() {
        return this._lockEdgeAdd;
    }

    public static get styles() {
        return toolMenuStyles;
    }

    public static get scopedElements() {
        return {
            'sl-button': SlButton,
            'sl-badge': SlBadge,
            'sl-tooltip': SlTooltip,
        };
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        if (this._mode === 'addNode') {
            this._graph.network.addNodeMode();
        }

        if (this._mode === 'idle') {
            this._graph.network.disableEditMode();
        }
    }

    render() {
        return html` <div
            class="toolmenu"
            style=${styleMap({
                display:
                    this._graph.component.settings.permissions.node.add ||
                    this._graph.component.settings.permissions.edge.add
                        ? 'flex'
                        : 'none',
            })}
        >
            <sl-button class="toolmenu__button" @click=${this.toggleToolbar} circle size="large">${biPlus}</sl-button>
            <div class="toolmenu__buttons" style=${styleMap({ display: this._visible ? 'flex' : 'none' })}>
                <sl-tooltip content="Add node" placement="right">
                    <sl-button
                        class="toolmenu__button"
                        @click=${this.addNode}
                        variant=${this._mode === 'addNode' ? 'primary' : 'default'}
                        circle
                        style=${styleMap({
                            display: this._graph.component.settings.permissions.node.add ? 'block' : 'none',
                        })}
                        >${biNodePlus}
                        <sl-button
                            size="small"
                            variant=${this._lockNodeAdd ? 'primary' : 'default'}
                            circle
                            @click=${(e: any) => {
                                e.stopPropagation();
                                this._lockNodeAdd = !this._lockNodeAdd;
                            }}
                            >${this._lockNodeAdd ? biLock : biUnlock}</sl-button
                        >
                    </sl-button>
                </sl-tooltip>
                <sl-tooltip content="Add edge" placement="right">
                    <sl-button
                        class="toolmenu__button"
                        @click=${this.addEdge}
                        variant=${this._mode === 'addEdge' ? 'primary' : 'default'}
                        circle
                        style=${styleMap({
                            display: this._graph.component.settings.permissions.edge.add ? 'block' : 'none',
                        })}
                        >${biShare}
                        <sl-button
                            size="small"
                            variant=${this._lockEdgeAdd ? 'primary' : 'default'}
                            circle
                            @click=${(e: any) => {
                                e.stopPropagation();
                                this._lockEdgeAdd = !this._lockEdgeAdd;
                            }}
                            >${this._lockEdgeAdd ? biLock : biUnlock}</sl-button
                        >
                    </sl-button>
                </sl-tooltip>
            </div>
        </div>`;
    }

    public handleNodeAdd(nodeData: any, callback: any) {
        nodeData.label = this._graph.automaton.getNewNodeLabel();
        callback(nodeData);
        if (!this._lockNodeAdd) {
            this._mode = 'idle';
            this._graph.network.disableEditMode();
        } else {
            this._graph.network.addNodeMode();
        }
        this._graph.network.unselectAll();
        this._graph.requestUpdate();
    }

    public handleTransitionAdd(edgeData: any, callback: any) {
        if (edgeData.to === Graph.initialGhostNode.id || edgeData.from === Graph.initialGhostNode.id) return;

        const edge = this._graph.automaton.transitions.get().find((t) => {
            return t.from === edgeData.from && t.to === edgeData.to;
        });

        const reflection = this._graph.automaton.transitions.get().find((t) => {
            return t.from === edgeData.to && t.to === edgeData.from;
        });

        if (reflection) {
            this._graph.automaton.transitions.update({
                ...reflection,
                smooth: { type: 'curvedCW', roundness: 0.2 },
            });
            if (edge) {
                this._graph.automaton.transitions.update({
                    ...edge,
                    smooth: { type: 'curvedCW', roundness: 0.2 },
                });
            } else {
                edgeData.smooth = { type: 'curvedCW', roundness: 0.2 };
            }
        }

        const newSymbol = this._graph.component.forcedAlphabet[0] || 'a';
        if (edge) {
            if (this._graph.automaton.type === 'pda') {
                this._graph.automaton.transitions.update({
                    ...edge,
                    symbols: [...edge.symbols, newSymbol],
                    stackOperations: [
                        ...edge.stackOperations!,
                        { operation: 'none', symbol: newSymbol, condition: '' },
                    ],
                });
            } else {
                this._graph.automaton.transitions.update({
                    ...edge,
                    symbols: [...edge.symbols, newSymbol],
                });
            }
        } else {
            edgeData.symbols = [newSymbol];

            if (this._graph.automaton.type === 'pda') {
                edgeData.stackOperations = [{ operation: 'none', symbol: newSymbol }];
            }
            // edgeData.label = 'a';
            callback(edgeData);
        }

        if (!this._lockEdgeAdd) {
            this._mode = 'idle';
            this._graph.network.disableEditMode();
        } else {
            this._graph.network.addEdgeMode();
        }
        this._graph.network.unselectAll();
        this._graph.network.redraw();
        this._graph.requestUpdate();
    }

    private toggleToolbar() {
        this._visible = !this._visible;
        this.requestUpdate();
    }

    public addNode() {
        if (this._mode === 'addNode') {
            this._mode = 'idle';
            this._graph.network.disableEditMode();
            return;
        }

        this._mode = 'addNode';
        this._graph.network.addNodeMode();
    }

    public addEdge() {
        if (this._mode === 'addEdge') {
            this._mode = 'idle';
            this._graph.network.disableEditMode();
            return;
        }

        this._mode = 'addEdge';
        this._graph.network.addEdgeMode();
    }
}
