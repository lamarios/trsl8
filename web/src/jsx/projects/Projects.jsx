import React from 'react';
import styled from 'styled-components'
import Service from "../Service";
import Title from "../basic/Title";
import ProjectGirdItem from "./ProjectGirdItem";
import PrimaryButton from "../basic/PrimaryButton";
import NewProjectDialog from "./NewProjectDialog";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import {fadeIn} from "../animations";

const ProjectsContainer = styled.div`
display:flex;
flex-flow: row wrap;
`;


const AddProjectButton = styled(PrimaryButton)`
background-color: ${props => props.theme.colors.background};
width:100px;
height:100px;
margin:10px;
 box-shadow: 0 0 10px rgba(0,0,0,0.3);
 border-radius: 5px;
 padding:20px;
 transition:  all 0.25s ease;
 cursor:pointer;
 
 
 display: flex;
 justify-content: center;
 align-items: center;
 
 
 animation: ${fadeIn} 0.25s ease;
 
 &:hover{
 background-color: ${props => props.theme.colors.dark};
 transform: scale(1.05);
 color: ${props => props.theme.colors.background};
 }
`;

export default class Projects extends React.Component {

    constructor(props) {
        super(props);

        this.state = {projects: [], showNewProjectDialog: false};
        this.service = new Service();

        this.dismissDialog = this.dismissDialog.bind(this);
        this.refreshProjects = this.refreshProjects.bind(this);
    }

    componentDidMount() {
        this.refreshProjects();
    }

    refreshProjects() {
        this.service.getProjects()
            .then(projects => this.setState({projects: projects}));

    }

    dismissDialog() {
        this.setState({showNewProjectDialog: false}, this.refreshProjects);

    }

    render() {
        return (<div>
            <Title>Projects</Title>
            <ProjectsContainer>
                {this.state.projects.map((project) => {
                    return <ProjectGirdItem project={project} key={project.ID}/>
                })}

                <AddProjectButton onClick={() => this.setState({showNewProjectDialog: true})}>
                    <FontAwesomeIcon icon={faPlus}/>
                </AddProjectButton>
            </ProjectsContainer>

            {this.state.showNewProjectDialog && <NewProjectDialog dismiss={this.dismissDialog}/>}
        </div>)
    }
}