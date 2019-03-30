import React from 'react';
import styled, {ThemeProvider} from 'styled-components';
import {theme} from './Theme';

import {BrowserRouter, Route} from 'react-router-dom';
import SignUp from "./SignUp";
import Projects from "./projects/Projects"
import Login from "./Login";
import Project from "./projects/Project";
import MainPage from "./mainPage/MainPage";
import NavBar from "./navBar/NavBar";

export default class App extends React.Component {

    constructor(props) {
        super(props)
    }


    render() {
        return (<ThemeProvider theme={theme}>
            <BrowserRouter>
                <NavBar/>
                <Route exact path="/" component={MainPage}/>
                <Route exact path="/projects" component={Projects}/>
                <Route exact path="/sign-up" component={SignUp}/>
                <Route exact path="/sign-in" component={Login}/>
                <Route exact path="/projects/:id" component={Project}/>
            </BrowserRouter>
        </ThemeProvider>);
    }

}