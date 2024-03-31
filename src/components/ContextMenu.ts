import { Transition, Node, StackOperation } from '../automata';
import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { contextMenuStyles } from '../styles/contextMenu';
import { biDatabase, biDatabaseAdd, biDatabaseDash, biDatabaseSlash, biTrash } from '../styles/icons';
import { AutomatonComponent } from 'index';

export class ContextMenu {
    private selected: {
        data: Transition | Node;
        type: 'Node' | 'Transition' | undefined;
        updateFn: Function;
        deleteFn: Function;
    } = {
        data: { id: '', label: '', initial: false, final: false },
        type: undefined,
        updateFn: () => {},
        deleteFn: () => {},
    };
    private position = { x: 0, y: 0 };

    private visible = false;

    public requestUpdate: () => void = () => {};

    constructor(private parentComponent: AutomatonComponent) {}

    public render() {
        return html`<div
            id="contextMenu"
            class="context-menu"
            style=${styleMap({ left: this.position.x, top: this.position.y, display: this.visible ? 'block' : 'none' })}
        >
            ${this.selected?.type === 'Node' ? this.nodeContextMenu() : null}
            ${this.selected?.type === 'Transition'
                ? (this.selected.data as Transition).stackOperations
                    ? this.pdaEdgeContextMenu()
                    : this.edgeContextMenu()
                : null}
        </div>`;
    }

    private nodeContextMenu() {
        return html`
            <div class="context-menu__header">
                Node ${this.selected?.data.label}
                <sl-button
                    class="context-menu__button"
                    circle
                    size="small"
                    @click=${() => {
                        this.selected.deleteFn();
                        this.hide();
                    }}
                    style=${styleMap({
                        display: this.parentComponent.settings.permissions.node.delete ? 'block' : 'none',
                    })}
                    >${biTrash}</sl-button
                >
            </div>
            <sl-input
                placeholder="Label"
                value=${this.selected?.data.label || ''}
                @sl-input=${(e: any) => {
                    this.selected.updateFn({ ...this.selected.data, label: e.target.value });
                    this.selected.data = { ...this.selected.data, label: e.target.value };
                }}
                ?disabled=${!this.parentComponent.settings.permissions.node.change}
            ></sl-input>

            <sl-checkbox
                ?checked=${(this.selected?.data as Node).initial}
                ?disabled=${(this.selected?.data as Node).initial ||
                !this.parentComponent.settings.permissions.node.change}
                @sl-change=${(e: any) => {
                    console.log('initial', e.target.checked);
                    this.selected.updateFn({ ...this.selected.data, initial: e.target.checked });
                    this.selected.data = { ...this.selected.data, initial: e.target.checked };
                }}
                >Initial</sl-checkbox
            >
            <sl-checkbox
                ?checked=${(this.selected?.data as Node).final}
                ?disabled=${!this.parentComponent.settings.permissions.node.change}
                @sl-change=${(e: any) => {
                    this.selected.updateFn({ ...this.selected.data, final: e.target.checked });
                    this.selected.data = { ...this.selected.data, final: e.target.checked };
                }}
                >Final</sl-checkbox
            >
        `;
    }

    private edgeContextMenu() {
        let transition = this.selected?.data as Transition;

        return html`
            <div class="context-menu__header">
                Edge ${transition.label}
                <sl-button
                    class="context-menu__button"
                    circle
                    size="small"
                    @click=${() => {
                        this.selected.deleteFn();
                        this.hide();
                    }}
                    style=${styleMap({
                        display: this.parentComponent.settings.permissions.edge.delete ? 'block' : 'none',
                    })}
                    >${biTrash}</sl-button
                >
            </div>
            ${transition.symbols.map(
                (symbol, i) => html`
                    <div class="context-menu__input-group">
                        <sl-input
                            placeholder="Symbol"
                            value=${symbol}
                            ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                            @sl-input=${(e: any) => {
                                console.log(e.target.value);
                                const symbols = transition.symbols;
                                symbols[i] = e.target.value;
                                this.selected.updateFn({ ...transition, symbols });
                                transition = { ...transition, symbols };
                            }}
                        ></sl-input>
                        <sl-button
                            class="context-menu__button"
                            circle
                            size="small"
                            @click=${() => {
                                const symbols = transition.symbols;
                                symbols.splice(i, 1);
                                this.selected.updateFn({ ...transition, symbols });
                                transition = { ...transition, symbols };

                                if (symbols.length === 0) {
                                    this.selected.deleteFn();
                                    this.hide();
                                }
                            }}
                            style=${styleMap({
                                display: this.parentComponent.settings.permissions.edge.delete ? 'block' : 'none',
                            })}
                            >${biTrash}</sl-button
                        >
                    </div>
                `
            )}
        `;
    }

