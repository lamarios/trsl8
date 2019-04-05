import React from 'react';
import styled from 'styled-components';
import ProjectGirdItem from "./ProjectGirdItem";

const ProjectsContainer = styled.table`
border-spacing: 0 0;
unset:all;
width:100%;
  tbody > tr:nth-of-type(2n){
    background-color: #fafafa;
  }
`;

const ProjectTableHead = styled.thead`
  color: ${props => props.theme.colors.text.title};
  
  tr > th {
    text-align: left;
      border-bottom: 1px solid ${props => props.theme.colors.text.light};
  }
`;

export default class ProjectList extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
        return (<ProjectsContainer>
            <ProjectTableHead>
                <tr>
                    <th>Name</th>
                    <th>Progress (top 3)</th>
                </tr>
            </ProjectTableHead>
            <tbody>
            {this.props.projects.map((project) => {
                return <ProjectGirdItem project={project} key={project.ID}/>
            })}
            </tbody>

        </ProjectsContainer>)
    }
}