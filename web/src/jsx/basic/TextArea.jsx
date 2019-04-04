import React from 'react';
import styled from 'styled-components';

const MyInput = styled.textarea`
    //all: unset;
    border: 1px solid ${props => props.theme.colors.inputBorder};
    background-color: ${props => props.theme.colors.background};
    margin: 2px;
    display: block;
    padding: 5px;
    border-radius: 5px;
    width:100%;
    box-sizing: border-box;
    min-height: 30px;
    
    transition: all 0.25s ease-in;
    &:focus{
        border: 1px solid ${props => props.theme.colors.primary.lightest};
    }
`;
const Label = styled.label`
display: block;
`;
export default class TextArea extends React.Component {


    render() {
        return (<div>
            {this.props.label &&
            <Label htmlFor={this.props.id}>{this.props.label}:</Label>}
            <MyInput {...this.props}/>
        </div>)
    }
}
