import React from 'react';
import Chatbot_v2 from './Chatbot_v2';
import styled from "styled-components";
import logo from './logo.png';

// Create a styled component for the App container
const AppContainer = styled.div`
    background-color: black;
    color: white;
`;

const Header = styled.h1`
    color: lightgreen;
`;

function App() {
    return (
        <AppContainer className="App">
            <header className="App-header">
                <Header>Ask anything to Re-ConECT</Header>
                <img src={logo} alt="Re-ConECT logo" style={{ width: '100px', height: 'auto', marginLeft: '20px' }} />
                <Chatbot_v2 />
            </header>
        </AppContainer>
    );
}

export default App;