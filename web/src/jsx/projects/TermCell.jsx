import React from 'react';

export default class TermCell extends React.Component {
    state = {
        isEditMode: false,
    };

    handleEdit = () => {
        this.setState({ isEditMode: true });
    };

    handleDone = () => {
        this.setState({ isEditMode: false });
    };

    renderEditMode = () => {
        return (
            <>
                <input type="text" defaultValue={this.props.term} /> -{' '}
                <button type="button" onClick={this.handleDone}>
                    Done
                </button>
            </>
        );
    };

    renderViewMode = () => {
        return (
            <div>
                {this.props.term} -{' '}
                <button type="button" onClick={this.handleEdit}>
                    Edit
                </button>
            </div>
        );
    };

    render() {
        const { isEditMode } = this.state;
        return (
            <>
                {isEditMode && this.renderEditMode()}
                {!isEditMode && this.renderViewMode()}
            </>
        );
    }
}
