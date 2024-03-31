import { css } from 'lit';

export const settingsStyles = css`
    .settings {
        color: var(--sl-color-gray-600);
        font-size: var(--sl-font-size-medium);
        line-height: var(--sl-line-height-medium);
        font-weight: 400;
        margin: 0;
        padding: 0;
    }

    .settings h2 {
        font-size: var(--sl-button-font-size-medium);
        line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
        font-weight: 500;

        margin-top: 0;
        margin-bottom: 0.5rem;

        display: flex;
        align-items: center;
        gap: 1ch;

        border-bottom: 2px solid var(--sl-color-gray-600);
        color: var(--sl-color-gray-600);
    }

    .settings table th {
        text-orientation: mixed;
        writing-mode: vertical-rl;
    }

    .settings sl-details {
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--sl-color-gray-300);
    }

    .settings sl-details::part(base) {
        background-color: unset;
        border: none;
    }
`;
