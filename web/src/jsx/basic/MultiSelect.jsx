import React from 'react';
import styled from 'styled-components';
import Dropdown from "./Dropdown";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronDown, faCheck} from '@fortawesome/free-solid-svg-icons'
import {popIn} from "../animations";

const Option = styled.div`
 cursor: pointer;
 display:flex;
 align-items: center;
`;

const Options = styled.div``;
const Input = styled.div`
cursor: pointer;
 border: 1px solid ${props => props.theme.colors.inputBorder};
border-radius: 5px;
height:30px;
display: flex;
align-items: center;
padding: 0 7px;
`;


const Chevron = styled(FontAwesomeIcon)`
display:block;
margin: 0 2px;
`;
const Container = styled.div`
position: relative;
`;

const Selected = styled.div`
 width:20px;
`;
const CheckedIcon = styled(FontAwesomeIcon)`
    font-size:12px;
    animation: ${popIn} 0.25s ease-in;
`;
export default class MultiSelect extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            showDropDown: false,
        }

        this.toggleValue = this.toggleValue.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
    }


    toggleDropDown() {
        this.setState({showDropDown: !this.state.showDropDown});
    }

    toggleValue(value) {
        let index = this.props.values.indexOf(value);
        if (index === -1) {
            let values = this.props.values;
            values.push(value);
            this.props.onChange(values);
        } else { // we already have it in the array, we need to remove it
            let values = this.props.values;
            values.splice(index, 1);
            this.props.onChange(values);
        }
    }

    render() {
        console.log(this.props.options);
        return (<Container>
            {this.props.label !== undefined && <span>{this.props.label}:</span>}

            <Input onClick={this.toggleDropDown}>
                {this.props.options.length} selected
                <Chevron icon={faChevronDown}/></Input>

            {this.state.showDropDown &&
            <Dropdown dismiss={this.toggleDropDown}>
                <Options>
                    {this.props.allowClearAll && <Option onClick={() => this.props.onChange([])}><Selected></Selected>Clear all</Option>}
                    {this.props.options.map((o, k) => {
                        return (<Option key={k} onClick={() => this.toggleValue(o)}>
                            <Selected>
                                {this.props.values.indexOf(o) !== -1 && <CheckedIcon icon={faCheck}/>}
                            </Selected>
                            {o}
                        </Option>);
                    })}
                </Options>
            </Dropdown>}
        </Container>);
    }
}