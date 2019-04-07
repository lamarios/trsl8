import React from "react";
import styled from "styled-components";
import {widthGrow} from "../animations";

const Container = styled.div`
height: 10px;
background-color: #ddd;
border-radius: 5px;
width:100%;
`;
const Progress = styled.div`
  width: ${props => props.percentage}%;
  max-width: ${props => props.percentage}%;
  background-color: ${props => props.theme.colors.primary.lightest};
  height: 100%;
  border-radius: 5px;
  animation:  ${props => widthGrow(props)} 0.5s ease-in-out;
`;

export default class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        let percentage = this.props.percent ? this.props.percent :  (this.props.value * 100 / this.props.max);
        percentage = Math.min(100, percentage);
        percentage = Math.max(0, percentage);


        return (<Container>
            {percentage > 0 && <Progress percentage={percentage}/>}
        </Container>);
    }

}
