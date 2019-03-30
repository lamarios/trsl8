import React from 'react';
import styled from 'styled-components';
import Me from "./Me";
import SignUpSignIgn from "./SignUpSignIgn";

const Container = styled.div`
display: grid;
grid-template-areas: 'left center center center  right';
`;

const Left = styled.div`
grid-area: left;
padding: 20px;
`;
const Right = styled.div`
padding: 20px;
grid-area: right;
`;
export default class NavBar extends React.Component {


    render() {
        const token = window.localStorage.getItem("token");
        console.log('token', token);
        return <Container>
            <Left>
                hello
            </Left>
            <Right>
                {token !== null && <Me/>}
                {token === null && <SignUpSignIgn/>}
            </Right>
        </Container>
    }
}