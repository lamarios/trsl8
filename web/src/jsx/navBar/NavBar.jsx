import React from "react";
import styled from "styled-components";
import Me from "./Me";
import SignUpSignIgn from "./SignUpSignIgn";
import {NavLink} from "react-router-dom";

const Container = styled.div`
display: flex;
align-items: center;

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


    render() {
        const token = window.localStorage.getItem("token");
        return <Container>
            <Left>
                <Link to={"/"}>
                TRSL8
                </Link>
            </Left>
            <Center>
                {token !== null && <Link to={"/projects"}>Projects</Link>}
            </Center>
            <Right>
                {token !== null && <Me/>}
                {token === null && <SignUpSignIgn/>}
            </Right>
        </Container>;
    }
}