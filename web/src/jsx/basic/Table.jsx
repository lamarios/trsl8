import React from "react";

import styled from "styled-components";

const Table = styled.table`
    unset:all;
    border-spacing: 0 0;
    border-collapse: collapse;
    min-width: 100%;
    border:none;

    thead{
        tr > th {
            text-align: left;
            border-bottom: 1px solid ${props => props.theme.colors.text.light};
        }
    }
    
`;


export default Table;
