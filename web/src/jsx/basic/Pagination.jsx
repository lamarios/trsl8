import React from 'react';
import styled from 'styled-components';

const Page = styled.span`
    display: inline-block;
    margin:0 5px;
    cursor: pointer;
    color: ${props => props.theme.colors.primary.NeutralDark};
`;

const CurrentPage = styled(Page)`
  font-weight: bold;
    color: ${props => props.theme.colors.primary.main};
`;

const Separator = styled.span`
    color: ${props => props.theme.colors.text.main};
`;

const Container = styled.div`
text-align: center;
`;

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let totalPages = parseInt(this.props.itemCount / this.props.pageSize);
        let pages = [];


        let startFrom = Math.max(1, this.props.page - 5);
        let stopAt = Math.min(totalPages, this.props.page + 5);


        if (startFrom > 1) {
            pages.push(<Separator key={'headSeparator'}>...</Separator>);
        }

        for (let i = startFrom; i < stopAt; i++) {
            if (this.props.page === i) {
                pages.push(<CurrentPage key={i} onClick={() => this.props.onPageChange(i)}>{i + 1}</CurrentPage>)
            } else {
                pages.push(<Page key={i} onClick={() => this.props.onPageChange(i)}>{i + 1}</Page>)
            }
        }


        if (stopAt < (totalPages)) {
            pages.push(<Separator key={'tailSeparator'}>...</Separator>);
        }


        return (<div>

            {totalPages > 0 && <Container>
                {this.props.page === 0 ?
                    <CurrentPage onClick={() => this.props.onPageChange(0)}>{1}</CurrentPage>
                    :
                    <Page onClick={() => this.props.onPageChange(0)}>{1}</Page>
                }

                {pages}
                {this.props.page === totalPages ?
                    <CurrentPage onClick={() => this.props.onPageChange(totalPages)}>{totalPages + 1}</CurrentPage>
                    :
                    <Page onClick={() => this.props.onPageChange(totalPages)}>{totalPages + 1}</Page>
                }
            </Container>}
        </div>);

    }
}