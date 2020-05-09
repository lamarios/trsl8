import React, {Fragment} from "react";
import styled from "styled-components";
import Title from "./basic/Title";
import PrimaryButton from "./basic/PrimaryButton";
import Service from "./Service";
import TextInput from "./basic/TextInput";
import {fadeInLeft} from "./animations";
import NavBar from "./navBar/NavBar";

const SetUp = styled.form`
     color: ${props => props.theme.colors.text.primary};    
    animation: ${fadeInLeft} 0.25s ease-out;
    `;


const Container = styled.div`
display:flex;
align-items: center;
justify-content: center;
width :100%;
height: 600px;
`;

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            repeatPassword: "",
            passwordsMatch: true,
            error: ""
        };

        this.service = new Service();

        this.save = this.save.bind(this);
    }

    save(e) {
        e.preventDefault();
        if (this.state.password.length === 0) {
            this.setState({error: "Passwords can't be empty"});
        } else if (!this.state.passwordsMatch) {
            this.setState({error: "Password not matching"});
        } else {
            let user = {
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
            };

            this.service.signUp(user)
                .then(r => window.location.href = "/")
                .catch(err => err.then(json => this.setState({error: json})));
        }
    }

    render() {
        return (<Fragment>
            <NavBar titleOnly={true}/>
            <Container>
                <SetUp onSubmit={this.save}>
                    <Title>Sign Up</Title>
                    <div>
                        <TextInput label="Email" id="email" type="email" value={this.state.email}
                                   onChange={(e) => this.setState({email: e.target.value})}/>
                    </div>
                    <div>
                        <TextInput label="First name" id="firstName" type="text" value={this.state.firstName}
                                   onChange={(e) => this.setState({firstName: e.target.value})}/>
                    </div>
                    <div>
                        <TextInput label="Last name" id="lastName" type="text" value={this.state.lastName}
                                   onChange={(e) => this.setState({lastName: e.target.value})}/>
                    </div>
                    <div>
                        <TextInput label="Password" id="password" type="password" value={this.state.password}
                                   onChange={(e) => this.setState({
                                       password: e.target.value,
                                       passwordsMatch: e.target.value === this.state.repeatPassword
                                   })}/>
                    </div>
                    <div>
                        <TextInput label="Repeat password" id="repeatPassword" type="password"
                                   value={this.state.repeatPassword}
                                   onChange={(e) => this.setState({
                                       repeatPassword: e.target.value,
                                       passwordsMatch: e.target.value === this.state.password
                                   })}/>
                    </div>
                    {this.state.error.length > 0 && <p>{this.state.error}</p>}
                    <PrimaryButton>Save</PrimaryButton>
                </SetUp>
            </Container>
        </Fragment>);
    }
}