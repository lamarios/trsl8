import React from "react";
import styled from "styled-components";
import {fadeInLeft} from "../animations";


const Container = styled.div`
    animation: ${fadeInLeft} 0.25s ease-in;
`;

export default class MainPage extends React.Component {


    render() {
        return <Container>
            <h1>helfdsfdsflo</h1>
        </Container>;
    }
}