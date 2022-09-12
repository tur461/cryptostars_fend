import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Accordion } from "react-bootstrap";
import { FaqAccordianItem, Layout, ButtonPrimary } from "../../../Common";
import headerImg from "../../../../Assets/Images/headerImg.png";
import draco from "../../../../Assets/Images/draco-header.png";
import dracoroadmap from "../../../../Assets/Images/draco-roadmap.png";
import "./Home.scss";

const Home = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <section className="header_Sec">
        <Container className="commonCont">
          <div className="headerImg_wrap">
            <img src={headerImg} className="cryptoStars_img" />
            <img src={draco} className="dracoImg" />
          </div>
        </Container>
      </section>
      <section className="pilotExp_Sec">
        <Container className="commonCont">
          <h2 className="cmnHeading">PILOT EXPLAIN</h2>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen
          </p>
          <ButtonPrimary onClick={() => navigate("/swap")} title="start now" />
        </Container>
      </section>
      <section className="fqs_Sec">
        <Container className="commonCont">
          <h2 className="cmnHeading">FAQS</h2>
          <Accordion className="customAccordian">
            <FaqAccordianItem
              eventKey={0}
              no="1"
              title="¿Que es CryptoStars y como funciona?"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
            <FaqAccordianItem
              eventKey={1}
              no="2"
              title="¿Que es CryptoStars y como funciona?"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
            <FaqAccordianItem
              eventKey={2}
              no="3"
              title="¿Que es CryptoStars y como funciona?"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
            <FaqAccordianItem
              eventKey={3}
              no="4"
              title="¿Que es CryptoStars y como funciona?"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
            <FaqAccordianItem
              eventKey={4}
              no="5"
              title="¿Que es CryptoStars y como funciona?"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
          </Accordion>
        </Container>
      </section>
      <section className="roadmap_Sec">
        <Container className="commonCont">
          <h2 className="cmnHeading ">roadmap</h2>
          <div className="roadmapWrap">
            <img
              src={dracoroadmap}
              alt="draco_img"
              className="dracoRoadmap_img"
            />
            <Accordion defaultActiveKey="0" className="roadmapAccordian">
              <div className="commnBg">
                <span>Q1</span> 2022
              </div>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div>
                    Integration
                    <br /> with <span>oracles</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Lorem ipsum sed</li>
                    <li>dolor sit amet,</li>
                    <li>consectetur adipiscing elit,</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <div className="commnBg">
                <span>Q2</span> 2022
              </div>
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <span>Pilot in testnet</span> <br /> with 3 major sports
                  events:
                </Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>
                      May-Jun. <span>Tennis: French pen</span>
                    </li>
                    <li>
                      May. <span>Soccer: UEFA Champions</span>
                    </li>
                    <li>
                      Jun: <span>NBA Finals.</span>
                    </li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <div className="commnBg">
                <span>Q3</span> 2022
              </div>
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <span>
                    Official Launch
                    <br /> on mainnet
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Lorem ipsum sed</li>
                    <li>dolor sit amet,</li>
                    <li>consectetur adipiscing elit,</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <div className="commnBg">
                <span>Q4</span> 2022
              </div>
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  <span>Soccer World Cup </span> <br />
                  Special Event and <br /> PR campaign
                </Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Lorem ipsum sed</li>
                    <li>dolor sit amet,</li>
                    <li>consectetur adipiscing elit,</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>
                  e-Sports <br /> <span>Athletes Tokens</span>
                </Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Lorem ipsum sed</li>
                    <li>dolor sit amet,</li>
                    <li>consectetur adipiscing elit,</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </Container>
      </section>
    </Layout>
  );
};

export default Home;
