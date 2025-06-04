import { css } from 'lit';

export const topMenuStyles = css`
    .topmenu {
        position: absolute;

        display: flex;
        flex-direction: row-reverse;
        gap: 10px;

        align-items: flex-start;

        right: 10px;
        top: 10px;
    }

    .topmenu sl-button::part(base),
    .topmenu sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .topmenu__buttons {
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .topmenu__button_group:not([disabled]):hover .topmenu__buttons {
        display: flex;
    }

    .topmenu__button_group {
        display: flex;
        gap: 10px;
        flex-direction: column;
    }

    .topmenu__button {
        position: relative;
        z-index: 1500;
    }

    .topmenu__button sl-button {
        position: absolute;
        top: -15px;
        right: -15px;
    }

    .topmenu__popup {
        max-width: 400px;
        background-color: white;
        outline: 1px solid var(--sl-panel-border-color);
        border-radius: var(--sl-border-radius-medium);
        font-size: 1rem;
        overflow: hidden;
    }

    .topmenu__popup label {
        font-weight: var(--sl-font-weight-semibold);
    }

    .topmenu__popup__table {
        width: 100%;
        border-collapse: collapse;
    }

    .topmenu__popup__table th, .topmenu__popup__table td {
        padding: 0.25em 0.5em;
        border: 1px solid var(--sl-panel-border-color);
        text-align: center;
    }
`;
