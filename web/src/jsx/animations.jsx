import styled, {keyframes} from 'styled-components';



export const popIn = keyframes`
0%{
opacity: 0;
transform: scale(0.5);
}
70%{
opacity: 1;
transform: scale(1.3);
}

100%{
opacity: 1;
transform: scale(1);
}
`;


export const fadeIn = keyframes`
0%{
opacity: 0;
transform: scale(0.7);
}

100%{
opacity: 1;
transform: scale(1);
}

`;

export const fadeInTop = keyframes`
0%{
opacity: 0;
transform: translateY(-20px);
}

100%{
opacity: 1;
transform: translateY(0px);
}

`;

export const  slideFromRight= keyframes`
0%{
opacity: 0;
transform: translateX(100%);
}

100%{
opacity: 1;
transform: translateX(0);
}

`;
