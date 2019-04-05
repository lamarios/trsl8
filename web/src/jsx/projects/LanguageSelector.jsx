import React from 'react';
import styled from 'styled-components';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Select from "../basic/Select";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import ProgressBar from "../basic/ProgressBar";

const TableHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  .input{
    border: none;
  }
`;

const RemoveLanguage = styled(FontAwesomeIcon)`
cursor: pointer;
`;

export default class LanguageSelector extends  React.Component{


    render() {
       return (<th>
            <TableHead>
                <Select value={this.props.value}
                        options={this.props.options}
                        onChange={this.props.onChange}/>
                {this.props.showRemove &&
                <RemoveLanguage icon={faTimes} onClick={() => this.props.onRemove(this.props.value)}/>}
            </TableHead>
        </th>)
    }

}