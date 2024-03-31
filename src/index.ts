import { html, LitElement, PropertyDeclaration, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { LitElementWw } from '@webwriter/lit';

import { styles } from './styles/styles';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlDetails from '@shoelace-style/shoelace/dist/components/details/details.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';
import SlCheckbox from '@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import SlButtonGroup from '@shoelace-style/shoelace/dist/components/button-group/button-group.component.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.component.js';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.component.js';
import SlOption from '@shoelace-style/shoelace/dist/components/option/option.component.js';

import SlIcon from '@shoelace-style/shoelace/dist/components/icon/icon.component.js';
import SlIconButton from '@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js';
import SlPopup from '@shoelace-style/shoelace/dist/components/popup/popup.component.js';
import SlTag from '@shoelace-style/shoelace/dist/components/tag/tag.component.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.component.js';

import '@shoelace-style/shoelace/dist/themes/light.css';

import { DFA } from './automata/dfa';
import { Automaton, Node, Transition } from './automata';
import { Graph } from './graph';

import { TopMenu } from './components/TopMenu';
import { ToolMenu } from './components/ToolMenu';
import { InfoMenu } from './components/InfoMenu';
import { SimulatorMenu } from './components/SimulatorMenu';

import { Settings } from './components/Settings';

import { biBoxes, biExclamationTriangle, biPencil } from './styles/icons';

import { styleMap } from 'lit/directives/style-map.js';

import { cache } from 'lit/directives/cache.js';
import { keyed } from 'lit/directives/keyed.js';
import { guard } from 'lit/directives/guard.js';
import { SlChangeEvent } from '@shoelace-style/shoelace';
import { checkIfNodesUpdated, checkIfTransitionsUpdated, stripNode, stripTransition } from './utils/updates';
import { NFA } from './automata/nfa';
import { PDA, StackExtension } from './automata/pda';

import RandExp from 'randexp';

@customElement('ww-automaton')
export class AutomatonComponent extends LitElementWw {
    @query('#graphCanvas') private graphCanvas!: HTMLElement;
    @query('#toolMenu') private toolMenu!: ToolMenu;
    @query('#simulatorMenu') private simulatorMenu!: SimulatorMenu;
    @query('#infoMenu') private infoMenu!: InfoMenu;
    @query('#topMenu') private topMenu!: TopMenu;

    @property({
        type: Array,
        attribute: true,
        reflect: true,
        hasChanged: checkIfNodesUpdated,
    })
    public nodes: Node[] = [];

    @property({
        type: Array,
        attribute: true,
        reflect: true,
        hasChanged: checkIfTransitionsUpdated,
    })
    public transitions: Transition[] = [];

    @property({ type: Object, attribute: false })
    extension: any;

    @property({ type: String, attribute: true, reflect: true })
    public type: string = 'dfa';

    @property({ type: String, attribute: true, reflect: true })
    public testLanguage: string = '';

    @property({ type: Array, attribute: true, reflect: true })
    public testWords: string[] = [];

    @property({ type: Boolean, attribute: true, reflect: false })
    public set verbose(v: boolean) {
        AutomatonComponent.verbose = v;
    }

    @property({ type: String, attribute: true, reflect: true })
    public permissions: string = '777';

    public get verbose() {
        return AutomatonComponent.verbose;
    }

    static verbose: boolean = false;

    @property({ type: Object, attribute: false })
    private _graph!: Graph;
    public set graph(g: Graph) {
        this._graph = g;
    }
    public get graph() {
        return this._graph;
    }

    public settings = new Settings(this);

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    @property({ type: Object, attribute: false })
    private _automaton: Automaton = new DFA([], []);

    public set automaton(a: Automaton) {
        this._automaton = a;
        this.type = a.type;
        this.setUpListeners(this._automaton);
        this._graph?.setAutomaton(this._automaton);
        if (this.simulatorMenu) this.simulatorMenu.automaton = this._automaton;
        // if (this._automaton.extension) {
        //     this._automaton.extension.component = this;
        //     this._automaton.extension.requestUpdate = () => this.requestUpdate();
        // }
        AutomatonComponent.log('Automaton set', this._automaton.transitions.get());
    }
    public get automaton() {
        return this._automaton;
    }

    @property({ type: String, attribute: false })
    private _mode: 'edit' | 'simulate' = 'edit';

    public static get styles() {
        return styles;
    }

    public static get scopedElements() {
        return {
            'sl-button': SlButton,
            'sl-button-group': SlButtonGroup,
            'sl-details': SlDetails,
            'sl-input': SlInput,
            'sl-checkbox': SlCheckbox,
            'sl-tooltip': SlTooltip,
            'sl-alert': SlAlert,
            'sl-select': SlSelect,
            'sl-option': SlOption,
            'sl-dialog': SlDialog,
            'ww-automaton-toolmenu': ToolMenu,
            'ww-automaton-simulatormenu': SimulatorMenu,
            'ww-automaton-infomenu': InfoMenu,
            'ww-automaton-topmenu': TopMenu,
            'stack-extension': StackExtension,
            'sl-icon': SlIcon,
            'sl-icon-button': SlIconButton,
            'sl-popup': SlPopup,
            'sl-tag': SlTag,
        };
    }

    constructor() {
        super();

        AutomatonComponent.verbose = this.verbose;

        AutomatonComponent.log('constructor');
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);

        this._graph = new Graph(this.graphCanvas, this.automaton, this.toolMenu, this);
        this._graph.requestUpdate = () => this.requestUpdate();
        this.toolMenu.graph = this._graph;
        this.topMenu.component = this;
        this.simulatorMenu.automaton = this.automaton;
        this.simulatorMenu.graph = this._graph;

        this.settings = new Settings(this);
        this.settings.numberStringToPermissions(this.permissions);

        if (this.automaton.extension) {
            this.automaton.extension.contentEditable = 'true';
            (this.automaton.extension as StackExtension).add = this.settings.permissions.stack.add;
            (this.automaton.extension as StackExtension).delete = this.settings.permissions.stack.delete;
            (this.automaton.extension as StackExtension).change = this.settings.permissions.stack.change;
        }

        AutomatonComponent.log('first updated');
    }

    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.willUpdate(_changedProperties);

        if (_changedProperties.has('type')) {
            if (this.type === 'dfa') this.automaton = new DFA(this.nodes, this.transitions);
            if (this.type === 'nfa') this.automaton = new NFA(this.nodes, this.transitions);
            if (this.type === 'pda') this.automaton = new PDA(this.nodes, this.transitions);
        }

        if (_changedProperties.has('nodes') || _changedProperties.has('transitions')) {
            this.automaton.updateAutomaton(this.nodes, this.transitions);
        }

        if (this.automaton && this.automaton.extension) {
            (this.automaton.extension as StackExtension).add = this.settings.permissions.stack.add;
            (this.automaton.extension as StackExtension).delete = this.settings.permissions.stack.delete;
            (this.automaton.extension as StackExtension).change = this.settings.permissions.stack.change;
        }

        AutomatonComponent.log('will update');
    }

    requestUpdate(
        name?: PropertyKey | undefined,
        oldValue?: unknown,
        options?: PropertyDeclaration<unknown, unknown> | undefined
    ): void {
        super.requestUpdate(name, oldValue, options);
        this.toolMenu?.requestUpdate();
        this.simulatorMenu?.requestUpdate();
        this.infoMenu?.requestUpdate();
        this.topMenu?.requestUpdate();
    }

    public render(): TemplateResult {
        return html` ${this.renderEditor()} ${guard([this.settings], () => this.renderSettings())} `;
    }

    private renderEditor(): TemplateResult {
        return html`
            <div class="editor">
                <div id="graphCanvas"></div>
                ${this._graph?.contextMenu.render()} ${this.renderModeSwitch()} ${this._graph?.renderErrorDisplay()}
                <!-- <ww-automaton-infomenu id="infoMenu"></ww-automaton-infomenu> -->
                <ww-automaton-topmenu id="topMenu"></ww-automaton-topmenu>
                <ww-automaton-simulatormenu
                    id="simulatorMenu"
                    style=${styleMap({ display: this._mode === 'simulate' ? 'flex' : 'none' })}
                ></ww-automaton-simulatormenu>
                <ww-automaton-toolmenu
                    id="toolMenu"
                    style=${styleMap({ display: this._mode === 'edit' ? 'flex' : 'none' })}
                ></ww-automaton-toolmenu>
                ${guard([this.permissions, this.automaton], () => this.automaton.extension)}
            </div>
        `;
    }

    private renderSettings(): TemplateResult {
        return html` <aside class="settings" part="options">${this.settings.render()}</aside> `;
    }

    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
    }

    private renderModeSwitch(): TemplateResult {
        return html`<sl-button-group class="mode_switch" label="Mode">
            <sl-select
                size="small"
                class="mode_switch__select"
                value=${this._mode}
                defaultValue="${this._mode}"
                @sl-change=${(e: SlChangeEvent) => {
                    this._mode = (e.target as SlSelect).value as 'edit' | 'simulate';
                    if (this._mode === 'edit') {
                        this.simulatorMenu.reset();
                        this._graph.requestUpdate();
                        this._graph.setInteractve(true);
                        if (this.automaton.extension) this.automaton.extension.contentEditable = 'true';
                    }

                    if (this._mode === 'simulate') {
                        this.automaton.redrawNodes();
                        this.simulatorMenu.init();
                        this._graph.setInteractve(false);
                        this.automaton.highlightNode(this.automaton.getInitialNode());
                        if (this.automaton.extension) this.automaton.extension.contentEditable = 'false';
                    }
                }}
            >
                <span slot="prefix">${this._mode === 'edit' ? biPencil : biBoxes}</span>
                <sl-option value=${'edit'} selected> <span slot="prefix">${biPencil}</span> Edit </sl-option>
                <sl-option value=${'simulate'}> <span slot="prefix">${biBoxes}</span> Simulate </sl-option>
            </sl-select>
            <div
                class="mode_switch__error_indicator"
                style=${this._graph?.errors.length > 0 ? 'display: block' : 'display: none'}
            >
                ${biExclamationTriangle}
            </div>
        </sl-button-group>`;
    }

    private setUpListeners(a: Automaton) {
        a.nodes.on('*', (_, __) => {
            this.nodes = this.automaton.nodes
                .get()
                .filter((n) => n.id !== Graph.initialGhostNode.id)
                .map(stripNode);
            this.nodes = [...this.nodes];
        });

        a.transitions.on('*', (_, __) => {
            this.transitions = this.automaton.transitions
                .get()
                .filter((t) => t.from !== Graph.initialGhostNode.id)
                .map(stripTransition);
            this.transitions = [...this.transitions];
        });
    }

    static log(...args: any[]) {
        if (this.verbose) {
            console.log('[ww-automaton]', ...args);
        }
    }
}
