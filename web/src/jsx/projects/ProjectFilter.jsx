import React from 'react';
import styled from 'styled-components';


export default class ProjectFilter extends React.Component{
    constructor(props) {
        super(props);
        this.state = {filter: '', onlyMissing: true};
    }


    render() {
        return <Filters>
            <div>Filters:</div>
            <TextInput id={"filter"} value={this.state.filter}
                       onChange={(e) => this.props.onFilterChanged(e.target.value)}/>
            <Checkbox value={this.state.onlyMissing}
                      label="Show only Missing"
                      onChange={(e) => onOnlyMissingChanged(e.checked)}/>
        </Filters>
    }
}
