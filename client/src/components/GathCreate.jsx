import React, { useEffect, useState } from "react";
import styled from "styled-components";
import media from "styled-media-query";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { getMonth, getDate } from "date-fns";

import { gathDetailModalOnAction, modalOffAction } from "../store/actions";
import GathSearch from "./GathSearch";
import GathCard from "./GathCard";
import gathApi from "../api/gath";
import Btn from "./Btn";

const GathCreateContainer = styled.div`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  background-color: var(--color-white);
  border-radius: 1rem;
  color: var(--color-darkgray);
`;

const Info = styled.div`
  width: 44rem;
  padding: 2rem 2rem 1.5rem;
  * {
    margin: 1.2rem 0rem;
  }
  ${media.lessThan("medium")`
    /* screen width is between 768px (medium) and 1170px (large) */
    width: 20rem;
    padding: 0rem 0rem 1.5rem;
  `}
`;

const MovePageButtons = styled.div`
  position: relative;
  display: flex;
  align-items: end;
  justify-content: space-between;
  width: 44rem;
  height: 12rem;
  z-index: ${(props) => props.isOnSearch && -1};
  padding: 2rem 2rem 2rem;
  ${media.lessThan("medium")`
  /* screen width is between 768px (medium) and 1170px (large) */
    width: 20rem;
    margin-top: 2rem;
  `}
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  div {
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: calc(100% - 4rem);
  height: 15rem;
  z-index: 5;
  ${media.lessThan("medium")`
    width: 20rem;
  `};
`;

const StyledGathCard = styled(GathCard)`
  ${media.lessThan("medium")`
    display: none;
  `}
`;

const StyledBtn = styled(Btn)`
  width: 5rem;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 0.4rem;
`;

const GathCreate = () => {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState("?????? ?????? ??????????");
  const [isOnSearch, setOnSearch] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [list, setList] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const user = useSelector(({ authReducer }) => authReducer);
  const dispatch = useDispatch();

  const [gathering, setGathering] = useState({
    id: 12,
    title: "OO ?????? ?????????!!",
    description: "???????????? ???????????? OO?????? ????????? ??? ??? ?????? ?????????~",
    creator: {
      id: "uuid",
      nickname: user.nickname,
      image: user.image,
    },
    areaName: "OO???",
    placeName: "???",
    latitude: "33.450701",
    longitude: "126.570667",
    date: new Date(),
    time: "??????",
    timeDescription: "19???",
    totalNum: 4,
    currentNum: 1,
    sportName: "OO",
    sportEmoji: "???",
    done: false,
    users: [
      {
        id: "uuid",
        nickname: "?????????",
        image: "imageUrl",
      },
    ],
  });

  useEffect(() => {
    switch (step) {
      case 1:
        setQuestion("?????? ?????? ??????????");
        break;
      case 2:
        setQuestion("????????? ??????????");
        break;
      case 3:
        setQuestion("????????? ?????????????");
        break;
      case 4:
        setQuestion("?????? ?????????????");
        break;
      case 5:
        setQuestion("????????? ????????? ???????????????");
        break;
      case 6:
        setQuestion("??? ????????? ?????????????");
        break;
      case 7:
        setQuestion("?????? ????????? ???????????????!");
        break;
      case 8:
        setQuestion("?????? ????????? ????????? ???????????????!");
        break;
      default:
        break;
    }
    if (step === 6) {
      setInputValue(2);
    }
  }, [step]);

  const handlePrevClick = () => {
    setOnSearch(false);
    setInputValue("");
    setList([]);
    setIsSelected(false);
    setSelectedOptions(selectedOptions.slice(0, selectedOptions.length - 1));
    setStep(step - 1);
  };

  const handleNextClick = async () => {
    if (step >= 5 && step < 8) {
      setSelectedOptions([...selectedOptions, inputValue]);
      setOnSearch(false);
      setInputValue("");
      setList([]);
      setIsSelected(false);
      setStep(step + 1);
    } else {
      if (
        (step === 1 && gathering.sportEmoji !== "???") ||
        (step === 2 && gathering.placeName !== "???") ||
        (step === 3 && gathering.date !== "2021-00-00") ||
        (step === 4 && gathering.time !== "OO")
      ) {
        setOnSearch(false);
        setInputValue("");
        setList([]);
        setIsSelected(false);
        setStep(step + 1);
      }
    }
  };

  const handleSave = async () => {
    dispatch(modalOffAction);
    try {
      const payload = {
        title: gathering.title,
        description: inputValue,
        placeName: gathering.placeName,
        latitude: gathering.latitude,
        longitude: gathering.longitude,
        date: gathering.date,
        time: gathering.time,
        timeDescription: gathering.timeDescription,
        totalNum: gathering.totalNum,
        areaName: gathering.areaName,
        sportName: gathering.sportName,
      };
      const res = await gathApi.createGath(payload);
      if (res.status === 200) {
        dispatch(gathDetailModalOnAction(res.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GathCreateContainer>
      <Info>
        <div>{step}??????</div>
        <div style={{ width: "auto", height: "1rem", color: "var(--color-darkgray)" }}>
          {step === 2 && `${gathering.sportName} ??????`}
          {step === 3 &&
            `${gathering.placeName}?????? 
             ${gathering.sportName} ??????`}
          {(step === 4 || step === 5 || step === 6) &&
            `${getMonth(gathering.date) + 1}??? ${getDate(gathering.date)}??? 
             ${gathering.placeName}?????? 
             ${gathering.sportName} ??????`}
          {(step === 7 || step === 8) &&
            `${getMonth(gathering.date) + 1}??? ${getDate(gathering.date)}??? 
            ${gathering.placeName}?????? 
            ${gathering.totalNum}??? ${gathering.sportName} ??????`}
        </div>
        <h2>{question}</h2>
      </Info>
      <Container>
        <GathSearch
          step={step}
          isOnSearch={isOnSearch}
          setOnSearch={setOnSearch}
          inputValue={inputValue}
          setInputValue={setInputValue}
          list={list}
          setList={setList}
          isSelected={isSelected}
          setIsSelected={setIsSelected}
          gathering={gathering}
          setGathering={setGathering}
        />
        <StyledGathCard gathering={gathering} disabled={true} />
      </Container>
      <MovePageButtons isOnSearch={isOnSearch}>
        <Button name="prev" onClick={handlePrevClick}>
          {step > 1 && (
            <>
              <MdOutlineKeyboardArrowLeft fontSize="1.5rem" />
              <div>??????</div>
            </>
          )}
        </Button>
        <Button name="next" onClick={handleNextClick}>
          {step < 8 ? (
            <>
              <div>??????</div>
              <MdOutlineKeyboardArrowRight fontSize="1.5rem" />
            </>
          ) : (
            <>
              <StyledBtn
                color="var(--color-white)"
                bgColor="var(--color-maingreen--75)"
                onClick={handleSave}
              >
                ????????????
              </StyledBtn>
            </>
          )}
        </Button>
      </MovePageButtons>
    </GathCreateContainer>
  );
};

export default GathCreate;
