import React from 'react';
import styled from 'styled-components';

import MaintenancePageBackgroundImg from '../../assets/images/maintenance-page.png';

const MainContainer = styled.div`
    background-image: url(${MaintenancePageBackgroundImg});
    width: 100vw;
    min-height: 100vh;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
`;

interface Props {

}

export class MaintenancePage extends React.PureComponent<Props> {
    public render = () => {
        return (
            <MainContainer />
        );
    };
}
