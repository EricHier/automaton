import { css } from 'lit';

export const toolMenuStyles = css`
    .toolmenu {
        position: absolute;

        display: flex;
        flex-direction: column-reverse;
        gap: 10px;

        align-items: center;

        left: 10px;
        bottom: 10px;
    }

    .toolmenu sl-button::part(base),
    .toolmenu sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toolmenu__buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .toolmenu__buttons.hidden {
        display: none;
    }

    .toolmenu__button {
        position: relative;
    }

    .toolmenu__button sl-button {
        position: absolute;
        top: -15px;
        right: -15px;
    }
`;
