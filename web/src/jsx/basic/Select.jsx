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
border: 1px ${props => props.theme.colors.primary.NeutralDark} solid;
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
export default class Select extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            showDropDown: false,
        }

        this.toggleValue = this.toggleValue.bind(this);
        this.toggleDropDown = this.toggleDropDown.bind(this);
        this.uuidv4 = this.uuidv4.bind(this);
    }

    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    toggleDropDown() {
        this.setState({showDropDown: !this.state.showDropDown});
    }

    toggleValue(value) {
        this.props.onChange(value);
        this.setState({showDropDown: false});
    }

    render() {
        return (<Container>
            {this.props.label !== undefined && <span>{this.props.label}:</span>}

            <Input onClick={this.toggleDropDown}>
                {this.props.value === undefined || this.props.value.length === 0? <span>Select</span>
                : <span>{this.props.value}</span>}
                <Chevron icon={faChevronDown}/></Input>

            {this.state.showDropDown &&
            <Dropdown dismiss={this.toggleDropDown}>
                <Options>
                    {this.props.options.map((o, k) => {
                        return (<Option key={k} onClick={() => this.toggleValue(o)}>

                            <Selected>
                                {this.props.value === o && <CheckedIcon icon={faCheck}/>}
                            </Selected>
                            {o}
                        </Option>);
                    })}
                </Options>
            </Dropdown>}
        </Container>);
    }
}
