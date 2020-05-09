import React from "react";
import Dialog from "./Dialog.jsx";

export default class OkCancelDialog extends React.Component {


    render() {
        return <Dialog dismiss={this.props.dismiss} cancelText={"Cancel"} okText={"Ok"}
                       onOk={this.props.onOk}>
            {this.props.children}
        </Dialog>;


    }
}