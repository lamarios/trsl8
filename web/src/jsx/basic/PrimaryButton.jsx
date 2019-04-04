import React from 'react';
import styled from 'styled-components'


const Button = styled.button`
   all: unset;
  color: ${props => props.theme.colors.background};
  background-color: ${props =>props.theme.colors.primary.main};
  border-radius: 5px;
  cursor:pointer;
  padding: 7px 12px;
  transition: all 0.25s ease-in; 
  display: flex;
  align-items: center;
  
  &:hover{
    background-color: ${props =>props.theme.colors.primary.lightest};
  }
`;

export default class PrimaryButton extends React.Component {
    render() {
        return (<Button {...this.props}>{this.props.children}</Button>)
    }
}