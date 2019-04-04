import React from 'react';
import styled from 'styled-components';
import {NavLink} from 'react-router-dom'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileAlt, faTimes} from '@fortawesome/free-solid-svg-icons'

const Link = styled(NavLink)`
display: block;
width: 100%;
transition:  all 0.25s ease;
cursor:pointer;
text-decoration: none;
color: ${props => props.theme.colors.text.main};
`;

const Icon = styled(FontAwesomeIcon)`
color: ${props => props.theme.colors.primary.light};
`;


const Actions = styled.div`
text-align: right;
`;

export default class ProjectGirdItem extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props)
    }


    render() {

        const projectLink = "/projects/" + this.props.project.ID;

        return (<tr>
            <td>
                <Link to={projectLink}>
                    <Icon icon={faFileAlt}/>&nbsp;
                    {this.props.project.Name}
                </Link>
            </td>
        </tr>);
    }
}