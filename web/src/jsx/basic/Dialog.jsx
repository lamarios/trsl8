import React from 'react';
import Overlay from "./Overlay.jsx";
import styled, {keyframes} from 'styled-components';
import {fadeIn} from "../animations";


const DialogContent = styled.div`
  background-color: ${props => props.theme.colors.background};
 width:100%;
 max-width: 540px; 
 position:relative;
 margin: 50px auto;
 border-radius: 5px;
 box-shadow: 0 0 200px #000;

  animation: ${fadeIn} 0.25s
`;

const Button = styled.button`
  background:none;
  cursor: pointer;
border: none;
color: ${props => props.theme.colors.text.main}; 
font-size: 20px;
`;

const OkButton = styled(Button)`
color: ${props => props.theme.colors.primary.main}; 
`;

const Actions = styled.div`
text-align: right;
padding: 5px;
`;

const Content = styled.div``;


export default class Dialog extends React.Component {

    constructor(props) {
        super(props);

        this.stopPropagation = this.stopPropagation.bind(this);
        this.dismiss = this.dismiss.bind(this);
    }

    dismiss(e) {
        e.stopPropagation();
        this.props.dismiss(e);
    }

    stopPropagation(e) {
        e.stopPropagation();
    }

    render() {
        return <Overlay dismiss={this.dismiss}>
            <DialogContent onClick={this.stopPropagation}>
                <Content>
                    {this.props.children}
                </Content>
                <Actions>
                    <Button onClick={this.dismiss}>{this.props.cancelText}</Button>
                    {this.props.onOk && this.props.okText &&
                    <OkButton onClick={this.props.onOk}>{this.props.okText}</OkButton>
                    }
                </Actions>
            </DialogContent>
        </Overlay>
    }
}