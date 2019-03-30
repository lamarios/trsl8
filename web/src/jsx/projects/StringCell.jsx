import React from 'react';
import styled from 'styled-components';
import TextArea from "../basic/TextArea";
import Loading from "../basic/Loading";
import Service from "../Service";

const StringInput = styled(TextArea)`
min-width: 150px;
height:15px;
`;

const StringInputWrapper = styled.div`
position: relative
`;

const StringInputLoading = styled.div`
position: absolute;
top:0;
right:0;
`;

export default class StringCell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {saving: false, timeout: null};
        this.service = new Service();

        this.onValueChanged = this.onValueChanged.bind(this);
    }

    onValueChanged(e) {

        this.props.onChange(this.props.term, this.props.language, e.target.value);


        let updateString = {
            Language: this.props.language,
            Term: this.props.term,
            Value: e.target.value
        };

        clearTimeout(this.state.timeout);


        this.setState({
            timeout: setTimeout(
                () => {
                    this.setState({saving: true}, () => {
                        this.service.updateString(this.props.project.ID, updateString)
                            .then(json => {
                                this.setState({saving: false});
                            })
                            .catch(json => {
                                this.setState({saving: false});
                            })
                    })
                },
                300
            )
        });

    }

    render() {

        const t = this.props.term;
        const value = this.props.value;

        return (<td>
            <StringInputWrapper>

                {this.state.saving
                && <StringInputLoading>
                    <Loading/>
                </StringInputLoading>
                }
                <StringInput
                    placeholder={t}
                    rows="1"
                    value={value}
                    onChange={this.onValueChanged}
                />
            </StringInputWrapper>

        </td>)

    }
}