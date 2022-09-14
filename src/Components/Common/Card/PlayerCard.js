import React from "react";
import { Card, Accordion } from "react-bootstrap";
import ButtonPrimary from "../Button/ButtonPrimary";
import SOCCER_BG from "../../../Assets/Images/soccer_bg.png";
import Messi from "../../../Assets/Images/Players/messi.png";
import cross from "../../../Assets/Images/cross-mark.svg";
import LMES from "../../../Assets/Images/LMES.png";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import "./CardStyle.scss";

const EventInfo = [
  {
    Ligue: "Ligue 1",
    Date: "26 Feb 2022",
    Matchday: "Matchday 26",
    Teams: "PSG vs Saint-Étienne",
  },
  {
    Ligue: "Ligue 1",
    Date: "05 Mar 2022",
    Matchday: "Matchday 27",
    Teams: "Niza vs PSG",
  },
  {
    Ligue: "UEFA Champions League",
    Date: "09 Mar 2022",
    Matchday: "Round of 16-2nd leg",
    Teams: "Real Madrid vs PSC",
  },
  {
    Ligue: "Ligue 2",
    Date: "15 Mar 2022",
    Matchday: "Matchday 28",
    Teams: "Niza vs PSG",
  },
  {
    Ligue: "Ligue 2",
    Date: "16 Mar 2022",
    Matchday: "Matchday 29",
    Teams: "Niza vs PSG",
  },
];

const EventList = () => {
  return EventInfo.map((Event,index) => (
    <li className="eventinfo" key={index}>
      <h3>
        {Event.Ligue}
        <span className="eventDate"> {Event.Date}</span>
      </h3>
      <div className="matchInfo">
        <span>{Event.Matchday}</span>
        <span className="dashIcon"> {Event.Teams}</span>
      </div>
    </li>
  ));
};

const PlayerCard = props => {
  return (
    <Card className="playerCard_style">
      <div className="playerCard_img">
        <Card.Img variant="top" src={SOCCER_BG} />
        <div className="playerToken">
          <img src={props.tokenInfo.icon} alt="coin_img" />
          <button className="closeBtn" onClick={props.onClickCallback}>
            <img src={cross} alt="x_icon" />
          </button>
        </div>
      </div>
      <Card.Body>
        <div>
          <ul className="tokenInfo">
            <li>
              {props.tokenInfo.name}
              <span>
                {props.tokenInfo.symbol}/{""}CST
              </span>
            </li>
            <li>
              INITIAL SUPPLY:
              <span>{props.tokenInfo.initialSupply}</span>
            </li>
            <li>
              TOTAL SUPPLY:
              <span>{props.tokenInfo.totalSupply}</span>
            </li>
            <li>
              Tokens Burned
              <span>{props.tokenInfo.burntAmount}</span>
            </li>
            <li>
              Balance:
              <span>{props.tokenInfo.balance}</span>
            </li>
            <li>
              Last 24 hs:
              <span className="positive">+3.6%</span>
            </li>
          </ul>
          <Accordion defaultActiveKey="1" className="moreInfo_accordian">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Objectives</Accordion.Header>
              <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Next Events</Accordion.Header>
              <Accordion.Body>
                <PerfectScrollbar>
                  {/* <ul className="eventList">
                    <EventList />
                  </ul> */}
                </PerfectScrollbar>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
        <ButtonPrimary title="buy now" className="buyNow_btn" />
      </Card.Body>
    </Card>
  );
};

export default PlayerCard;
