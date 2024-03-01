import { css } from 'lit';

export const infoCardStyles = css`
    .infomenu {
        position: absolute;

        right: 10px;
        top: 10px;

        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
    }

    .infomenu sl-button::part(base),
    .infomenu sl-button::part(label) {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .infomenu__content {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
`;
