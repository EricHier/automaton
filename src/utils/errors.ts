import { msg } from "@lit/localize";
import { Node, Transition } from "automata";
import { html, TemplateResult } from "lit";

export class AutomatonError {
    public readonly type: 'missing-transition' | 'multiple-transitions' | 'empty-transition' | 'other';
    public readonly node?: Node;
    public readonly transition?: Transition;
    public readonly letter?: string;

    constructor(type: 'missing-transition' | 'multiple-transitions' | 'empty-transition' | 'other', node?: Node, transition?: Transition, letter?: string) {
        this.type = type;
        this.node = node;
        this.transition = transition;
        this.letter = letter;
    }

    public get message(): TemplateResult<1> {
        switch (this.type) {
            case 'missing-transition':
                return html`${msg(html`Missing transition for <b>${this.letter}</b>`)}`;
            case 'multiple-transitions':
                return html`${msg(html`Multiple transitions for <b>${this.letter}</b>`)}`;
            case 'empty-transition':
                return html`${msg("Transition with empty symbol")}`;
            default:
                return html`<b>${msg("Unknown error")}</b>`;
        }
    }
}