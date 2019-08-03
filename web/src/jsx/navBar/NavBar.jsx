import React from "react";
import styled from "styled-components";
import Me from "./Me";
import SignUpSignIgn from "./SignUpSignIgn";
import {NavLink} from "react-router-dom";
import {fadeInTop} from "../animations";

import {service} from "../Service";

const Container = styled.div`
display: flex;
align-items: center;
animation: ${fadeInTop} 0.25s ease-in;
`;

const Left = styled.div`
padding: 20px;
`;
const Center = styled.div`
padding: 20px;
flex-grow: 1;
`;
const Right = styled.div`
padding: 20px;
`;

const Link = styled(NavLink)`
text-decoration: none;
color: ${props => props.theme.colors.text.main};
`;

export default class NavBar extends React.Component {
    constructor(props) {
        super(props);

    }


    render() {
        const token = window.localStorage.getItem("token");
        const loggedIn = token !== null && !service.tokenExpired(token);
        return <Container>
            <Left>
                <Link to={"/"}>
                TRSL8
                </Link>
            </Left>
            <Center>
                {loggedIn && <Link to={"/projects"}>Projects</Link>}
            </Center>
            <Right>
                {loggedIn && <Me/>}
                {!loggedIn && <SignUpSignIgn/>}
            </Right>
        </Container>;
    }
}