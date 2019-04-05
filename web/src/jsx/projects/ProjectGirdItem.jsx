import React from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt, faTimes} from "@fortawesome/free-solid-svg-icons";
import {service} from "../Service";
import ProgressBar from "../basic/ProgressBar";
import {fadeInLeft} from "../animations";
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
`;
const LanguageProgress = styled.div`
padding-bottom: 10px;
    animation: ${fadeInLeft} 0.25s ease-out;
`;
const LanguageName = styled.div`
  width:60px;
`;

export default class ProjectGirdItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {progress: {}, loading:true};
    }

    componentDidMount() {
        service.getProjectProgress(this.props.project.ID)
            .then(progress => {
                var sortedProgress = {};
                Object.keys(progress)
                    .sort((a, b) => progress[a] - progress[b])
                    .reverse()
                    .slice(0, 3)
                    .forEach(k => sortedProgress[k] = progress[k]);

                this.setState({progress: sortedProgress, loading:false});
            });
    }

    render() {

        const projectLink = "/projects/" + this.props.project.ID;
        const progress = this.state.progress;

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
                    {Object.keys(progress).map(k => <Progress key={k}>

                        <LanguageName>{k}</LanguageName>
                        <ProgressBar percent={progress[k]}/>

                    </Progress>)}
                </LanguageProgress>}
                {this.state.loading && <Loading />}
            </td>
        </tr>);
    }
}