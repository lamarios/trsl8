import React from "react";
import Overlay from "./Overlay.jsx";
import styled, {keyframes} from "styled-components";
import {fadeInLeft} from "../animations";


const DialogContent = styled.div`
  background-color: ${props => props.theme.colors.background};
 width:100%;
 max-width: ${props => props.dialogWidth || "540px"}; 
 position:relative;
 margin: 50px auto;
 border-radius: 5px;
 box-shadow: 0 0 200px #000;
 max-height: 90vh;
  animation: ${fadeInLeft} 0.25s ease-in;
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
height: 50px;
box-sizing: border-box;
`;

const Content = styled.div`
  padding: 17px;
  box-sizing: border-box;
  max-height: calc(90vh - 50px);
  overflow-y: auto;
`;


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
            <DialogContent className="dialog-content" onClick={this.stopPropagation} dialogWidth={this.props.dialogWidth}>
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
        </Overlay>;
    }
}