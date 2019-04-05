import React from "react";
import styled from "styled-components";
import Service from "../Service";
import Title from "../basic/Title";
import TextInput from "../basic/TextInput";
import update from "immutability-helper";
import Pagination from "../basic/Pagination";
import Loading from "../basic/Loading";
import PrimaryButton from "../basic/PrimaryButton";
import OkDialog from "../basic/OkDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import NewLanguageDialog from "./NewLanguageDialog";
import ProjectUsers from "./ProjectUsers";
import StringCell from "./StringCell";
import LanguageSelector from "./LanguageSelector";
import ProjectFilter from "./ProjectFilter";
import CreateNewTerm from "./CreateNewTerm";
import ProgressBar from "../basic/ProgressBar";


const TitleBar = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectTitle = styled(Title)`
flex-grow: 1;
`;

const TranslationContainer = styled.table`
    unset:all;
    border-spacing: 0 0;
    border-collapse: collapse;
    min-width: 100%;
    border:none;

    thead{
        tr > th {
            text-align: left;
            border-bottom: 1px solid ${props => props.theme.colors.text.light};
        }
    }
    
    tr, td{
        height: 36px;
    }
`;


const NewLanguageButton = styled(PrimaryButton)`
cursor: pointer;
`;


const TableContainer = styled.div`
position: relative;
`;

const TranslationLoading = styled.td`
font-size: 40px;
text-align: center;
`;

