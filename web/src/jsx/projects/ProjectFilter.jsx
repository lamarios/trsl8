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

    constructor(props) {
        super(props);

        this.triggerFilter = this.triggerFilter.bind(this);
    }

    triggerFilter(filter, onlyMissing) {
        this.props.onChanged({filter, onlyMissing});
    }


    render() {
        return (<Filters>
            Filter by:
            <TextInput id={"filter"} value={this.props.filter.filter}
                       onChange={(e) => this.triggerFilter(e.target.value, this.props.filter.onlyMissing)}
                       placeholder="Terms"/>
            <Checkbox value={this.props.filter.onlyMissing}
                      label="Show only Missing"
                      onChange={(e) => this.triggerFilter(this.props.filter.filter, e.target.checked)}/>
        </Filters>);
    }
}
