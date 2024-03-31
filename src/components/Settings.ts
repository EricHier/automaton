import { biGear } from '../styles/icons';
import { AutomatonComponent } from '../';
import { html } from 'lit';
import { SlChangeEvent, SlCheckbox, SlInput } from '@shoelace-style/shoelace';

import { live } from 'lit/directives/live.js';

export class Settings {
    constructor(private parentComponent: AutomatonComponent) {
        this.numberStringToPermissions(parentComponent.permissions);
    }

    private _permissions = {
        node: {
            add: true,
            delete: true,
            change: true,
        },
        edge: {
            add: true,
            delete: true,
            change: true,
        },
        stack: {
            add: true,
            delete: true,
            change: true,
        },
    };
    private set permissions(permissions: typeof this._permissions) {
        this._permissions = permissions;
        this.parentComponent.permissions = this.permissionsToNumberString();
        console.log(this.permissionsToNumberString());
    }
    public get permissions() {
        return this._permissions;
    }

    render() {
        return html`<h2>${biGear} Settings</h2>
            <hr />
            <sl-details summary="Editing">
                <table>
                    <tr>
                        <th></th>
                        <th>Add</th>
                        <th>Delete</th>
                        <th>Change</th>
                    </tr>
                    <tr>
                        <td>Node</td>
                        <td>
                            <sl-checkbox
                                checked=${live(this.permissions.node.add)}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        node: { ...this.permissions.node, add: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.node.add;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.node.delete}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        node: { ...this.permissions.node, delete: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.node.delete;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.node.change}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        node: { ...this.permissions.node, change: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.node.change;
                                }}
                            ></sl-checkbox>
                        </td>
                    </tr>
                    <tr>
                        <td>Edge</td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.edge.add}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        edge: { ...this.permissions.edge, add: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.edge.add;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.edge.delete}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        edge: { ...this.permissions.edge, delete: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.edge.delete;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.edge.change}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        edge: { ...this.permissions.edge, change: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.edge.change;
                                }}
                            ></sl-checkbox>
                        </td>
                    </tr>
                    <tr>
                        <td>Stack</td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.stack.add}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        stack: { ...this.permissions.stack, add: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.stack.add;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.stack.delete}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        stack: { ...this.permissions.stack, delete: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.stack.delete;
                                }}
                            ></sl-checkbox>
                        </td>
                        <td>
                            <sl-checkbox
                                checked=${this.permissions.stack.change}
                                @sl-input=${(e: SlChangeEvent) => {
                                    const c = e.target as SlCheckbox;
                                    this.permissions = {
                                        ...this.permissions,
                                        stack: { ...this.permissions.stack, change: (e.target as SlCheckbox).checked },
                                    };
                                    c.checked = this.permissions.stack.change;
                                }}
                            ></sl-checkbox>
                        </td>
                    </tr>
                </table>
            </sl-details>
            <sl-details summary="View">
                <sl-select label="PDA Label Style">
                    <sl-option>a, X|aX</sl-option>
                    <sl-option>a -> aa|a</sl-option>
                </sl-select>
            </sl-details>
            <sl-details summary="Automation">
                <sl-input
                    label="Test Language"
                    value=${this.parentComponent.testLanguage}
                    @sl-input=${(e: SlChangeEvent) => {
                        this.parentComponent.testLanguage = (e.target as SlInput).value;
                        this.parentComponent.requestUpdate();
                    }}
                ></sl-input>
                <sl-input
                    label="Test Words"
                    value=${this.parentComponent.testWords.join(',')}
                    @sl-input=${(e: SlChangeEvent) => {
                        this.parentComponent.testWords = (e.target as SlInput).value.split(',');
                        this.parentComponent.requestUpdate();
                    }}
                ></sl-input>
            </sl-details>
            <sl-details summary="Advanced">
                <sl-checkbox>Verbose</sl-checkbox>
            </sl-details>`;
    }

    permissionsToNumberString() {
        const nodeString =
            (this.permissions.node.add ? '1' : '0') +
            (this.permissions.node.delete ? '1' : '0') +
            (this.permissions.node.change ? '1' : '0');

        const edgeString =
            (this.permissions.edge.add ? '1' : '0') +
            (this.permissions.edge.delete ? '1' : '0') +
            (this.permissions.edge.change ? '1' : '0');

        const stackString =
            (this.permissions.stack.add ? '1' : '0') +
            (this.permissions.stack.delete ? '1' : '0') +
            (this.permissions.stack.change ? '1' : '0');

        return (
            parseInt(nodeString, 2).toString() +
            parseInt(edgeString, 2).toString() +
            parseInt(stackString, 2).toString()
        );
    }

    numberStringToPermissions(num: string) {
        const nodeString = parseInt(num[0], 10).toString(2).padStart(3, '0');
        const edgeString = parseInt(num[1], 10).toString(2).padStart(3, '0');
        const stackString = parseInt(num[2], 10).toString(2).padStart(3, '0');

        this.permissions = {
            node: {
                add: nodeString[0] === '1',
                delete: nodeString[1] === '1',
                change: nodeString[2] === '1',
            },
            edge: {
                add: edgeString[0] === '1',
                delete: edgeString[1] === '1',
                change: edgeString[2] === '1',
            },
            stack: {
                add: stackString[0] === '1',
                delete: stackString[1] === '1',
                change: stackString[2] === '1',
            },
        };
    }
}
