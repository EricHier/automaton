import { css } from 'lit';

export const simulationMenuStyles = css`
    .simulator {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        padding-top: 2px;

        gap: 10px;

        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows: auto auto;
    }

    .simulator::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        background-color: rgb(255, 255, 255, 0.8);
        z-index: 1400;
    }

    .simulator__label {
        grid-column: 1 / -1;

        font-size: var(--sl-font-size-medium);

        z-index: 1500;
    }

    .simulator__label__path {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 5px;
        overflow-x: auto;
    }

    .simulator--pda .simulator__label {
        margin-right: 80px;
    }

    .simulator__label__path__transition {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
    }

    .simulator__label__path__transition span {
        font-size: var(--sl-font-size-small);
        margin: -6px 0;
    }

    .simulator__label__path__transition svg {
        width: 1.2em;
        height: 1.2em;
    }

    .simulator__input {
        flex-grow: 1;

        z-index: 1500;
    }

    .simulator__input.danger::part(base) {
        border-color: var(--sl-color-danger-600);
        background-color: var(--sl-color-danger-50);
    }

    .simulator__input.success::part(base) {
        border-color: var(--sl-color-success-600);
        background-color: var(--sl-color-success-50);
    }

    .simulator__input.danger:focus-within::part(base) {
        border-color: var(--sl-color-danger-600);
        box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-color-danger-300);
    }

    .simulator__input.success:focus-within::part(base) {
        border-color: var(--sl-color-success-600);
        box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-color-success-300);
    }

    .simulator sl-button::part(base),
    .simulator sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .simulator__input-display {
        flex-grow: 1;
        position: relative;

        border: solid var(--sl-input-border-width) var(--sl-input-border-color);

        border-radius: var(--sl-input-border-radius-medium);
        font-size: var(--sl-input-font-size-medium);
        height: var(--sl-input-height-medium);

        display: inline-flex;
        z-index: 1500;
        background-color: white;

        align-items: stretch;
        justify-content: start;
        position: relative;
        width: 100%;
        font-family: var(--sl-input-font-family);
        font-weight: var(--sl-input-font-weight);
        letter-spacing: var(--sl-input-letter-spacing);
        vertical-align: middle;
        overflow: visible;
        cursor: text;
        transition: var(--sl-transition-fast) color, var(--sl-transition-fast) border,
            var(--sl-transition-fast) box-shadow, var(--sl-transition-fast) background-color;
    }

    .simulator__input-display__prefix {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;

        margin-inline-start: var(--sl-input-spacing-medium);
    }

    .simulator__input-display__input {
        height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
        padding: 0 var(--sl-input-spacing-medium);

        flex: 1 1 auto;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        min-width: 0px;
        color: var(--sl-input-color);
        border: none;
        background: transparent;
        box-shadow: none;
        margin: 0px;
        cursor: inherit;
        appearance: none;

        display: inline-flex;
        align-items: center;
        justify-content: start;
        overflow-x: auto;
    }

    .simulator__input-display.danger {
        border-color: var(--sl-color-danger-600);
        background-color: var(--sl-color-danger-50);
    }

    .simulator__input-display.success {
        border-color: var(--sl-color-success-600);
        background-color: var(--sl-color-success-50);
    }

    .simulator_buttons {
        z-index: 1500;
    }
`;
