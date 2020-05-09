import React, {useState, useRef, Fragment} from "react";
import styled from "styled-components";
import SlideLeftContainer from "./basic/SlideLeftContainer";
import Title from "./basic/Title";
import TextInput from "./basic/TextInput";
import {service} from "./Service";
import PrimaryButton from "./basic/PrimaryButton";
import Dialog from "./basic/Dialog";
import Loading from "./basic/Loading";

const ErrorText = styled.p`
color: ${props => props.theme.colors.error};
`;

const ClickableText = styled.span`
  cursor: pointer;
`;

const Profile = (props) => {
    const userData = useRef(service.getUserData());

    const [firstName, setFirstName] = useState(userData.current.FirstName);
    const [lastName, setLastName] = useState(userData.current.LastName);
    const [showDialog, setShowDialog] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [saving, setSaving] = useState(false);
    const save = (e) => {
        e.preventDefault();


        const user = {
            FirstName: firstName,
            LastName: lastName,
            ID: userData.current.ID
        };

        if (showDialog && password.length === 0) {
            setPasswordError("Password can't be empty");
            return;
        }

        if (password.length > 0 || confirmPassword.length > 0) {
            if (password !== confirmPassword) {
                setPasswordError("Passwords don't match");
                return;
            } else {
                user.Password = password;
            }
        }

        setSaving(true);
        service.updateUser(user)
            .then(token => {
                setSaving(false);
                window.localStorage.setItem("token", token);
                window.location.href = "/profile";
            });

        return false;
    };

    const dismissDialog = () => {
        setPassword("");
        setConfirmPassword("");
        setShowDialog(false);
    };


    return <Fragment>
        <SlideLeftContainer>
            <Title>Profile</Title>
            <form onSubmit={save}>
                <div>
                    <TextInput label="First name" id="firstName" type="text" value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}/>
                </div>
                <div>
                    <TextInput label="Last name" id="lastName" type="text" value={lastName}
                               onChange={(e) => setLastName(e.target.value)}/>
                </div>

                <PrimaryButton> Save</PrimaryButton>
                {saving && <Fragment>&nbsp;<Loading /></Fragment>}
                &nbsp;<ClickableText onClick={() => setShowDialog(true)}>Change
                password</ClickableText>
            </form>
        </SlideLeftContainer>
        {showDialog && <Dialog dismiss={dismissDialog} cancelText="Cancel" okText="Save" onOk={save}>
            <Title>Change password</Title>
            <form onSubmit={save}>
                <div>
                    <TextInput label="Password" id="password" type="password" value={password}
                               onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div>
                    <TextInput label="Confirm Password" id="confirmPassword" type="password" value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                {passwordError.length > 0 && <ErrorText>{passwordError}</ErrorText>}
            </form>
        </Dialog>}
    </Fragment>;
};


export default Profile;