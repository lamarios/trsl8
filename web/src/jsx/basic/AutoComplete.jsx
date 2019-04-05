import React from 'react';
import styled from 'styled-components';
import TextInput from "./TextInput";
import Dropdown from "./Dropdown";

const Container = styled.div`
position: relative;
`;

const Option = styled.div`
cursor: pointer;
margin: 5px 0 ;
padding: 5px;
transition: all 0.25s ease-in;

&:hover{
background-color: #ccc;
}
`;

export default class AutoComplete extends React.Component {

    constructor(props) {
        super(props);

        this.state = {search: '', showDropdown: false, options: [], timeout: null};
        this.inputChanged = this.inputChanged.bind(this);
        this.selectValue = this.selectValue.bind(this);
    }

    inputChanged(term) {
        clearTimeout(this.state.timeout);
        if(term.length > 2) {
            const search = () => {
                this.props.getOptionsPromise(term)
                    .then(res => {
                        this.setState({options: res, showDropdown: true});
                    })
            }


            this.setState({search: term, timeout: setTimeout(search, 300)});
        }else{
            this.setState({showDropdown: false, search: term});
        }
    }

    selectValue(value) {
        this.props.onSelected(value);
        this.setState({showDropdown: false})
    }


    render() {

        return (<Container>
            <TextInput type="text" placeholder="Search" name="test" value={this.state.search} onChange={(e) => this.inputChanged(e.target.value)}/>
            {this.state.showDropdown && this.state.options.length > 0 &&
            <Dropdown className={"dropdown"} dismiss={() => this.setState({showDropdown: false})}>
                {this.state.options.map(o => <Option key={o.key} onClick={() => this.selectValue(o.value)}>{o.label}</Option>)}
            </Dropdown>}
        </Container>)
    }


}
