import React from 'react';
import styled from 'styled-components';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const Action = styled.div`
cursor: pointer;
`;

const Actions = styled.div`
color: ${props => props.theme.colors.primary.lightest};
align-items: center;
`;

const Container = styled.div`
display: flex;
align-items: center;
color: ${props => props.theme.colors.text};
`;

const Name = styled.div`
flex-grow: 2;
`;

export default class UserPill extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        const user = this.props.user;
        console.log(this.props.actions);
        return (<Container>
            <Name>{user.FirstName} {user.LastName}</Name>
            {this.props.actions !== undefined && this.props.actions.length > 0 && <Actions>
                {this.props.actions.map(a => <Action key={a.name} onClick={a.onClick}>
                    <FontAwesomeIcon icon={a.icon}/>
                </Action>)}

            </Actions>}
        </Container>)
    }

}