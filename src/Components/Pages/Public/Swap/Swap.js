import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-roadmap.png";
import cstcoin from "../../../../Assets/Images/cst-coin.png";
import lamescoin from "../../../../Assets/Images/lames-coin.png";
import swapicon from "../../../../Assets/Images/swap-icon.png";
import LMES from "../../../../Assets/Images/LMES.png";
import MSAL from "../../../../Assets/Images/MSAL.png";
import MBAP from "../../../../Assets/Images/MBAP.png";
import HAAL from "../../../../Assets/Images/HAAL.png";
import {
  CustomInputgroup,
  Layout,
  PlayerCard,
  ButtonPrimary,
  ConnectWalletModal,
} from "../../../Common";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import "./Swap.scss";

const PlayerName = [
  { name: "Lionel Messi", symbol: "LMES", icon: LMES },
  { name: "Mohamed Salah", symbol: "MSAL", icon: MSAL },
  { name: "Robert Lewandowski", symbol: "LEWA", icon: LMES },
  { name: "Kylian Mbappé", symbol: "MBAP", icon: MBAP },
  { name: "Erling Haaland", symbol: "HAAL", icon: HAAL },
  { name: "Lionel Messi", symbol: "LMES", icon: LMES },
  { name: "Mohamed Salah", symbol: "MSAL", icon: MSAL },
  { name: "Robert Lewandowski", symbol: "LEWA", icon: LMES },
  { name: "Kylian Mbappé", symbol: "MBAP", icon: MBAP },
  { name: "Erling Haaland", symbol: "HAAL", icon: HAAL },
];

const PlayerList = () => {
  return PlayerName.map((player) => (
    <li>
      <img src={player.icon} alt="palyer_icon" />
      <span>
        {player.name} <strong>({player.symbol})</strong>
      </span>
    </li>
  ));
};

const Swap = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <section className="swapheader_Sec">
        <Container>
          <div className="swapCmn_cont">
            <div className="swapHeader_img">
              <img src={headerImg} />
            </div>
          </div>
        </Container>
      </section>
      <Layout>
        <section className="swapComn_Sec">
          <Container className="swapCmn_cont">
            {/* connect wallet section */}
            <Row className="connectWallet_Row">
              <Col xl={6} md={6} sm={12}>
                <div className="connectWallet_Left">
                  <img src={draco} alt="img" />
                </div>
              </Col>
              <Col xl={6} md={6} sm={12}>
                <div className="connectWallet_Right">
                  <ButtonPrimary
                    title="Connect Wallet"
                    className="connectWallet"
                    onClick={handleShow}
                  />
                  <ConnectWalletModal show={show} onHide={handleClose} />
                  <h1>Claim</h1>
                  <ButtonPrimary title="1000 cts" className="ctsBtn" />
                  <p>(Crypto stars tokens)</p>
                </div>
              </Col>
            </Row>
            {/* swap coin section */}
            <Row className="swapRow">
              <Col xl={12} md={12} sm={12}>
                <div className="swapCard">
                  <Form>
                    <CustomInputgroup icon={cstcoin} title="Swap From" />
                    <button className="swapSwitch">
                      <img src={swapicon} alt="swap_icon" />
                    </button>
                    <CustomInputgroup icon={lamescoin} title="Swap To (est.)" />
                    <button className="swapBtn">Swap</button>
                  </Form>
                </div>
              </Col>
            </Row>
            <Row className="soccerPlayer_Row">
              <h2 className="playerTitle">Soccer Players</h2>
              <Col xl={6} md={6} sm={12}>
                <div className="soccerPlayer_left cmnBorder">
                  <PerfectScrollbar>
                    <ul className="playerList">
                      <PlayerList />
                    </ul>
                  </PerfectScrollbar>
                </div>
              </Col>
              <Col xl={6} md={6} sm={12}>
                <div className="soccerPlayer_Right cmnBorder">
                  <PlayerCard />
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default Swap;
