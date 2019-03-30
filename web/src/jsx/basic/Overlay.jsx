import React from 'react';
import styled from 'styled-components';

const Background = styled.div`
    background-color: rgba(0,0,0, 0.5);
    position: fixed;
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
`;

export default class Overlay extends React.Component{


    render(){
        return <Background className="Overlay" onClick={this.props.dismiss}>
            {this.props.children}
        </Background>
    }
}