import React from "react";
import styled, {keyframes} from "styled-components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloud} from "@fortawesome/free-solid-svg-icons";


const Fading = keyframes`
0%{
  transform: scale(0.7);
  opacity: 1;
}

10%{
  transform: scale(1);
  opacity: 0.7;
}
20%{
  transform: scale(0.7);
  opacity: 1;
}
30%{
  transform: scale(1);
  opacity: 0.7;
}

100%{
  transform: scale(0.7);
  opacity: 1;
}
`;

const Icon = styled(FontAwesomeIcon)`
    padding:5px;
    color: ${props => props.color || props.theme.colors.primary.dark};
    animation: ${Fading} ease 1.5s  infinite;
`;

const Loading  = (props) => <Icon icon={faCloud}/>;

export default Loading;