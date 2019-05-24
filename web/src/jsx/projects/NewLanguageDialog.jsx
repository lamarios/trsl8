import React from 'react';
import styled from 'styled-components';
import OkCancelDialog from "../basic/OkCancelDialog";
import {LANGUAGE_BY_LOCALE} from "../locales";
import TextInput from "../basic/TextInput";
import Title from "../basic/Title";

const Language = styled.div`
cursor: pointer;
padding: 5px;
  color: ${props => props.theme.colors.text.main};
  span{
  color: ${props => props.theme.colors.primary.main};
  font-weight: bold;
  }
`;

const SelectedLanguage = styled(Language)`
    background-color: ${props => props.theme.colors.primary.lightest};
    color: white;
  span{
  color: ${props => props.theme.colors.background};
  
  }
`;

const ResultContainer = styled.div`
max-height: 300px;
overflow-y: auto;
`;


export default class NewLanguageDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selected: '', filter: ''};

        this.addLanguage = this.addLanguage.bind(this);
    }

    addLanguage() {
        if (this.state.selected.length > 0) {
            this.props.addLanguage(this.state.selected);
            this.props.dismiss();
        }else{

        }
    }

    render() {
        const existingLanguages = this.props.existingLanguages || [];
        let filteredLanguages = this.state.filter.length > 0 ? Object.keys(LANGUAGE_BY_LOCALE)
                .filter(k => existingLanguages.indexOf(k) === -1)
                .filter(k => {
                    const keyUp = k.toUpperCase();
                    const filterUp = this.state.filter.toUpperCase();
                    const localeUp = LANGUAGE_BY_LOCALE[k].toUpperCase();
                    return keyUp.indexOf(filterUp) !== -1 || localeUp.indexOf(filterUp) !== -1;
                })
            : [];

        return (<OkCancelDialog dismiss={this.props.dismiss}
                                onOk={() => this.addLanguage()}
        >
            <Title>Add new Language</Title>
            <TextInput label="Search" value={this.state.filter}
                       onChange={(e) => this.setState({filter: e.target.value})}/>
            <ResultContainer>
                {filteredLanguages.map(k =>
                    this.state.selected == k ?
                        <SelectedLanguage key={k}>
                            {LANGUAGE_BY_LOCALE[k]} <span>{k}</span>
                        </SelectedLanguage>
                        :
                        <Language key={k} onClick={() => this.setState({selected: k})}>
                            {LANGUAGE_BY_LOCALE[k]} <span>{k}</span>
                        </Language>
                )}
            </ResultContainer>
        </OkCancelDialog>)
    }
}