import { css } from 'lit';

export const contextMenuStyles = css`
    .context-menu {
        position: absolute;
        z-index: 1000;

        padding: 5px;

        background-color: white;
        outline: 1px solid black;
    }

    .context-menu sl-button::part(base),
    .context-menu sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .context-menu__header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 5px;
    }

    .context-menu__input-group {
        display: flex;
        flex-direction: row;
        gap: var(--sl-spacing-x-small);
    }

    .context-menu__input-group sl-input {
        max-width: 50px;
    }
`;
