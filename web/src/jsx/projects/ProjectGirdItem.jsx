import React from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt, faChevronUp, faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {service} from "../Service";
import ProgressBar from "../basic/ProgressBar";
import {fadeInLeft, fadeInTop} from "../animations";
import Loading from "../basic/Loading";

const Link = styled(NavLink)`
display: block;
width: 100%;
transition:  all 0.25s ease;
cursor:pointer;
text-decoration: none;
color: ${props => props.theme.colors.text.main};
padding: 5px;
`;

const Icon = styled(FontAwesomeIcon)`
color: ${props => props.theme.colors.primary.light};
`;


const Actions = styled.div`
text-align: right;
`;

const Progress = styled.div`
display: flex;
align-items: center;
    animation: ${props => props.animate ? fadeInLeft : "none"} 0.25s ease-out
`;
const LanguageProgress = styled.div`
padding-bottom: 10px;
    animation: ${fadeInLeft} 0.25s ease-out;
`;
const LanguageName = styled.div`
  width:60px;
`;

const Chevron = styled.div`
  text-align: center;
  cursor:pointer;
  color: ${props => props.theme.colors.text.light};
`;

export default class ProjectGirdItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: {}, loading: true, showAll: false};
        this.expand = this.expand.bind(this);
    }

    componentDidMount() {
        service.getProjectProgress(this.props.project.ID)
            .then(progress => {
                this.setState({progress, loading: false});
            });
    }


    expand() {
        this.setState({showAll: true});
    }

    render() {

        const projectLink = "/projects/" + this.props.project.ID;
        const progress = this.state.progress;
        const keys = Object.keys(progress);
        let sortedKeys = keys
            .sort((a, b) => progress[a] - progress[b])
            .reverse();

        if (!this.state.showAll) {
            sortedKeys = sortedKeys.slice(0, 3);
        }

        return (<tr>
            <td valign="top">
                <Link to={projectLink}>
                    <Icon icon={faFileAlt}/>&nbsp;
                    {this.props.project.Name}
                </Link>
            </td>
            <td>
                {Object.keys(progress).length > 0 &&
                <LanguageProgress>
                    {sortedKeys.map((k,i) => <Progress key={k} animate={this.state.showAll && i > 3}>
                            <LanguageName>{k}</LanguageName>
                            <ProgressBar percent={progress[k]}/>
                        </Progress>
                    )}
                    {!this.state.showAll && keys.length > 3 && <Chevron onClick={this.expand}>
                        <FontAwesomeIcon icon={faChevronDown}/>
                    </Chevron>}
                </LanguageProgress>}
                {this.state.loading && <Loading/>}
            </td>
        </tr>);
    }
}