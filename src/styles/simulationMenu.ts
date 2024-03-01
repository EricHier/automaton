import { css } from 'lit';

export const simulationMenuStyles = css`
    .simulator {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;

        gap: 10px;

        display: flex;
        flex-direction: row;
        align-items: flex-end;
    }

    .simulator__input {
        flex-grow: 1;
    }

    .simulator__input.danger::part(base) {
        border-color: var(--sl-color-danger-600);
    }

    .simulator__input.success::part(base) {
        border-color: var(--sl-color-success-600);
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

    .simulator__input-display__helptext {
        position: absolute;
        left: 0;
        bottom: calc(100% + 10px);
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
        background: inherit;
        box-shadow: none;
        margin: 0px;
        cursor: inherit;
        appearance: none;

        display: inline-flex;
        align-items: center;
        justify-content: start;
    }

    .simulator__input-display__input.danger {
        border-color: var(--sl-color-danger-600);
    }

    .simulator__input-display__input.success {
        border-color: var(--sl-color-success-600);
    }
`;
