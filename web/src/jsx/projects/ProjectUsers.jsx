import React from "react";
import styled from "styled-components";
import Service from "../Service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faUsers, faTimes} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "../basic/Dropdown";
import UserPill from "../UserPill";
import SidePanel from "../basic/SidePanel";
import Title from "../basic/Title";
import AutoComplete from "../basic/AutoComplete";

const Container = styled.div`
display: flex;
align-items: center;
font-size: 15px;
cursor:pointer;
`;
const FaIcon = styled(FontAwesomeIcon)`
display: block;
background-color: #ccc;
padding:10px;
border-radius: 50%;
margin: 0 5px;
`;

const PanelTitle = styled(Title)`
color: ${props => props.theme.colors.background};
margin-bottom: 20px;
`;


const Users = styled.div`
display: flex;
flex-direction: column;
margin-bottom: 20px;
`;


const Panel = styled.div`
`;

const AutoCompleteContainer = styled.div`

  .dropdown{
  color: ${props => props.theme.colors.text.main};
  }
`;


export default class ProjectUsers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {showPanel: false};
        this.removeUser = this.removeUser.bind(this);
        this.getAutoCompleteValues = this.getAutoCompleteValues.bind(this);
        this.addUser = this.addUser.bind(this);
        this.service = new Service();
    }

    removeUser(userId) {
        this.service.removeUserFromProject(this.props.project.ID, userId)
            .then(res => this.props.onUsersChanged());
    }

    getAutoCompleteValues(search) {
        return this.service.searchUser(search)
            .then(json => {
                let values = json
                    .filter(u => u.ID !== this.props.project.Owner.ID && !this.props.project.Users.some(u2 => u2.User.ID === u.ID)) // removing existing users
                    .map(u => {
                        return {
                            key: u.ID,
                            label: u.FirstName + " " + u.LastName,
                            value: u
                        };
                    });

                return new Promise((resolve, reject) => {
                    resolve(values);
                });
            });
    }

    addUser(user) {
        this.service.addUserToProject(this.props.project.ID, user.ID)
            .then(res => this.props.onUsersChanged());
    }

    render() {
        const project = this.props.project;
        return (<Panel>
            <Container onClick={() => this.setState({showPanel: !this.state.showPanel})}>
                <FaIcon icon={faUsers}/>
                &nbsp;
                {project.Users.length}
            </Container>

            {this.state.showPanel && <SidePanel dismiss={() => this.setState({showPanel: false})}>
                {/*{project.Users.map(u => <UserPill key={u.User.ID} user={u.User}/>)}*/}
                <PanelTitle>
                    <FontAwesomeIcon icon={faUsers}/>
                    &nbsp;
                    Contributors
                </PanelTitle>
                <Users>
                    {project.Users.map((u) => {
                        let actions = [];
                        if (project.isOwner) {
                            actions = [{
                                icon: faTimes,
                                name: "remove",
                                onClick: () => this.removeUser(u.User.ID)
                            }];
                        }

                        return <UserPill key={u.ID} user={u.User} actions={actions}/>;
                    })}
                </Users>
                {project.isOwner && <div>
                    Add contributors:
                    <AutoCompleteContainer>
                        <AutoComplete getOptionsPromise={this.getAutoCompleteValues} onSelected={this.addUser}/>
                    </AutoCompleteContainer>
                </div>}
            </SidePanel>}
        </Panel>);
    }
}