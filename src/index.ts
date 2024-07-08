import { html, LitElement, PropertyDeclaration, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
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
import SlRange from '@shoelace-style/shoelace/dist/components/range/range.component.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.component.js';

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

import { guard } from 'lit/directives/guard.js';
import { SlChangeEvent } from '@shoelace-style/shoelace';
import { checkIfNodesUpdated, checkIfTransitionsUpdated, stripNode, stripTransition } from './utils/updates';
import { NFA } from './automata/nfa';
import { PDA, StackExtension } from './automata/pda';

import { debounce } from 'lodash';

@customElement('webwriter-automaton')
/**
 * Represents an Automaton Component.
 * This component is responsible for rendering and managing the automaton editor and simulator.
 */
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
    public forcedAlphabet: string[] = [];

    @property({ type: Array, attribute: true, reflect: true })
    public testWords: string[] = [];

    @property({ type: Boolean, attribute: true, reflect: false })
    public set verbose(v: boolean) {
        AutomatonComponent.verbose = v;
    }

    @property({ type: String, attribute: true, reflect: true })
    public permissions: string = '777';

    @property({ type: String, attribute: true, reflect: true })
    public showHelp: string = 'true';

    @property({ type: String, attribute: true, reflect: true })
    public showFromalDefinition: string = 'true';

    @property({ type: String, attribute: true, reflect: true })
    public showTransitionsTable: string = 'true';

    @property({ type: Array, attribute: true, reflect: true })
    public allowedTypes: string[] = ['dfa', 'nfa', 'pda'];

    @property({ type: Array, attribute: true, reflect: true })
    public allowedTransformations: string[] = ['sink'];

    public static verbose: boolean = false;
    public get verbose() {
        return AutomatonComponent.verbose;
    }

    @state()
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

    @property({ type: Boolean, attribute: false })
    private _helpOverlay: boolean = false;

    public set helpOverlay(h: boolean) {
        this._helpOverlay = h;
        this.toolMenu.visible = h ? true : this.toolMenu.visible;
    }

    public set automaton(a: Automaton) {
        this._automaton = a;
        this.type = a.type;
        this.setUpListeners(this._automaton);
        this._graph?.setAutomaton(this._automaton);
        if (this.simulatorMenu) this.simulatorMenu.automaton = this._automaton;
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
            'webwriter-automaton-toolmenu': ToolMenu,
            'webwriter-automaton-simulatormenu': SimulatorMenu,
            'webwriter-automaton-infomenu': InfoMenu,
            'webwriter-automaton-topmenu': TopMenu,
            'stack-extension': StackExtension,
            'sl-icon': SlIcon,
            'sl-icon-button': SlIconButton,
            'sl-popup': SlPopup,
            'sl-tag': SlTag,
            'sl-range': SlRange,
            'sl-switch': SlSwitch,
        };
    }

    constructor() {
        super();

        AutomatonComponent.verbose = this.verbose;

        AutomatonComponent.log('constructor');
    }

    /**
     * Lifecycle callback called after the element's first update.
     * @param _changedProperties - Map of properties that have changed with their previous values.
     */
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

    /**
     * This method is called before the component updates. It handles the logic for updating the automaton based on the changed properties.
     *
     * @param _changedProperties - A map of changed properties.
     */
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

        if (_changedProperties.has('showHelp')) {
            this.automaton.showErrors = this.showHelp === 'true';
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

    /**
     * Renders the component and returns a TemplateResult.
     * @returns {TemplateResult} The rendered TemplateResult.
     */
    public render(): TemplateResult {
        return html`
            ${this.renderEditor()} ${this.isContentEditable ? guard([this.settings], () => this.renderSettings()) : ''}
        `;
    }

    private renderEditor(): TemplateResult {
        return html`
            <div class="editor">
                ${this._helpOverlay ? this.renderHelpOverlay() : ''}
                <div id="graphCanvas"></div>
                ${this._graph?.contextMenu.render()} ${this.renderModeSwitch()} ${this._graph?.renderErrorDisplay()}
                <!-- <webwriter-automaton-infomenu id="infoMenu"></webwriter-automaton-infomenu> -->
                <webwriter-automaton-topmenu id="topMenu"></webwriter-automaton-topmenu>
                <webwriter-automaton-simulatormenu
                    id="simulatorMenu"
                    style=${styleMap({ display: this._mode === 'simulate' ? 'flex' : 'none' })}
                ></webwriter-automaton-simulatormenu>
                <webwriter-automaton-toolmenu
                    id="toolMenu"
                    style=${styleMap({ display: this._mode === 'edit' ? 'flex' : 'none' })}
                ></webwriter-automaton-toolmenu>
                ${guard([this.permissions, this.automaton], () => this.automaton.extension)}
            </div>
        `;
    }

    /**
     * Renders the settings section of the component.
     * @returns {TemplateResult} The rendered settings section.
     */
    private renderSettings(): TemplateResult {
        return html` <aside class="settings" part="options">${this.settings.render()}</aside> `;
    }

    /**
     * Renders the help overlay.
     * @returns {TemplateResult} The rendered help overlay.
     */
    private renderHelpOverlay(): TemplateResult {
        return html`
            <div class="help-backdrop"></div>
            <div class="help-overlay">
                <sl-tag size="small" style="top:50px;left:10px">Mode Switch</sl-tag>

                <sl-tag size="small" style="top: 228px;right:10px">Fullscreen</sl-tag>
                <div class="line" style="top: 55px;right: 30px;height: 164px;"></div>

                <sl-tag size="small" style="top:18px;right:325px">Type</sl-tag>
                <div class="line" style="top:28px;right:310px;width:10px"></div>

                <sl-tag size="small" style="top:60px;right:325px">Transformations</sl-tag>
                <div class="line" style="top:55px;right:230px;width:90px;height:15px"></div>

                <sl-tag size="small" style="top: 186px;right: 325px;">Help</sl-tag>
                <div class="line" style="top: 55px;right: 80px;width: 240px;height: 141px;"></div>

                <sl-tag size="small" style="top: 144px;right: 325px;">Test Cases</sl-tag>
                <div class="line" style="top: 55px;right: 130px;width: 190px;height: 99px;"></div>

                <sl-tag size="small" style="top: 102px;right: 325px;">Definition</sl-tag>
                <div class="line" style="top: 55px;right: 180px;width: 140px;height: 57px;"></div>
            </div>

            <div class="help-overlay" style=${styleMap({ display: this._mode === 'edit' ? 'block' : 'none' })}>
                <sl-tag size="small" style="bottom: 77px;left: 80px;">Add Node by click</sl-tag>
                <sl-tag size="small" style="bottom: 128px;left: 80px;">Add Transition by drag and drop</sl-tag>

                <sl-tag size="small" style="bottom: 110px;right: 30px;">Move the elements by drag and drop</sl-tag>
                <sl-tag size="small" style="bottom: 70px;right: 30px;">To edit a node right click the node</sl-tag>
                <sl-tag size="small" style="bottom: 30px;right: 30px;"
                    >To edit a transition right click the transition</sl-tag
                >
            </div>

            <div class="help-overlay" style=${styleMap({ display: this._mode === 'simulate' ? 'block' : 'none' })}>
                <sl-tag size="small" style="bottom: 60px;left: 10px;">Input word</sl-tag>
                <sl-tag size="small" style="bottom: 60px;left: 10px;">Simulation Controls</sl-tag>
            </div>
        `;
    }

    /**
     * Called when the element is updated.
     * @param _changedProperties - A map of changed properties.
     */
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
    }

    /**
     * Renders the mode switch component.
     * @returns {TemplateResult} The rendered mode switch component.
     */
    private renderModeSwitch(): TemplateResult {
        return html`<sl-button-group class="mode_switch" label="Mode">
            <sl-select
                size="small"
                class="mode_switch__select"
                value=${this._mode}
                .value=${this._mode}
                defaultValue="${this._mode}"
                @sl-change=${(e: SlChangeEvent) => {
                    this.setMode((e.target as SlSelect).value as 'edit' | 'simulate');
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

    /**
     * Toggles the mode between 'edit' and 'simulate'.
     */
    public toggleMode() {
        this.setMode(this._mode === 'edit' ? 'simulate' : 'edit');
    }

    /**
     * Sets the mode of the automaton.
     * @param mode - The mode to set. Can be either 'edit' or 'simulate'.
     */
    private setMode(mode: 'edit' | 'simulate') {
        this._mode = mode;

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
    }

    /**
     * Sets up the listeners for the automaton.
     * @param a The automaton object.
     */
    private setUpListeners(a: Automaton) {
        /**
         * Updates the attributes of the graph by filtering and mapping the nodes and transitions
         * based on certain conditions.
         */
        const updateAttributes = () => {
            this.nodes = this.automaton.nodes
                .get()
                .filter((n) => n.id !== Graph.initialGhostNode.id)
                .map(stripNode);
            this.nodes = [...this.nodes];
            this.transitions = this.automaton.transitions
                .get()
                .filter((t) => t.from !== Graph.initialGhostNode.id)
                .map(stripTransition);
            this.transitions = [...this.transitions];
        };

        a.nodes.on('*', debounce(updateAttributes, 200));
        a.transitions.on('*', debounce(updateAttributes, 200));
    }

    /**
     * Logs the provided arguments to the console if the `verbose` flag is set to true.
     * @param args - The arguments to be logged.
     */
    static log(...args: any[]) {
        if (this.verbose) {
            DEV: console.log('[webwriter-automaton]', ...args);
        }
    }
}
