import React, { useState, useEffect } from "react";
import styled from "styled-components";
import media from "styled-media-query";
import { IoSearch } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import SearchInput from "./SearchInput";
import InputDatepicker from "./InputDatepicker";
import InputDatalist from "./InputDatalist";
import InputTotalNum from "./InputTotalNum";
import Btn from "./Btn";
import { useDispatch } from "react-redux";
import gathApi from "../api/gath";
import { searchGathAction } from "../store/actions";
import { useList } from "../hooks/useList";

const InputContainer = styled.form`
  margin-bottom: 2rem;
  height: 4rem;
  background-color: var(--color-white);
  border-radius: 1rem;
  display: flex;
  ${media.lessThan("medium")`
    margin-bottom: 1.25rem;
    width: calc(100% - 6rem);
  `}
  ${media.lessThan("small")`
    width: 100%;
    min-width: 20rem;
  `}
  .gath-search-btn {
    width: 100%;
    height: 100%;
    background-color: var(--color-maingreen--75);
    color: var(--color-white);
  }
  .gath-search-btn.pc {
    padding: 0;
    border-radius: 0.6rem;
  }
  .gath-search-btn.mobile {
    width: 100%;
    ${media.lessThan("small")`
      min-width: 20rem;
      height: 3.2rem;
    `}
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  position: relative;
  #placeholder-icon {
    flex: 0 0 auto;
    color: var(--color-maingreen--100);
  }
  #placeholder-text {
    flex: 1 1 auto;
    line-height: 3rem;
    color: var(--color-gray);
    font-family: Interop-Light;
    font-size: 1.25rem;
    display: inline;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const InputList = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  display: flex;
`;

const SearchIcon = styled(IoSearch)`
  width: ${(prop) => prop.size}rem;
  height: ${(prop) => prop.size}rem;
  padding: ${(prop) => prop.size * 0.25}rem;
  display: inline-block;
`;

const SearchBtnContainer = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  position: relative;
`;

const PopupContainer = styled.div`
  background-color: var(--color-white);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex !important;
  flex-direction: column;
  overflow: auto;
  outline: none;
  z-index: 1000;
`;

const BackwardBtn = styled.button`
  border-radius: 0.5rem;
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
  color: var(--color-black);
  margin-right: 0.5em;
`;

const PopupHeader = styled.div`
  flex: 0 0 auto;
  padding: 4rem 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupBody = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  > div {
    position: relative;
    height: fit-content;
    margin: 0 1rem 1rem 1rem;
    :last-of-type {
      margin-bottom: 0;
    }
  }
  overflow: auto;
`;

const PopupFooter = styled.div`
  flex: 0 0 auto;
  padding: 1rem;
