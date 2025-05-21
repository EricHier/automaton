import { css } from 'lit';

export const contextMenuStyles = css`
    .context-menu {
        position: absolute;
        z-index: 1000;

        padding: 8px;
        max-width: 150px;

        background-color: white;
        outline: 1px solid var(--sl-panel-border-color);
        border-radius: var(--sl-border-radius-medium);
    }

    .context-menu:has(.context-menu__header--pda) {
        max-width: none;
    }
 
    .context-menu sl-button::part(base),
    .context-menu sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .context-menu__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--sl-spacing-x-small);
    }

    .context-menu__header__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .context-menu__inputs {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: var(--sl-spacing-2x-small);
    }

    .context-menu__inputs__group {
        display: flex;
        align-items: center;
        gap: var(--sl-spacing-x-small);
    }

    .context-menu__inputs__group sl-input {
        width: 48px;
        flex-grow: 1;
    }

    .context-menu__button__add {
        margin-top: var(--sl-spacing-2x-small);
    }

    .context-menu__checkboxes {
        display: flex;
        justify-content: space-between;
        gap: var(--sl-spacing-small);
    }
`;
