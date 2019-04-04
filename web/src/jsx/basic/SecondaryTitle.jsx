import React from 'react';
import styled from 'styled-components';


const H2 = styled.h2`
  padding:0;
  margin:0px 0px 10px 0px;
  font-size: 1.1rem;
  font-weight: normal;
  color: ${props => props.theme.colors.text.title};
`;

export default class SecondaryTitle extends React.Component {

    render() {
        return (<H2 {...this.props}>{this.props.children}</H2>)
    }

}
