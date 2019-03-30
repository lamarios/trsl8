import React from 'react';
import styled from 'styled-components';

const MyInput = styled.input`
 all: unset;
 border: 1px solid ${props => props.theme.colors.complementary.Neutral};
 margin: 2px;
display: block;
padding: 5px;
border-radius: 5px;
`;
const Label = styled.label`
display: block;
`;
export default class TextInput extends React.Component {


    render() {
        return (<div>
            {this.props.label &&
            <Label htmlFor={this.props.id}>{this.props.label}:</Label>}
            <MyInput {...this.props}/>
        </div>)
    }
}