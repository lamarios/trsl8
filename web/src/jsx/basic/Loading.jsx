import React from 'react';
import styled, {keyframes} from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloud } from '@fortawesome/free-solid-svg-icons'


const Fading = keyframes`
0%{
  transform: scale(0.7);
  opacity: 0.7;
}

10%{
  transform: scale(1);
  opacity: 1;
}
20%{
  transform: scale(0.7);
  opacity: 0.7;
}
30%{
  transform: scale(1);
  opacity: 1;
}

100%{
  transform: scale(0.7);
  opacity: 0.7;
}
`;

const Icon = styled(FontAwesomeIcon)`
padding:5px;
    color: ${props => props.theme.colors.primary.main};
    animation: ${Fading} ease 1.5s  infinite;
`;

export default class Loading extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return ( <Icon icon={faCloud}/>)
    }
}