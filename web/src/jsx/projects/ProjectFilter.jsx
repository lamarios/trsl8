import React from "react";
import styled from "styled-components";
import TextInput from "../basic/TextInput";
import Checkbox from "../basic/Checkbox";

const Filters = styled.div`
display: flex;
align-items: center;
justify-content: left;
`;



export default class ProjectFilter extends React.Component {

    render() {
        return (<Filters>
            Filter by:
            <TextInput id={"filter"} value={this.props.filter}
                       onChange={(e) => this.props.onFilterChanged(e.target.value)} placeholder="Terms"/>
            <Checkbox value={this.props.onlyMissing}
                      label="Show only Missing"
                      onChange={(e) => this.props.onlyMissingChanged(e.target.checked)}/>
        </Filters>);
    }
}
