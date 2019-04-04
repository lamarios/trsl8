import React from 'react';
import styled, {ThemeProvider, createGlobalStyle} from 'styled-components';
import {theme} from './Theme';

import {BrowserRouter, Route} from 'react-router-dom';
import SignUp from "./SignUp";
import Projects from "./projects/Projects"
import Login from "./Login";
import Project from "./projects/Project";
import MainPage from "./mainPage/MainPage";
import NavBar from "./navBar/NavBar";


const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => props.theme.colors.text.main};
    margin: 0;
    padding: 0;
    font-family: 'Open Sans', sans-serif;
    font-size: 80%;
  }
`

const AppContainer = styled.div`
  width:900px;
  margin: 0 50px;
`;

export default class App extends React.Component {

    constructor(props) {
        super(props)
    }


    render() {
        return (<ThemeProvider theme={theme}>
            <BrowserRouter>
                <GlobalStyle/>
                <NavBar/>
                <AppContainer>
                    <Route exact path="/" component={MainPage}/>
                    <Route exact path="/projects" component={Projects}/>
                    <Route exact path="/sign-up" component={SignUp}/>
                    <Route exact path="/sign-in" component={Login}/>
                    <Route exact path="/projects/:id" component={Project}/>
                </AppContainer>
            </BrowserRouter>
        </ThemeProvider>);
    }

}