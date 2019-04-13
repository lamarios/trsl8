import React from 'react';
import styled, {keyframes} from 'styled-components';
import OkCancelDialog from "../basic/OkCancelDialog";
import Title from "../basic/Title";
import TextInput from "../basic/TextInput";
import Checkbox from "../basic/Checkbox";
import PrimaryButton from "../basic/PrimaryButton";
import Service from '../Service';
import Loading from "../basic/Loading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCheck} from '@fortawesome/free-solid-svg-icons'
import {popIn, fadeIn} from '../animations'
import OkDialog from "../basic/OkDialog";
import Select from "../basic/Select";
import TextArea from "../basic/TextArea";

const TestDiv = styled.div`
display: flex;
align-items: center;
`


const SuccessIcon = styled(FontAwesomeIcon)`
color: ${props => props.theme.colors.success};
padding: 5px;
animation: ${popIn} 0.5s ease;
`;


const Fail = styled.div`
padding: 5px;
color: ${props => props.theme.colors.error};
`;

const Files = styled.div`
`;

const File = styled.div`
display: flex;
align-items: center;
height: 30px;
cursor:pointer;
`;


const IconSpacer = styled.div`
width: 30px;
`

const SavingOverlay = styled.div`
  background-color: ${props => props.theme.colors.background};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  border-radius: 5px;
animation: ${fadeIn} 0.25s ease;
z-index: 10;
`;

export default class NewProjectDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            useSsh: false,
            url: '',
            username: '',
            password: '',
            testing: false,
            testSuccess: false,
            testError: '',
            files: [],
            masterFile: '',
            saving: false,
            saveError: '',
            name: '',
            fileType: '',
            sshPrivateKey:'',
            sshPublicKey: '',
        };

        this.testRepo = this.testRepo.bind(this);

        this.saveProject = this.saveProject.bind(this);
        this.switchSsh = this.switchSsh.bind(this);
        this.service = new Service();
    }


    /**
     * switch the ssh status
     * @param ssh boolean true to use ssh
     */
    switchSsh(ssh){
        if(ssh) {
            this.setState({useSsh: ssh, sshPublicKey: 'Generating key...', sshPrivateKey: '', username: '', password:''}, () => {
                this.service.generateSshKeys()
                    .then(res => {
                        console.log(res);
                        this.setState({sshPublicKey: res.public, sshPrivateKey: res.private});
                    });
            });
        }else{
            this.setState({useSsh: ssh, sshPublicKey: '', sshPrivateKey: ''});
        }
    }

    /**
     * Saves a project
     */
    saveProject() {
        let project = {
            GitUrl: this.state.url,
            Ssh: this.state.useSsh,
            Username: this.state.username,
            Password: this.state.password,
            MainLanguage: this.state.masterFile,
            Name: this.state.name,
            FileType: this.state.fileType,
            PrivateKey: this.state.sshPrivateKey,
            PublicKey: this.state.sshPublicKey,
        };

        if (project.FileType.length === 0 || project.Name.length === 0 || project.GitUrl.length === 0 || (!project.Ssh && (project.Username.length === 0 || project.Password.length === 0))) {
            this.setState({saveError: 'Please fill all the fields'});
        } else {

            this.setState({saving: true, saveError: ''}, () => {


                this.service.createProject(project)
                    .then(res => this.props.dismiss())
                    .catch(err => err.then(txt => this.setState({saveError: txt})));
            });
        }
    }

    /**
     * Tests whether a repository is valid, will also show the list of files to choose from for the master
     */
    testRepo() {
        let test = {
            GitUrl: this.state.url,
            Ssh: this.state.useSsh,
            Username: this.state.username,
            Password: this.state.password,
            PrivateKey: this.state.sshPrivateKey,
            PublicKey: this.state.sshPublicKey,
        };


        this.setState({testing: true, testError: '', testSuccess: false}, () =>
            this.service.testProject(test)
                .then(res => {
                    this.setState({testing: false, testSuccess: true, files: res});
                })
                .catch(err => {
                    err.then(msg => {
                        console.log(msg);
                        this.setState({testing: false, testSuccess: false, testError: msg})
                    })
                }));

    }

    render() {
        return (<OkCancelDialog onOk={this.saveProject} dismiss={this.props.dismiss}>
            {this.state.saving && <SavingOverlay>
                <Loading/>
            </SavingOverlay>}
            <Title>New Project</Title>
            <TextInput label="Project name" id="repo-name" value={this.state.name}
                       onChange={(e) => this.setState({name: e.target.value})}/>

            <TextInput label="Repository URL" id="repo-url" value={this.state.url}
                       onChange={(e) => this.setState({url: e.target.value})}/>

            <Checkbox label="Use SSH" value={this.state.useSsh}
                      onChange={(e) => this.switchSsh(e.target.checked)}/>

            {!this.state.useSsh && <div>
                <TextInput label="User name" id="git-username" value={this.state.username}
                           onChange={(e) => this.setState({username: e.target.value})}/>

                <TextInput label="Password" type="password" id="git-password" value={this.state.password}
                           onChange={(e) => this.setState({password: e.target.value})}/>

            </div>}
            {this.state.useSsh && <div>
                <TextArea label="Add the following ssh key to your git repo" rows="5" readOnly={true} value={this.state.sshPublicKey}
                onClick={(e) => e.target.select()}/>
            </div>}

            <Select label="File Type" value={this.state.fileType} options={['json']}
                    onChange={(type) => this.setState({fileType: type})}/>

            <TestDiv>
                <PrimaryButton onClick={this.testRepo}>Test and select master file</PrimaryButton>
                {this.state.testing && <Loading/>}
                {this.state.testSuccess && <SuccessIcon icon={faCheck}/>}
                {this.state.testError.length > 0 && <Fail>{this.state.testError}</Fail>}
            </TestDiv>

            {this.state.files.length > 0 && <Files>
                <p>Choose master file</p>
                {this.state.files.map((f, k) => <File key={k} onClick={() => this.setState({masterFile: f})}>
                    <IconSpacer>
                        {this.state.masterFile === f && <SuccessIcon icon={faCheck}/>}
                    </IconSpacer>
                    <span>{f}</span>
                </File>)}

            </Files>}


            {this.state.saveError.length > 0 &&
            <OkDialog dismiss={() => this.setState({saveError: ''})}>{this.state.saveError}</OkDialog>}
        </OkCancelDialog>)
    }

}