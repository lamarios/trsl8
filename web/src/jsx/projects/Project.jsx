import React from 'react';
import styled from 'styled-components'
import Service from "../Service";
import Title from "../basic/Title";
import TextInput from "../basic/TextInput";
import update from 'immutability-helper';
import Checkbox from "../basic/Checkbox";
import Pagination from "../basic/Pagination";
import MultiSelect from "../basic/MultiSelect";
import Loading from "../basic/Loading";
import TextArea from "../basic/TextArea";
import PrimaryButton from "../basic/PrimaryButton";
import OkDialog from "../basic/OkDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTimes} from "@fortawesome/free-solid-svg-icons";
import NewLanguageDialog from "./NewLanguageDialog";
import ProjectUsers from "./ProjectUsers";
import Select from "../basic/Select";
import StringCell from "./StringCell";

const TranslationContainer = styled.table`
  border-collapse: collapse;
min-width: 100%;
    border:none;
      th, tr, td {
      border:none;
      margin:0;
      }
     tbody > tr{
        transition: all 0.25s ease-in-out;
        &:hover{
          background-color: ${props => props.theme.colors.complementary.NeutralLight};
        }
     }
     thead{
      background-color: ${props => props.theme.colors.complementary.Neutral};
      position: sticky;
     } 
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NewLanguageButton = styled(FontAwesomeIcon)`
cursor: pointer;
`;


const Filters = styled.div`
display: flex;
align-items: center;
margin-bottom:10px;
  & > * {
    margin: 0px 10px;
  }
