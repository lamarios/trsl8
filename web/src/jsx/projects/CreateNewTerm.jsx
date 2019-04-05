import React from "react";
import styled from "styled-components";
import TextInput from "../basic/TextInput";
import PrimaryButton from "../basic/PrimaryButton";
import {service} from "../Service";
import Loading from "../basic/Loading";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
   > * {
    margin-right:5px;
   }
`;

const Creating = styled.div`
 & > svg {
 color: ${props => props.theme.colors.background};
 }
`;

const Error = styled.div`
 color: ${props => props.theme.colors.error};
`;

export default class CreateNewTerm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {newTerm: "", errorMessage: "", showError: "false", loading: false};
        this.createNewTerm = this.createNewTerm.bind(this);
    }

    createNewTerm() {
        let term = this.state.newTerm;
        if (term.length > 0) {

            this.setState({loading: true, showError: false, errorMessage: ''}, () => {
                service.createTerm(this.props.project.ID, term)
                    .then(json => {
                        this.props.onNewTerm(term);
                        this.setState({loading: false, newTerm:""});
                    }).catch(res => {
                        console.log(res);
                        res.then(err => this.setState({
                        loading: false,
                        showError: true,
                        errorMessage: err
                    }))
                });
            });
        } else {
            this.setState({showError: true, errorMessage: "Terms can't be empty"});
        }
    }

    render() {
        return (<Container>
            Create term: <TextInput value={this.state.newTerm}
                                    onChange={(e) => this.setState({newTerm: e.target.value})}
        disabled={this.state.loading}
        />
            <PrimaryButton onClick={this.createNewTerm} disabled={this.state.loading}>
            {this.state.loading ? <Creating><Loading/></Creating> : <FontAwesomeIcon icon={faPlus}/>}
        </PrimaryButton>
            {this.state.showError && <Error>{this.state.errorMessage}</Error>}
        </Container>);
    }
}
