import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/themes/light.css';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';
import SlBadge from '@shoelace-style/shoelace/dist/components/badge/badge.component.js';
import SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.component.js';

import {
    biSkipStart,
    biPlay,
    biSkipEnd,
    biAlphabet,
    biSkipForward,
    biArrowCounterclockwise,
    biPause,
    biStop,
} from '../styles/icons';
import { Automaton } from '../automata';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { SlChangeEvent } from '@shoelace-style/shoelace';
import { styleMap } from 'lit/directives/style-map.js';
import { simulationMenuStyles } from '../styles/simulationMenu';
import { LitElementWw } from '@webwriter/lit';
import { Network } from 'vis-network';
import { Graph } from '../graph';

@customElement('webwriter-automaton-simulatormenu')
export class SimulatorMenu extends LitElementWw {
    @state()
    private _automaton!: Automaton;
    public set automaton(automaton: Automaton) {
        this._automaton = automaton;
    }

    @property({ type: Object, attribute: false })
    public graph!: Graph;

    @state()
    private _result!: {
        success: boolean | undefined;
        message: string;
        wordPosition: number;
    } | null;
    private set result(result: { success: boolean | undefined; message: string; wordPosition: number }) {
        this._result = {
            success: result.success,
            message: result.message,
            wordPosition: result.wordPosition,
        };
    }

    @property({ type: String, attribute: false })
    private _mode: 'idle' | 'step' | 'run' | 'animate' = 'idle';

    @state()
    private _animationRunning: boolean = false;

    public static get styles() {
        return simulationMenuStyles;
    }

    @query('#simulator_back') private _backButton!: SlButton;
    @query('#simulator_next') private _nextButton!: SlButton;

    @query('#simulator_toggle') private _toggleButton!: SlButton;
    @query('#simulator_stop') private _stopButton!: SlButton;

    @query('#wordInput') private _wordInput!: SlInput;

    public static get scopedElements() {
        return {
            'sl-button': SlButton,
            'sl-tooltip': SlTooltip,
            'sl-badge': SlBadge,
            'sl-input': SlInput,
        };
    }

    render() {
        return html`<div class="simulator">${this.renderInput()} ${this.renderButtonGroup()}</div>`;
    }

    private renderInput() {
        return html` <sl-input
                class=${classMap({
                    simulator__input: true,
                    danger: this._result != null && this._result.success === false,
                    success: this._result != null && this._result.success === true,
                })}
                style=${styleMap({
                    display: this._mode === 'idle' ? 'block' : 'none',
                })}
                @sl-input=${(e: SlChangeEvent) => {
                    this._automaton.simulator.word = (e.target as SlInput).value;
                    this.reset();
                    this.requestUpdate();
                }}
                value=${this._automaton.simulator.word}
                id="wordInput"
                placeholder="Input Word e.g. aaabbb, step;step;stop"
                clearable
            >
                <span slot="prefix" class="simulator__input__prefix">${biAlphabet}</span>
                <span slot="label" class="simulator__input__helptext">${unsafeHTML(this._result?.message)}</span>
            </sl-input>
            <div
                class=${classMap({
                    'simulator__input-display': true,
                    danger: this._result != null && this._result.success === false,
                    success: this._result != null && this._result.success === true,
                })}
                style=${styleMap({
                    display: this._mode !== 'idle' ? 'flex' : 'none',
                })}
                @click=${() => {
                    this.reset();
                    this._wordInput.focus();
                }}
            >
                <span slot="prefix" class="simulator__input-display__prefix">${biAlphabet}</span>
                <span slot="label" class="simulator__input-display__helptext"
                    >${unsafeHTML(this._result?.message)}</span
                >
                <div class="simulator__input-display__input">
                    ${this._automaton.simulator.wordArray.map((e, i) => {
                        return i === this._result?.wordPosition ? html`|${e}` : e;
                    })}
                </div>
            </div>`;
    }

