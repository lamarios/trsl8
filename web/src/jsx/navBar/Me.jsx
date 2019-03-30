import React from 'react';
import styled from 'styled-components';
import Service from "../Service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "../basic/Dropdown";

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
  background-color: ${props => props.theme.colors.complementary.NeutralDark};
`;

const UserName = styled.div``;

const UserDropdown = styled(Dropdown)``;

const MenuItem = styled.div``;

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


    logOut(){
        window.localStorage.removeItem("token");
        window.location.href = "/";
    }

    getSelf() {
        this.service.getSelf()
            .then(res => this.setState({user: res}));
    }


    toggleDropdown(){
        this.setState({dropdown: !this.state.dropdown})
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
                        <MenuItem onClick={this.logOut}>Log out</MenuItem>
                    </Dropdown> }
                </Container>)
        } else {
            return <Container/>
        }
    }
}
