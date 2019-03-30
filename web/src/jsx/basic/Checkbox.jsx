import React from 'react';
import styled from 'styled-components';


export default class Checkbox extends  React.Component{
    render() {
        return (<label><input type="checkbox" {...this.props}/>{this.props.label}</label>);
    }
}
