import React, {useEffect, useState} from "react";
import Dialog from "../basic/Dialog";
import Title from "../basic/Title";
import {service} from "../Service";
import SlideLeftContainer from "../basic/SlideLeftContainer";
import Loading from "../basic/Loading";
import Table from "../basic/Table";
import styled from "styled-components";

const CustomDialog = styled(Dialog)`
background-color: rebeccapurple;
  .dialog-content{
    max-width: 90vh;
  }
`;

const HistoryTable = styled(Table)`
  font-size:15px;
  
  tr{
  transition: background-color 0.25s ease-in-out;
  
      &:hover{
      background-color: #eee;
      }
  }
`;


const HistoryDialog = (props) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        service.getProjectHistory(props.projectId)
            .then(res => {
                setLoading(false);
                setHistory(res.filter(h => h.author.length > 0 || h.commit.length > 0 || h.message.length > 0 || h.date.length > 0 || h.type.length > 0));
            });
    }, []);

    return <CustomDialog dismiss={props.dismiss} cancelText="Close" dialogWidth="90vw">
        <Title>History</Title>
        {history.length > 0 && <SlideLeftContainer>

            <HistoryTable>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Id</th>
                    <th>Author</th>
                    <th>Message</th>
                </tr>
                </thead>
                <tbody>
                {history.map(h => <tr key={h.commit}>
                    <td>{h.date}</td>
                    <td>{h.type}</td>
                    <td>{h.commit}</td>
                    <td>{h.author}</td>
                    <td>{h.message}</td>
                </tr>)}
                </tbody>
            </HistoryTable>
        </SlideLeftContainer>}
        {loading && <SlideLeftContainer>
            <Loading/>
        </SlideLeftContainer>}
    </CustomDialog>;
};

export default HistoryDialog;