import React from "react";
import styled from "styled-components";
import Service from "../Service";
import Title from "../basic/Title";
import Pagination from "../basic/Pagination";
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
import {fadeInLeft} from "../animations";


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
animation: ${fadeInLeft} 0.25s ease-out;
`;


const AddLanguageColumnButton = styled.div`
  color: ${props => props.theme.colors.primary.main};
  padding: 10px;
  cursor: pointer;
`;

const LanguageProgressRow = styled.tr`
    background-color: #fbfbfb;
    td{
        border-bottom: 1px solid ${props => props.theme.colors.text.light};
        padding: 0px 10px;
    }
`;

const ProjectInfoContainer = styled.div`
animation: ${fadeInLeft} 0.25s ease-out;
`;

export default class Project extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            project: undefined,
            terms: [],
            translations: {},
            progress: {},
            total: 0,
            page: 0,
            pageSize: 20,
            filter: {
                filter: "",
                onlyMissing: false,
            },
            languages: [],
            filteredLanguages: [],
            showNewLanguageDialog: false,
            loadingStrings: true,
            filterTimeout: undefined,
        };
        this.service = new Service();
        this.getProject = this.getProject.bind(this);
        this.getStrings = this.getStrings.bind(this);
        this.stringUpdated = this.stringUpdated.bind(this);
        this.changePage = this.changePage.bind(this);
        this.changeFilteredLanguages = this.changeFilteredLanguages.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.removeLanguage = this.removeLanguage.bind(this);
        this.addLanguageColumn = this.addLanguageColumn.bind(this);
        this.filterChanged = this.filterChanged.bind(this);
    }

    componentDidMount() {
        this.getProject();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.getProject();
        }
    }

    filterChanged(filter) {
        if (this.state.filterTimeout !== undefined) {
            clearTimeout(this.state.filterTimeout);
        }

        this.setState({filter, page: 0}, () => {
            this.setState({filterTimeout: setTimeout(() => this.getStrings(), 500)});
        });

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
                    this.getStrings();
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
                this.getStrings(usableLanguages[0]);
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

        this.setState({filteredLanguages: filteredLanguages, translations: translations}, () => this.getStrings());
    }


    getStrings() {
        const request = {
            Languages: this.state.filteredLanguages,
            Page: this.state.page,
            PageSize: this.state.pageSize,
            MissingOnly: this.state.filter.onlyMissing,
            Filter: this.state.filter.filter,
        };

        this.setState({loadingStrings: true}, () => {

            this.service.getProjectStrings(this.props.match.params.id, request)
                .then(res => {
                    // let keys = Object.keys(res[this.state.project.MainLanguage]);

                    this.setState({
                        translations: res.Translations,
                        terms: res.Terms,
                        progress: res.Progress,
                        total: res.Total
                    });
                });
        });
    }


    changePage(page) {
        this.setState({page: page}, () => this.getStrings());
    }

    changeFilteredLanguages(language, index) {
        console.log(language, index);
        const languages = this.state.filteredLanguages;
        languages[index] = language;
        console.log(this.state.filteredLanguages);
        this.setState({filteredLanguages: languages}, () => {
            this.getStrings();
        });
    }


    stringUpdated(term, language, value) {
        const translations = this.state.translations;

        if (translations[language] === undefined) {
            translations[language] = {};
        }

        translations[language][term] = value;

        this.setState({
            translations
        },);
    }


    getProject(getFiles) {
        if (getFiles === undefined) getFiles = true;


        this.service.getProject(this.props.match.params.id)
            .then(project => {
                project.isOwner = this.service.getUserData().ID === project.OwnerID;
                this.setState({project: project}, () => {
                    //adding flag to make life easier

                    this.service.getLanguages(project.ID)
                        .then(res => {

                            if (this.state.filteredLanguages.length === 0) {
                                let filteredLanguages = [];
                                if (res.length >= 1) {
                                    filteredLanguages[0] = res[res.indexOf(project.MainLanguage)];
                                }


                                this.setState({
                                    languages: res,
                                    filteredLanguages: filteredLanguages
                                }, () => {
                                    if (getFiles) {
                                        this.getStrings();
                                    }
                                });
                            }
                        });
                });
            });
    }

    render() {

        let languages = this.state.filteredLanguages;
        const terms = this.state.terms;
        const translations = this.state.translations;
        const progress = this.state.progress;

        return (<div>
            {this.state.project !== undefined && <div>
                <ProjectInfoContainer>
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
                        onChanged={this.filterChanged}
                    />
                </ProjectInfoContainer>

                {terms.length > 0 &&
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
                        {Object.keys(progress).length > 0 && <LanguageProgressRow>
                            <td>Language Progress</td>
                            {languages.map((lang, index) => {
                                return <td key={lang}>
                                    <ProgressBar percent={progress[lang]}/>
                                </td>;
                            })}
                        </LanguageProgressRow>}
                        {terms.map((t, index) => <tr key={t}>
                            <td>{t}</td>
                            {languages.map((l) => {
                                    return <StringCell key={l}
                                                       value={translations[l] !== undefined
                                                           ? translations[l][t] : ""}
                                                       onChange={this.stringUpdated}
                                                       language={l}
                                                       term={t}
                                                       project={this.state.project}
                                    />;
                                }
                            )}
                            {index === 0 && languages.length < this.state.languages.length &&
                            <td rowSpan={terms.length}>
                                <AddLanguageColumnButton onClick={this.addLanguageColumn}>
                                    <FontAwesomeIcon icon={faPlus}/>
                                </AddLanguageColumnButton>
                            </td>}
                        </tr>)}

                        <tr>
                            <td colSpan={languages.length + 1}>
                            </td>
                        </tr>

                        </tbody>
                    </TranslationContainer>
                    <Pagination page={this.state.page} onPageChange={this.changePage}
                                itemCount={this.state.total} pageSize={this.state.pageSize}/>
                </TableContainer>
                }
                <CreateNewTerm onNewTerm={this.getStrings} project={this.state.project}/>
            </div>}

            {this.state.showError && <OkDialog dismiss={() => this.setState({showError: false})}>
                {this.state.errorMessage}
            </OkDialog>}
            {this.state.showNewLanguageDialog &&
            <NewLanguageDialog dismiss={() => this.setState({showNewLanguageDialog: false})}
                               addLanguage={this.addLanguage}
                               existingLanguages={this.state.languages}/>}
        </div>);
    }

}
