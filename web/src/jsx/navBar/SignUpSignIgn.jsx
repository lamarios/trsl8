import React from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";
import PrimaryButton from "../basic/PrimaryButton";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
`;

const Link = styled(NavLink)`
text-decoration: none;
color: ${props => props.theme.colors.text.main};
font-weight: bold;
`;

export default class SignUpSignIgn extends React.Component {


    render() {
        return <Container>
            <NavLink to="/sign-in"><PrimaryButton>Sign In</PrimaryButton></NavLink>&nbsp;or&nbsp;<Link to="/sign-up">Sign
            up</Link>
        </Container>;
    }
}