`;

const HomeSearchBar = () => {
  const dispatch = useDispatch();
  const [sportInput, setSportInput] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [totalNumInput, setTotalNumInput] = useState(null);
  const [searchable, setSearchable] = useState(false);

  const [popupShown, setPopupShown] = useState(false);

  const list = useList();
  useEffect(() => {
    // ?????? ?????? ????????? ????????????
    const getAllGathering = async () => {
      try {
        const res = await gathApi.getAllGath();
        // ????????? ???????????? ?????? ??????, ?????? ????????? ????????????
        dispatch(searchGathAction(res.data));
      } catch (err) {
        console.error(err);
      }
    };
    getAllGathering();
  }, []);

  useEffect(() => {
    setSearchable(sportInput || areaInput);
  }, [sportInput, areaInput]);

  useEffect(() => {
    window.addEventListener("resize", (event) => {
      if (event.target.innerWidth > 768) {
        setPopupShown(false);
      }
    });
    return () => {
      window.removeEventListener("resize", (event) => {
        if (event.target.innerWidth > 768) {
          setPopupShown(false);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (popupShown) {
      document.body.style.cssText = `
        position: fixed;
        top: -${window.scrollY}px;
        left: 0;
        right: 0;
      `;
      return () => {
        const scrollY = document.body.style.top;
        document.body.style.cssText = `
          position: static;
          top: unset;
          left: unset;
          right: unset;
        `;
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [popupShown]);

  const showPopup = () => {
    setPopupShown(true);
  };

  const hidePopup = () => {
    setPopupShown(false);
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      // ?????? ?????? ??????
      const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };
      const refinedSportInput = sportInput.match(/[A-Za-z???-???]*/).join("");
      const refinedDateArr = `${dateInput}`?.split(" ").slice(1, 4);
      const refinedDateInput = refinedDateArr.length
        ? `${refinedDateArr[2]}-${months[refinedDateArr[0]]}-${refinedDateArr[1]}`
        : "";
      // ?????? ??????
      const res = await gathApi.findGath({
        sport: refinedSportInput,
        area: areaInput,
        date: refinedDateInput,
        time: timeInput,
        totalNum: totalNumInput,
      });
      // ????????? ???????????? ?????? ??????, ?????? ????????? ????????????
      dispatch(searchGathAction(res.data));
      // SearchPopup??? ???????????? ?????? ??????, ?????????
      if (popupShown) setPopupShown(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <InputContainer onSubmit={handleSubmit}>
      <InputList className="pc">
        <SearchInput isSport name="??????" htmlFor="sport">
          <InputDatalist
            id="sport"
            values={list.sport}
            placeholder="?????? ????????????????"
            item={sportInput}
            setItem={setSportInput}
          />
        </SearchInput>
        <SearchInput name="??????" htmlFor="area">
          <InputDatalist
            id="area"
            values={list.area}
            placeholder="?????? ??????"
            item={areaInput}
            setItem={setAreaInput}
          />
        </SearchInput>
        <SearchInput isDate name="??????" htmlFor="date">
          <InputDatepicker
            id="date"
            placeholder="?????? ??????"
            selectedDate={dateInput}
            setSelectedDate={setDateInput}
          />
        </SearchInput>
        <SearchInput isTime name="??????" htmlFor="time">
          <InputDatalist
            id="time"
            values={list.time}
            placeholder="?????? ??????"
            item={timeInput}
            setItem={setTimeInput}
          />
        </SearchInput>
        <SearchInput name="??????" htmlFor="totalNum" hideDivider>
          <InputTotalNum
            inputId="totalNum"
            placeholder="?????? ??????"
            total={totalNumInput}
            setTotal={setTotalNumInput}
          />
        </SearchInput>
      </InputList>
      <SearchBtnContainer className="pc">
        <Btn
          type="submit"
          onClick={handleSubmit}
          className="gath-search-btn pc"
          disabled={!searchable}
        >
          <SearchIcon size={3} />
        </Btn>
      </SearchBtnContainer>
      <Placeholder className="mobile" onClick={showPopup}>
        <SearchIcon id="placeholder-icon" size={3} />
        <p id="placeholder-text">?????? ????????????????</p>
      </Placeholder>
      {popupShown && (
        <PopupContainer id="popup-container" className="mobile">
          <PopupHeader>
            <BackwardBtn onClick={hidePopup}>
              <IoIosArrowBack />
            </BackwardBtn>
            <Placeholder className="mobile" onClick={showPopup}>
              <p id="placeholder-text">?????? ?????? ????????? ????????????????</p>
            </Placeholder>
          </PopupHeader>
          <PopupBody>
            <div>
              <SearchInput isSport name="??????" htmlFor="sport" hideDivider popupShown>
                <InputDatalist
                  id="sport"
                  values={list.sport}
                  placeholder="?????? ????????????????"
                  item={sportInput}
                  setItem={setSportInput}
                />
              </SearchInput>
            </div>
            <div>
              <SearchInput name="??????" htmlFor="area" hideDivider popupShown>
                <InputDatalist
                  id="area"
                  values={list.area}
                  placeholder="?????? ??????"
                  item={areaInput}
                  setItem={setAreaInput}
                />
              </SearchInput>
            </div>
            <div>
              <SearchInput isDate name="??????" htmlFor="date" hideDivider popupShown>
                <InputDatepicker
                  id="date"
                  placeholder="?????? ??????"
                  selectedDate={dateInput}
                  setSelectedDate={setDateInput}
                />
              </SearchInput>
            </div>
            <div>
              <SearchInput isTime name="??????" htmlFor="time" hideDivider popupShown>
                <InputDatalist
                  id="time"
                  values={list.time}
                  placeholder="?????? ??????"
                  item={timeInput}
                  setItem={setTimeInput}
                />
              </SearchInput>
            </div>
            <div>
              <SearchInput name="??????" htmlFor="totalNum" hideDivider popupShown>
                <InputTotalNum
                  inputId="totalNum"
                  placeholder="?????? ??????"
                  total={totalNumInput}
                  setTotal={setTotalNumInput}
                />
              </SearchInput>
            </div>
          </PopupBody>
          <PopupFooter>
            <Btn
              type="submit"
              onClick={handleSubmit}
              className="gath-search-btn mobile"
              disabled={!searchable}
            >
              ????????????
            </Btn>
          </PopupFooter>
        </PopupContainer>
      )}
    </InputContainer>
  );
};

export default HomeSearchBar;
