import React from 'react';
import styled from 'styled-components';
import {fadeIn} from "../animations";
import {NavLink} from 'react-router-dom'

const Link = styled(NavLink)`
background-color: ${props => props.theme.colors.complementary.NeutralLight};
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
 
    text-decoration: none;
    color: ${props => props.theme.colors.primary.main};
 
 &:hover{
  background-color: ${props => props.theme.colors.primary.Light};
  transform: scale(1.05);
    color: ${props => props.theme.colors.complementary.main};
 }
 
display: flex;
justify-content: center;
align-items: center;
`;

export default class ProjectGirdItem extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props)
    }


    render() {
        return (<Link to={"/projects/" + this.props.project.ID}>
            {this.props.project.Name}
        </Link>);
    }
}