const AddLanguageColumnButton = styled.div`
  color: ${props => props.theme.colors.primary.main};
  padding: 10px;
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
            pageSize: 20,
            filter: "",
            onlyMissing: false,
            totalFilteredTerms: 0,
            filteredLanguages: [],
            languages: [],
            languageLoadings: {},
            showNewLanguageDialog: false,
        };
        this.service = new Service();
        this.getProject = this.getProject.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.stringUpdated = this.stringUpdated.bind(this);
        this.renderPage = this.renderPage.bind(this);
        this.changePage = this.changePage.bind(this);
        this.changeFilteredLanguages = this.changeFilteredLanguages.bind(this);
        this.onNewTerm = this.onNewTerm.bind(this);
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
            this.getProject();
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
                });
            }).catch(res => {
            res.then(err => err.then(json => this.setState({showError: true, errorMessage: json})));
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

    onNewTerm(term) {
        if (term.length > 0) {
            let terms = this.state.terms;
            terms.push(term);

            this.setState({terms: terms, newTerm: ""}, () => this.renderPage());
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
        let start = this.state.page * this.state.pageSize;
        let end = start + this.state.pageSize;

        let slicedTerms = terms
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

        this.setState({totalFilteredTerms: slicedTerms.length});
        return slicedTerms.slice(start, end);
    }

    renderPage() {

        //reducing the items displayed
        let slicedTerms = this.filterTerms(this.state.terms);


        let renderedTranslations = {};

        Object.keys(this.state.translations).forEach(key => {
            renderedTranslations[key] = {};
            slicedTerms.forEach(t => {
                renderedTranslations[key][t] = this.state.translations[key][t];
            });
        });


        this.setState({
            renderedTranslations: renderedTranslations,
            renderedTerms: slicedTerms,
        });

    }

    stringUpdated(term, language, value) {
        console.log(term, language, value);
        const renderedTranslations = this.state.renderedTranslations;
        const translations = this.state.translations;

        if (renderedTranslations[language] === undefined) {
            renderedTranslations[language] = {};
        }

        if (translations[language] === undefined) {
            translations[language] = {};
        }

        renderedTranslations[language][term] = value;
        translations[language][term] = value;


        this.setState({
            renderedTranslations,
            translations
        },);
    }


    getProject(getFiles) {
        if (getFiles === undefined) getFiles = true;


        this.service.getProject(this.props.match.params.id)
            .then(project => {
                this.setState({project: project}, () => {
                    //adding flag to make life easier
                    project.isOwner = this.service.getUserData().ID === project.OwnerID;

                    this.service.getProjectTerms(project.ID)
                        .then(terms => {
                            this.setState({terms: terms, renderedTerms: this.filterTerms(terms)}, () => {
                                this.service.getLanguages(project.ID)
                                    .then(res => {

                                        if (this.state.filteredLanguages.length == 0) {
                                            let filteredLanguages = [];
                                            if (res.length >= 1) {
                                                filteredLanguages[0] = res[res.indexOf(project.MainLanguage)];
                                            }


                                            this.setState({
                                                languages: res,
                                                filteredLanguages: filteredLanguages
                                            }, () => {
                                                if (getFiles) {
                                                    this.state.filteredLanguages.forEach(l => this.getFiles(l));
                                                }
                                            });
                                        }
                                    });
                            });
                        });
                });
            });
    }

    render() {

        let languages = this.state.filteredLanguages;

        return (<div>
            {this.state.project !== undefined && <div>
                <TitleBar>
                    <ProjectTitle>
                        {this.state.project.Name}
                    </ProjectTitle>
                    <NewLanguageButton onClick={() => this.setState({showNewLanguageDialog: true})}>
                        <FontAwesomeIcon icon={faPlus}/>
                        &nbsp;New language
                    </NewLanguageButton>
                    <ProjectUsers project={this.state.project} onUsersChanged={() => this.getProject(false)}/>
                </TitleBar>
                <ProjectFilter
                    filter={this.state.filter}
                    onFilterChanged={(value => this.setState({
                        filter: value,
                        page: 0
                    }, () => this.renderPage()))}
                    onlyMissing={this.state.onlyMissing}
                    onlyMissingChanged={value => this.setState({
                        onlyMissing: value,
                        page: 0
                    }, () => this.renderPage())}
                />

                <TableContainer>
                    <TranslationContainer>
                        <thead>
                        <tr>
                            <th> Terms</th>
                            {languages.map((lang, index) =>
                                <LanguageSelector key={lang}
                                                  value={lang}

                                                  options={this.state.languages.filter(s => languages.indexOf(s) === -1)}
                                                  onChange={(value) => this.changeFilteredLanguages(value, index)}
                                                  showRemove={languages.length > 1}
                                                  onRemove={(lang) => this.removeLanguage(lang)}
                                />
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td></td>
                            {languages.map((lang, index) => {
                                let progress = 0;
                                if (this.state.translations[lang] !== undefined) {
                                    progress = Object.keys(this.state.translations[lang])
                                        .filter(k => this.state.translations[lang][k].length > 0)
                                        .length;

                                    progress = Math.min(progress, this.state.terms.length);
                                }
                                return <td key={lang}>
                                    <ProgressBar value={progress} max={this.state.terms.length}/>
                                </td>;
                            })}
                        </tr>
                        {this.state.renderedTerms.map((t, index) => <tr key={t}>
                            <td>{t}</td>
                            {languages.map((l) => {
                                    if (this.state.languageLoadings[l] !== undefined
                                        && this.state.languageLoadings[l] === true
                                    ) {
                                        if (index === 0) {
                                            return <TranslationLoading key={l} rowSpan={this.state.renderedTerms.length}>
                                                <Loading/>
                                            </TranslationLoading>;
                                        } else {
                                            return null;
                                        }
                                    } else {
                                        return <StringCell key={l}
                                                           value={this.state.renderedTranslations[l] !== undefined
                                                               ? this.state.renderedTranslations[l][t] : ""}
                                                           onChange={this.stringUpdated}
                                                           language={l}
                                                           term={t}
                                                           project={this.state.project}
                                        />;
                                    }
                                }
                            )}
                            {index === 0 && languages.length < this.state.languages.length &&
                            <td rowSpan={this.state.renderedTerms.length}>
                                <AddLanguageColumnButton onClick={this.addLanguageColumn}>
                                    <FontAwesomeIcon icon={faPlus}/>
                                </AddLanguageColumnButton>
                            </td>}
                        </tr>)}

                        <tr>
                            <td colSpan={this.state.filteredLanguages.length + 1}>
                            </td>
                        </tr>

                        </tbody>
                    </TranslationContainer>
                    <Pagination page={this.state.page} onPageChange={this.changePage}
                                itemCount={this.state.totalFilteredTerms} pageSize={this.state.pageSize}/>
                    <CreateNewTerm onNewTerm={this.onNewTerm} project={this.state.project}/>
                </TableContainer>
            </div>}

            {this.state.showError && <OkDialog dismiss={() => this.setState({showError: false})}>
                {this.state.errorMessage}
            </OkDialog>}
            {this.state.showNewLanguageDialog &&
            <NewLanguageDialog dismiss={() => this.setState({showNewLanguageDialog: false})}
                               addLanguage={this.addLanguage}
                               existingLanguages={Object.keys(this.state.translations)}/>}
        </div>);
    }

}
