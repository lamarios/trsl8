import React from 'react';
import styled from 'styled-components';
import {fadeInTop} from "../animations";

const Container = styled.div`
 border-radius: 5px;
 box-shadow: 0 0 5px rgba(0,0,0,0.1);
 animation: ${fadeInTop} 0.15s;
 position: absolute;
 background-color: ${props=> props.theme.colors.background};
 padding:10px;
 z-index: 100;
top: ${props => props.top || 'auto'};
left:${props => props.left || 'auto'};
right:${props => props.right || 'auto'};
bottom:${props => props.bottom || 'auto'};
`

const Overlay = styled.div`
position:fixed;
top: 0;
left:0;
right:0;
bottom:0;
z-index: 99;
`;

export default class Dropdown extends React.Component{

    render(){
        return (<div>
            <Overlay onClick={this.props.dismiss}/>
            <Container {...this.props}>{this.props.children}</Container>
        </div>)
    }
}