    private pdaEdgeContextMenu() {
        let transition = this.selected?.data as Transition;
        let stackOperations = transition.stackOperations as StackOperation[];

        return html`
            <div class="context-menu__header">
                PDA Edge ${transition.label}
                <sl-button
                    class="context-menu__button"
                    circle
                    size="small"
                    @click=${() => {
                        this.selected.deleteFn();
                        this.hide();
                    }}
                    style=${styleMap({
                        display: this.parentComponent.settings.permissions.edge.delete ? 'block' : 'none',
                    })}
                    >${biTrash}</sl-button
                >
            </div>
            ${transition.symbols.map(
                (symbol, i) => html`
                    <div class="context-menu__input-group">
                        <sl-input
                            placeholder="Symbol"
                            value=${symbol}
                            size="small"
                            ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                            @sl-input=${(e: any) => {
                                console.log(e.target.value);
                                const symbols = transition.symbols;
                                symbols[i] = e.target.value;
                                this.selected.updateFn({ ...transition, symbols });
                                transition = { ...transition, symbols };
                            }}
                        ></sl-input>
                        <sl-input
                            placeholder="Stack"
                            value=${stackOperations[i].symbol}
                            size="small"
                            ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                            @sl-input=${(e: any) => {
                                const operation = {
                                    operation: stackOperations[i].operation,
                                    symbol: e.target.value,
                                    condition: stackOperations[i].condition,
                                };
                                stackOperations[i] = operation as StackOperation;
                                this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                transition = { ...transition, stackOperations: stackOperations };
                            }}
                        ></sl-input>
                        <sl-input
                            palceholder="If"
                            value=${stackOperations[i].condition}
                            size="small"
                            ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                            @sl-input=${(e: any) => {
                                const operation = {
                                    operation: stackOperations[i].operation,
                                    symbol: stackOperations[i].symbol,
                                    condition: e.target.value,
                                };
                                stackOperations[i] = operation as StackOperation;
                                this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                transition = { ...transition, stackOperations: stackOperations };
                            }}
                        ></sl-input>

                        <sl-button-group label="Stack Actions">
                            <sl-tooltip content="Push" placement="top">
                                <sl-button
                                    variant=${stackOperations[i].operation == 'push' ? 'primary' : 'default'}
                                    size="small"
                                    ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                                    @click=${() => {
                                        const operation = {
                                            operation: 'push',
                                            symbol: stackOperations[i].symbol,
                                            condition: stackOperations[i].condition,
                                        };
                                        stackOperations[i] = operation as StackOperation;
                                        this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                        transition = { ...transition, stackOperations: stackOperations };
                                    }}
                                    >${biDatabaseAdd}</sl-button
                                >
                            </sl-tooltip>
                            <sl-tooltip content="Pop" placement="top">
                                <sl-button
                                    variant=${stackOperations[i].operation == 'pop' ? 'primary' : 'default'}
                                    size="small"
                                    ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                                    @click=${() => {
                                        const operation = {
                                            operation: 'pop',
                                            symbol: stackOperations[i].symbol,
                                            condition: stackOperations[i].condition,
                                        };
                                        stackOperations[i] = operation as StackOperation;
                                        this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                        transition = { ...transition, stackOperations: stackOperations };
                                    }}
                                    >${biDatabaseDash}</sl-button
                                >
                            </sl-tooltip>
                            <sl-tooltip content="Empty Check" placement="top">
                                <sl-button
                                    variant=${stackOperations[i].operation == 'empty' ? 'primary' : 'default'}
                                    size="small"
                                    ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                                    @click=${() => {
                                        const operation = {
                                            operation: 'empty',
                                            symbol: '',
                                            condition: '',
                                        };
                                        stackOperations[i] = operation as StackOperation;
                                        this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                        transition = { ...transition, stackOperations: stackOperations };
                                    }}
                                    >${biDatabaseSlash}</sl-button
                                >
                            </sl-tooltip>
                            <sl-tooltip content="Keep" placement="top">
                                <sl-button
                                    variant=${stackOperations[i].operation == 'none' ? 'primary' : 'default'}
                                    size="small"
                                    ?disabled=${!this.parentComponent.settings.permissions.edge.change}
                                    @click=${() => {
                                        const operation = {
                                            operation: 'none',
                                            symbol: '',
                                            condition: stackOperations[i].condition,
                                        };
                                        stackOperations[i] = operation as StackOperation;
                                        this.selected.updateFn({ ...transition, stackOperations: stackOperations });
                                        transition = { ...transition, stackOperations: stackOperations };
                                    }}
                                    >${biDatabase}</sl-button
                                >
                            </sl-tooltip>
                        </sl-button-group>

                        <sl-button
                            class="context-menu__button"
                            circle
                            size="small"
                            @click=${() => {
                                const symbols = transition.symbols;
                                symbols.splice(i, 1);
                                this.selected.updateFn({ ...transition, symbols });
                                transition = { ...transition, symbols };

                                if (symbols.length === 0) {
                                    this.selected.deleteFn();
                                    this.hide();
                                }
                            }}
                            style=${styleMap({
                                display: this.parentComponent.settings.permissions.edge.delete ? 'block' : 'none',
                            })}
                            >${biTrash}</sl-button
                        >
                    </div>
                `
            )}
        `;
    }

    public setData(data: Node | Transition, type: 'Node' | 'Transition', updateFn: Function, deleteFn: Function) {
        this.selected = { data, type, updateFn, deleteFn };
        this.requestUpdate();
    }

    public setPosition({ x, y }: { x: number; y: number }) {
        this.position = { x, y };
        this.requestUpdate();
    }

    public show() {
        this.visible = true;
        this.requestUpdate();
    }

    public hide() {
        this.visible = false;
        this.requestUpdate();
    }

    public isVisible() {
        return this.visible;
    }

    public toggle() {
        this.visible = !this.visible;
        this.requestUpdate();
    }

    public blur() {
        this.hide();
        this.requestUpdate();
    }
}
