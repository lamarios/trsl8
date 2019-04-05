import React from "react";
import styled from "styled-components";
import {widthGrow} from "../animations";

const Container = styled.div`
height: 10px;
background-color: #ddd;
border-radius: 5px;
`;
const Progress = styled.div`
  width: ${props => props.percentage}%;
  max-width: ${props => props.percentage}%;
  background-color: ${props => props.theme.colors.primary.lightest};
  height: 100%;
  border-radius: 5px;
  animation:  ${props => widthGrow(props)} 1s ease-in-out;
  transition: width 0.5s ease-in-out;
`;

export default class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        const percentage = this.props.value * 100 / this.props.max;

        return (<Container>
            <Progress percentage={percentage}/>
        </Container>);
    }

}
