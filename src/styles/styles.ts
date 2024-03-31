import { css } from 'lit';
import { contextMenuStyles } from './contextMenu';
import { stackStyles } from './stack';
import { settingsStyles } from './settings';

const baseStyles = css`
    :host {
        background: white;
        display: block;
        height: 500px;

        user-select: none;
    }

    #graphCanvas {
        height: 100%;
        width: 100%;
        outline: 1px solid lightgray;
    }

    .hidden {
        display: none;
    }

    .show {
        display: block;
    }

    .editor {
        position: relative;
        height: 100%;
    }

    .mode_switch {
        position: absolute;
        top: 10px;
        left: 10px;
        line-height: 16px;
    }

    .errordisplay {
        position: absolute;
        display: none;
    }

    .mode_switch__error_indicator {
        position: absolute;
        bottom: -5px;
        right: -7px;
        color: var(--sl-color-danger-600);
        z-index: 1000;
    }

    .mode_switch__select {
        width: 150px;
    }
`;

export const styles = [baseStyles, contextMenuStyles, stackStyles, settingsStyles];