`;


const TableContainer = styled.div`
position: relative;
`;

const TranslationLoading = styled.td`
font-size: 80px;
text-align: center;
`;


const RemoveLanguage = styled(FontAwesomeIcon)`
cursor: pointer;
`;


export default class Project extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            project: undefined,
            terms: [],
            translations: {},
            renderedTerms: [],
            renderedTranslations: {},
            page: 0,
            pageSize: 30,
            filter: '',
            onlyMissing: false,
            totalFilteredTerms: 0,
            filteredLanguages: [],
            languages: [],
            languageLoadings: {},
            newTerm: '',
            showError: false,
            errorMessage: '',
            showNewLanguageDialog: false,
        };
        this.service = new Service();
        this.getProject = this.getProject.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.stringUpdated = this.stringUpdated.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.changePage = this.changePage.bind(this);
        this.changeFilteredLanguages = this.changeFilteredLanguages.bind(this);
        this.createNewTerm = this.createNewTerm.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.removeLanguage = this.removeLanguage.bind(this);
        this.addLanguageColumn = this.addLanguageColumn.bind(this);
        this.filterTerms = this.filterTerms.bind(this);
    }

    componentDidMount() {
        this.getProject();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.getProject()
        }
    }

    addLanguage(language) {
        this.service.createLanguage(this.state.project.ID, language)
            .then(json => {
                const languages = this.state.languages;
                languages.push(language);
                const filteredLanguages = this.state.filteredLanguages;
                filteredLanguages.push(language);

                this.setState({
                    languages: languages,
                    filteredLanguages: filteredLanguages
                }, () => {
                    this.renderPage();
                })
            }).catch(res => {
            res.then(err => err.then(json => this.setState({showError: true, errorMessage: json})))
        });
    }

    addLanguageColumn() {
        const usableLanguages = this.state.languages
            .filter(l => this.state.filteredLanguages.indexOf(l) === -1)
            .sort();

        if (usableLanguages.length > 0) {
            const filteredLanguages = this.state.filteredLanguages;
            filteredLanguages.push(usableLanguages[0]);
            this.setState({filteredLanguages: filteredLanguages}, () => {
                this.getFiles(usableLanguages[0]);
            });
        }


    }

    removeLanguage(language) {
        let filteredLanguages = this.state.filteredLanguages;
        let translations = this.state.translations;

        let index = filteredLanguages.indexOf(language);

        if (index !== -1) {
            filteredLanguages.splice(index, 1);
        }

        translations[language] = {};

        this.setState({filteredLanguages: filteredLanguages, translations: translations}, () => this.renderPage());
    }

    createNewTerm() {
        let term = this.state.newTerm;
        if (term.length > 0) {

            this.service.createTerm(this.state.project.ID, term)
                .then(json => {
                    let terms = this.state.terms;
                    terms.push(term)

                    this.setState({terms: terms, newTerm: ''}, () => this.renderPage())
                }).catch(res => res.then(err => this.setState({showError: true, errorMessage: err})));
        } else {
            this.setState({showError: true, errorMessage: 'Please input something as a term'})
        }
    }

    getFiles(language) {
        const loadings = this.state.languageLoadings;
        loadings[language] = true;

        this.setState({languageLoadings: loadings}, () => {

            this.service.getProjectStrings(this.props.match.params.id, language)
                .then(res => {
                    // let keys = Object.keys(res[this.state.project.MainLanguage]);
                    let translations = this.state.translations;
                    translations[language] = res;

                    const loadings = this.state.languageLoadings;
                    loadings[language] = false;

                    this.setState({
                        translations: translations,
                        languageLoadings: loadings
                    }, this.renderPage);
                });
        });
    }


    changePage(page) {
        this.setState({page: page}, () => this.renderPage());
    }

    changeFilteredLanguages(language, index) {
        console.log(language, index);
        const languages = this.state.filteredLanguages;
        languages[index] = language;
        console.log(this.state.filteredLanguages);
        this.setState({filteredLanguages: languages}, () => {
            console.log(this.state.filteredLanguages);
            this.getFiles(language);
        });
    }

    filterTerms(terms) {
        return terms
            .filter(s => this.state.filter.length === 0 || s.toUpperCase().replace("_", " ").includes(this.state.filter.toUpperCase()))
            .filter(s => {
                if (this.state.onlyMissing) {
                    var missing = false;
                    this.state.filteredLanguages
                        .forEach(language => {
                            let value = this.state.translations[language][s];
                            if (value === undefined || value.length === 0) {
                                missing = true;
                            }

                        });

                    return missing;
                } else {
                    return true;
                }
            });
    }

    renderPage() {

        let start = this.state.page * this.state.pageSize;
        let end = start + this.state.pageSize;

        //reducing the items displayed
        let slicedTerms = this.filterTerms(this.state.terms);

        let totalFilteredTerms = slicedTerms.length;

        slicedTerms = slicedTerms.slice(start, end);


        let renderedTranslations = {};

        Object.keys(this.state.translations).forEach(key => {
            renderedTranslations[key] = {};
            slicedTerms.forEach(t => {
                renderedTranslations[key][t] = this.state.translations[key][t];
            })
        });


        this.setState({
            renderedTranslations: renderedTranslations,
            renderedTerms: slicedTerms,
            totalFilteredTerms: totalFilteredTerms
        });

    }

    stringUpdated(term, language, value) {
        this.setState({
            renderedTranslations: update(this.state.renderedTranslations, {[language]: {[term]: {$set: value}}}),
            translations: update(this.state.translations, {[language]: {[term]: {$set: value}}})
        },);
    }


    getProject(getFiles) {
        if (getFiles === undefined) getFiles = true;


        this.service.getProject(this.props.match.params.id)
            .then(project => this.setState({project: project}, () => {
                this.service.getProjectTerms(project.ID)
                    .then(terms => {
                        this.setState({terms: terms, renderedTerms: this.filterTerms(terms)}, () => {
                            this.service.getLanguages(project.ID)
                                .then(res => {

                                    let filteredLanguages = [];
                                    if (res.length >= 1) {
                                        filteredLanguages[0] = res[res.indexOf(project.MainLanguage)];
                                    }

                                    this.setState({languages: res, filteredLanguages: filteredLanguages}, () => {
                                        if (getFiles) {
                                            this.state.filteredLanguages.forEach(l => this.getFiles(l));
                                        }
                                    });
                                });
                        });
                    });
            }));
    }

    render() {

        let languages = this.state.filteredLanguages;

        return (<div>
            {this.state.project !== undefined && <div>
                <Title>{this.state.project.Name}</Title>
                <ProjectUsers project={this.state.project} onUsersChanged={() => this.getProject(false)}/>
                <Filters>
                    <div>Languages:</div>
                    <NewLanguageButton icon={faPlus} onClick={() => this.setState({showNewLanguageDialog: true})}/>
                    <div>Filter:</div>
                    <TextInput id={"filter"} value={this.state.filter}
                               onChange={(e) => this.setState({
                                   filter: e.target.value,
                                   page: 0
                               }, () => this.renderPage())}/>
                    <Checkbox value={this.state.onlyMissing}
                              label="Show only Missing"
                              onChange={(e) => this.setState({
                                  onlyMissing: e.target.checked,
                                  page: 0
                              }, () => this.renderPage())}/>
                </Filters>

                <TableContainer>
                    <TranslationContainer>
                        <thead>
                        <tr>
                            <th>Terms</th>
                            {languages.map((lang, index) =>
                                <th key={lang}>
                                    <TableHead>
                                        <Select value={lang}
                                                options={this.state.languages.filter(s => languages.indexOf(s) === -1)}
                                                onChange={(value) => this.changeFilteredLanguages(value, index)}/>
                                        {languages.length > 1 &&
                                        <RemoveLanguage icon={faTimes} onClick={() => this.removeLanguage(lang)}/>}
                                    </TableHead>
                                </th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.renderedTerms.map((t, index) => <tr key={t}>
                            <td>{t}</td>
                            {languages.map((l) => {
                                    if (this.state.languageLoadings[l] !== undefined
                                        && this.state.languageLoadings[l] === true
                                    ) {
                                        if(index === 0) {
                                            return <TranslationLoading key={l} rowSpan={this.state.renderedTerms.length}>
                                                <Loading/>
                                            </TranslationLoading>
                                        }else{
                                            return <td></td>;
                                        }
                                    } else {
                                        return <StringCell key={l}
                                                           value={this.state.renderedTranslations[l] !== undefined
                                                               ? this.state.renderedTranslations[l][t] : ''}
                                                           onChange={this.stringUpdated}
                                                           language={l}
                                                           term={t}
                                                           project={this.state.project}
                                        />
                                    }
                                }
                            )}
                            {index === 0 && languages.length < this.state.languages.length &&
                            <td rowSpan={this.state.renderedTerms.length}>
                                <FontAwesomeIcon icon={faPlus} onClick={this.addLanguageColumn}/>
                            </td>}
                        </tr>)}

                        <tr>
                            <td colSpan={this.state.filteredLanguages.length + 1}>
                                Create term: <TextInput value={this.state.newTerm}
                                                        onChange={(e) => this.setState({newTerm: e.target.value})}/>
                                <PrimaryButton onClick={this.createNewTerm}>Add</PrimaryButton>
                            </td>
                        </tr>

                        </tbody>
                    </TranslationContainer>
                    <Pagination page={this.state.page} onPageChange={this.changePage}
                                itemCount={this.state.totalFilteredTerms} pageSize={this.state.pageSize}/>
                </TableContainer>
            </div>}

            {this.state.showError && <OkDialog dismiss={() => this.setState({showError: false})}>
                {this.state.errorMessage}
            </OkDialog>}
            {this.state.showNewLanguageDialog &&
            <NewLanguageDialog dismiss={() => this.setState({showNewLanguageDialog: false})}
                               addLanguage={this.addLanguage}
                               existingLanguages={Object.keys(this.state.translations)}/>}
        </div>)
    }

}
