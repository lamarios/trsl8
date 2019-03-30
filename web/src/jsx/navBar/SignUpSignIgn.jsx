import React from 'react';
import styled from 'styled-components';
import {NavLink} from 'react-router-dom';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
`;

export default class SignUpSignIgn extends React.Component{


    render() {
        return <Container>
            <NavLink to="/sign-in">Sign In</NavLink> or <NavLink to="/sign-up">Sign up</NavLink>
        </Container>
    }
}
