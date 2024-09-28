import React from 'react';
import Chatbot_v2 from './Chatbot_v2';
import styled from 'styled-components';
import logo from './logo.png';

const AppContainer = styled.div`
  background: linear-gradient(135deg, #e8eaf6, #f0f2f5);
  color: #444;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: 100%;
  background: #2e1a47;
  border-radius: 25px;
  box-shadow: 0px 30px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  padding: 40px;
`;

const TopBar = styled.div`
  background: linear-gradient(90deg, #6a5acd, #b06ab3);
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
`;

const BottomBar = styled.div`
  background: linear-gradient(90deg, #b06ab3, #6a5acd);
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  box-shadow: 0 -10px 15px rgba(0, 0, 0, 0.5);
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 40px;
  background: #e8eaf6;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
`;

const Logo = styled.img`
  height: 100px;
  margin-right: 30px;
  border-radius: 50%;
  animation: rotateLogo 10s infinite linear;
  @keyframes rotateLogo {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const AppHeader = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 40px;
  text-align: center;
  background: linear-gradient(90deg, #6a5acd, #b06ab3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
`;

const TopBarText = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1.5px;
`;

const BottomText = styled.div`
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 2px;
`;

function App() {
  return (
    <AppContainer>
      <PageWrapper>
        <TopBar>
          <Logo src={logo} alt="Logo" />
          <TopBarText>
            Re-ConECT: AI-Powered Chatbot for Physical Medicine & Rehabilitation
          </TopBarText>
        </TopBar>
        <ContentWrapper>
          <AppHeader>Talk with your personalized AI doctor — Assess your medical condition and get personalized management guidance! </AppHeader>
          <Chatbot_v2 />
        </ContentWrapper>
        <BottomBar>
          <BottomText>Re-ConECT x Upstage</BottomText>
        </BottomBar>
      </PageWrapper>
    </AppContainer>
  );
}

export default App;
