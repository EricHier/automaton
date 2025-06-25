import { css } from 'lit';

export const stackStyles = css`
    .pda__stack {
        position: absolute;

        display: flex;
        flex-direction: column;

        align-items: center;

        right: 10px;
        bottom: 62px;

        width: 60px;

        max-height: 378px;

        gap: 10px;

        border: 1px solid lightgray;
        border-radius: 5px;
        background-color: white;

        z-index: 1400;
    }

    .pda__stack sl-button::part(base),
    .pda__stack sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .pda__stack-button.dragover::part(base) {
        background-color: var(--sl-color-danger-50);
        color: var(--sl-color-danger-700);
        border-color: var(--sl-color-danger-300);
    }

    .pda__stack-items {
        display: flex;
        flex-direction: column;
        max-height: 298px;
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
    }

    .pda__stack-items::-webkit-scrollbar {
        width: 5px;
    }

    .pda__stack-items::-webkit-scrollbar-thumb {
        background-color: var(--sl-color-primary-600);
        border-radius: 5px;
    }

    .pda__stack-items::-webkit-scrollbar-track {
        background-color: var(--sl-color-primary-100);
    }

    .pda__stack-items::-webkit-scrollbar-thumb:hover,
    .pda__stack-items::-webkit-scrollbar-thumb:active {
        background-color: var(--sl-color-primary-700);
    }

    .pda__stack-item {
        max-width: 60px;
        width: 100%;
        margin: 0;

        padding: 5px;
        box-sizing: border-box;

        border-top: 1px solid lightgray;
    }

    .pda__stack-item.dragging sl-input::part(base) {
        background-color: var(--sl-color-primary-50);
    }

    .pda__stack-item:hover {
        background-color: var(--sl-color-primary-50);
    }

    .pda__stack-title {
        background-color: var(--sl-color-primary-600);
        text-align: center;
        color: white;

        border-top-left-radius: 5px;
        border-top-right-radius: 5px;

        width: 60px;
        position: sticky;
    }

    .drop-before {
        border-bottom: 5px solid var(--sl-color-primary-600);
    }

    .drop-after {
        border-top: 5px solid var(--sl-color-primary-600);
    }

    .deleteable sl-input::part(base) {
        background-color: var(--sl-color-danger-50) !important;
        color: var(--sl-color-danger-700) !important;
        border-color: var(--sl-color-danger-300) !important;

        box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-color-danger-300);
    }
`;
