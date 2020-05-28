import React, {useEffect, useState} from "react";
import Dialog from "../basic/Dialog";
import Title from "../basic/Title";
import {service} from "../Service";
import SlideLeftContainer from "../basic/SlideLeftContainer";
import Loading from "../basic/Loading";
import Table from "../basic/Table";
import styled from "styled-components";
import PrimaryButton from "../basic/PrimaryButton";
import CenteredContainer from "../basic/CenteredContainer";

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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const pageSize = 100;
    useEffect(() => getProjectHistory(page), []);


    const loadNewPage = () => {
        const newPage = page + 1;
        setPage(newPage);
        getProjectHistory(newPage);
    };

    const getProjectHistory = (page) => {
        setLoading(true)
        service.getProjectHistory(props.projectId, page, pageSize)
            .then(res => {
                setLoading(false);
                const newHistory = history.concat(res);
                setHistory(newHistory);
                console.log("res", res.length);
                setHasMore(res.length === pageSize);

            });
    };

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
                {history.map((h, i) => <tr key={i}>
                    <td>{h.date}</td>
                    <td>{h.type}</td>
                    <td>{h.commit}</td>
                    <td>{h.author}</td>
                    <td>{h.message}</td>
                </tr>)}
                </tbody>
            </HistoryTable>
        </SlideLeftContainer>}
        {hasMore && <CenteredContainer>
            <PrimaryButton onClick={loadNewPage}>Load more...</PrimaryButton>
        </CenteredContainer>}

        {loading && <CenteredContainer>
            <SlideLeftContainer>
                <Loading/>
            </SlideLeftContainer>
        </CenteredContainer>}
    </CustomDialog>;
};

export default HistoryDialog;