import React from "react";
import styled from "styled-components";
import Service from "../Service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser, faPen, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "../basic/Dropdown";
import {NavLink} from "react-router-dom";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  cursor: pointer;
  position: relative;
`;

const UserIcon = styled.div`
  width:30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
 margin: 0 10px; 
  background-color: ${props => props.theme.colors.primary.NeutralDark};
`;

const UserName = styled.div``;

const UserDropdown = styled(Dropdown)``;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MenuLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.main};
  text-decoration: none;
  &:hover {
  text-decoration: none;
  }
`;

const Icon = styled(FontAwesomeIcon)`
font-size: 17px;
`;

export default class Me extends React.Component {
    constructor(props) {
        super(props);

        this.state = {user: undefined, dropdown: false};

        this.getSelf = this.getSelf.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.logOut = this.logOut.bind(this);
        this.service = new Service();
    }

    componentDidMount() {
        this.getSelf();
    }


    logOut() {
        window.localStorage.removeItem("token");
        window.location.href = "/";
    }

    getSelf() {
        this.service.getSelf()
            .then(res => this.setState({user: res}));
    }


    toggleDropdown() {
        this.setState({dropdown: !this.state.dropdown});
    }


    render() {

        const user = this.state.user;
        if (user !== undefined) {
            return (
                <Container onClick={this.toggleDropdown}>

                    <UserIcon>
                        <FontAwesomeIcon icon={faUser}/>
                    </UserIcon>
                    <UserName>
                        {user.FirstName} {user.LastName}
                    </UserName>

                    {this.state.dropdown === true && <Dropdown right="0" top="30px" dismiss={this.toggleDropdown}>
                        <MenuLink to="/profile"><MenuItem><Icon icon={faPen} fixedWidth/>&nbsp;Edit
                            Profile</MenuItem></MenuLink>
                        <MenuItem onClick={this.logOut}><Icon icon={faSignOutAlt} fixedWidth/>&nbsp;Log out</MenuItem>
                    </Dropdown>}
                </Container>);
        } else {
            return <Container/>;
        }
    }
}
