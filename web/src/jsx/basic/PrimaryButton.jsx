import React from 'react';
import styled from 'styled-components'


const Button = styled.button`
   all: unset;
  color: ${props => props.theme.colors.primary.main};
  background-color: ${props =>props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.primary.NeutralDark};
  border-radius: 5px;
  cursor:pointer;
  padding: 3px 5px;
`;

export default class PrimaryButton extends React.Component {
    render() {
        return (<Button {...this.props}>{this.props.children}</Button>)
    }
}