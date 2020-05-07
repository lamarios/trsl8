import React from "react";
import styled from "styled-components";
import Title from "./basic/Title";
import Service from "./Service";
import TextInput from "./basic/TextInput";
import PrimaryButton from "./basic/PrimaryButton";
import {NavLink} from "react-router-dom";
import {fadeInLeft} from "./animations";

const LoginForm = styled.div`
animation: ${fadeInLeft} 0.25s ease-out;
`;
const SignUpLink = styled(NavLink)``;


const Container = styled.div`
display:flex;
align-items: center;
justify-content: center;
width :100%;
height: 600px;
`;

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {email: "", password: "", error: ""};

        this.service = new Service();

        this.login = this.login.bind(this);
    }


    login() {
        let login = {email: this.state.email, password: this.state.password};


        this.service.login(login)
            .then(res => {
                console.log(res);
                window.localStorage.setItem("token", res);
                window.location.href = "/projects";
            });
    }


    render() {
        return (<Container>
            <LoginForm>
                <Title>Sign In</Title>
                <div>
                    <div>
                        <TextInput label="Email" id="email" type="text" value={this.state.email}
                                   onChange={(e) => this.setState({email: e.target.value})}/>
                    </div>
                    <div>
                        <TextInput label={"Password"} id="password" type="password" value={this.state.password}
                                   onChange={(e) => this.setState({
                                       password: e.target.value,
                                   })}/>
                    </div>

                    {this.state.error.length > 0 && <p>Not matching</p>}
                    <PrimaryButton onClick={this.login}>Login</PrimaryButton>
                    <p>Don't have an account ? <SignUpLink to="/sign-up">Sign up !</SignUpLink></p>
                </div>
            </LoginForm>
        </Container>);
    }
}