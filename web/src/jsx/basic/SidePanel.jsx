import React from 'react';
import styled from 'styled-components';
import {slideFromRight} from "../animations";

const Container = styled.div`
 box-shadow: 0 0 200px rgba(0,0,0,1);
 animation: ${slideFromRight} 0.25s;
 position: fixed;
 background-color: ${props=> props.theme.colors.complementary.main};
 padding:30px;
 z-index: 100;
 top:0;
 bottom: 0;
 right: 0;
 width:300px;
`

const Overlay = styled.div`
position:fixed;
top: 0;
left:0;
right:0;
bottom:0;
z-index: 99;
`;

export default class SidePanel extends React.Component{

    render(){
        return (<div>
            <Overlay onClick={this.props.dismiss}/>
            <Container>{this.props.children}</Container>
        </div>)
    }
}
