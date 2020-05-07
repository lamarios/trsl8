import React from "react";
import styled from "styled-components";
import {fadeInLeft} from "../animations";

import hero from "../assets/hero.svg";
import {service} from "../Service";
import PrimaryButton from "../basic/PrimaryButton";
import SignUpSignIgn from "../navBar/SignUpSignIgn";
import {NavLink} from "react-router-dom";

const Container = styled.div`
    animation: ${fadeInLeft} 0.25s ease-in;
 display:flex;
 align-items: center;
 justify-content: center;
 height: 600px;
`;

const Hero = styled.div`
 display:flex;
 align-items: center;
 justify-content: center;
 width: 800px;
`;

const HeroImage = styled.img`
display: block;
`;

const HeroText = styled.div`
padding: 0  20px 0 0;
`;


export default class MainPage extends React.Component {


    render() {
        const token = window.localStorage.getItem("token");
        const loggedIn = token !== null && !service.tokenExpired(token);
        return <Container>
            <Hero>
                <HeroText>
                    <h1>TRSL8</h1>
                    <p>Get your software localisation done easily. TRSL8 connects directly to your git repository to
                        make localisation as automated as possible. Modify here and your localisation is updated in your
                        CI/CD pipeline</p>
                    {loggedIn && <NavLink to={"/projects"}><PrimaryButton>View your projects</PrimaryButton></NavLink>}
                    {!loggedIn && <SignUpSignIgn/>}
                </HeroText>
                <HeroImage src={hero}/>
            </Hero>
        </Container>;
    }
}