    private renderButtonGroup() {
        return html`<sl-button-group
                class="simulator_buttons"
                style=${styleMap({
                    display: this._mode === 'idle' ? 'flex' : 'none',
                })}
            >
                <sl-tooltip content="Animate" placement="top">
                    <sl-button
                        @click=${() => {
                            this.startAnimation();
                        }}
                        >${biPlay}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Step by Step" placement="top">
                    <sl-button
                        @click=${() => {
                            this.startStepByStep();
                        }}
                        >${biSkipEnd}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Check" placement="top">
                    <sl-button
                        @click=${() => {
                            this.run();
                        }}
                        >${biSkipForward}</sl-button
                    >
                </sl-tooltip> </sl-button-group
            ><sl-button-group
                class="simulator_buttons"
                style=${styleMap({
                    display: this._mode === 'step' ? 'flex' : 'none',
                })}
            >
                <sl-tooltip content="Back" placement="top">
                    <sl-button
                        id="simulator_back"
                        @click=${() => {
                            this.stepBackward();
                        }}
                        disabled
                        >${biSkipStart}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Next" placement="top">
                    <sl-button
                        id="simulator_next"
                        @click=${() => {
                            this.stepForward();
                        }}
                        >${biSkipEnd}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Reset" placement="top">
                    <sl-button
                        @click=${() => {
                            this.reset();
                        }}
                        >${biArrowCounterclockwise}</sl-button
                    >
                </sl-tooltip> </sl-button-group
            ><sl-button-group
                class="simulator_buttons"
                style=${styleMap({
                    display: this._mode === 'run' ? 'flex' : 'none',
                })}
            >
                <sl-tooltip content="Reset" placement="top">
                    <sl-button
                        @click=${() => {
                            this.reset();
                        }}
                        >${biArrowCounterclockwise}</sl-button
                    >
                </sl-tooltip>
            </sl-button-group>
            <sl-button-group
                class="simulator_buttons"
                style=${styleMap({ display: this._mode === 'animate' ? 'flex' : 'none' })}
            >
                <sl-tooltip content=${this._animationRunning ? 'Pause' : 'Play'} placement="top">
                    <sl-button
                        @click=${() => {
                            this.toggleAnimation();
                        }}
                        id="simulator_toggle"
                        >${this._animationRunning ? biPause : biPlay}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Stop" placement="top">
                    <sl-button
                        @click=${() => {
                            this.stopAnimation();
                        }}
                        id="simulator_stop"
                        >${biStop}</sl-button
                    >
                </sl-tooltip>
                <sl-tooltip content="Reset" placement="top">
                    <sl-button
                        @click=${() => {
                            this.reset();
                        }}
                        >${biArrowCounterclockwise}</sl-button
                    >
                </sl-tooltip>
            </sl-button-group> `;
    }

    private run() {
        this.reset();
        this._mode = 'run';

        DEV: console.time('simulation');
        const result = this._automaton.simulator.simulate();
        DEV: console.timeEnd('simulation');

        this.result = {
            success: result.success,
            message: result.message,
            wordPosition: this._automaton.simulator.word.length - 1,
        };

        this.requestUpdate();
    }

    private startAnimation() {
        this.reset();
        this._mode = 'animate';

        this._automaton.highlightNode(this._automaton.getInitialNode());

        if (this._automaton.simulator.word.length == 0) {
            this.result = {
                success: this._automaton.getInitialNode().final,
                message: `Finished simulation on <b>${this._automaton.getInitialNode().label}</b>`,
                wordPosition: 0,
            };
        } else {
            this._automaton.simulator.startAnimation((result) => {
                this.result = result;

                if (result.success !== undefined) {
                    this._toggleButton.disabled = true;
                    this._stopButton.disabled = true;
                }

                this.requestUpdate();
            });
        }

        this._animationRunning = true;
        this.requestUpdate();
    }

    private stopAnimation() {
        this._automaton.simulator.stopAnimation((result) => {
            this.result = result;

            this._toggleButton.disabled = true;
            this._stopButton.disabled = true;

            this.requestUpdate();
        });
        this._animationRunning = false;
        this.requestUpdate();
    }

    private toggleAnimation() {
        if (this._animationRunning) {
            this._automaton.simulator.pauseAnimation((result) => {
                this.result = result;
                this.requestUpdate();
            });
            this._animationRunning = false;
        } else {
            this._automaton.simulator.startAnimation((result) => {
                this.result = result;
                this.requestUpdate();
            });
            this._animationRunning = true;
        }
        this.requestUpdate();
    }

    public reset() {
        this._automaton.simulator.reset();
        this._result = {
            success: undefined,
            message: '',
            wordPosition: 0,
        };
        this._mode = 'idle';
        this._nextButton.disabled = false;
        this._backButton.disabled = true;

        this._toggleButton.disabled = false;
        this._stopButton.disabled = false;

        this._automaton.highlightNode(this._automaton.getInitialNode());
        this.requestUpdate();
    }

    public init() {
        this._automaton.simulator.init();
    }

    private startStepByStep() {
        this.reset();
        this._mode = 'step';

        const { graphInteraction } = this._automaton.simulator.initStepByStep(this.graph, (res: any) => {
            this.result = res;
            this._backButton.disabled = false;
            this.requestUpdate();
        });

        if (graphInteraction) {
            this._nextButton.disabled = true;
        }

        this._automaton.highlightNode(this._automaton.getInitialNode());

        if (this._automaton.simulator.word.length == 0) {
            this._nextButton.disabled = true;

            this.result = {
                success: this._automaton.getInitialNode().final,
                message: `Finished simulation on <b>${this._automaton.getInitialNode().label}</b>`,
                wordPosition: this._automaton.simulator.word.length - 1,
            };
        }
        this.requestUpdate();
    }

    private stepForward() {
        const result = this._automaton.simulator.stepForward(true);

        if (!result.success) {
            this._nextButton.disabled = true;
            this._backButton.disabled = true;
            this.result = result;
        }

        if (result.finalStep) {
            this._nextButton.disabled = true;
            this.result = result;
        }

        this.requestUpdate();
    }

    private stepBackward() {
        const result = this._automaton.simulator.stepBackward(true);

        if (result.firstStep) {
            this._backButton.disabled = true;
            this.result = result;
        }

        this.requestUpdate();
    }
}
