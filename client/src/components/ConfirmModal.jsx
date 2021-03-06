import React, { useEffect } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { modalOffAction } from "../store/actions";
import { useDispatch } from "react-redux";
import Portal from "../Portal";

/*
  ConfirmModal 컴포넌트 활용 가이드
  * 모달 아래에 표시되는 배경색을 투명하게 하고 싶은 경우, isTransparent 프롭스를 전달하여 사용합니다.
    위 속성이 존재하지 않는 경우, 투명도 0.92의 var(--color-black) 색상을 기본 배경색으로 가집니다.
  * 모달 타이틀(title)과 본문(body), 컨펌 버튼 클릭 시 실행될 함수(func)로 이루어진 객체를 content 프롭스로 전달하여 사용합니다.
    아래는 content 객체 예시입니다.
    {
      title: "정말 채팅방에서 나가시겠습니까?",
      body: "채팅방에서 나가시는 경우, 해당 모임 참여도 함께 취소됩니다.",
      func: () => {
        // 채팅방 나가기 실행을 위한 코드
      },
    }
*/

const ModalWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  outline: 0;
  z-index: 1000;
`;

const ModalOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-modalbg);
  ${(props) => {
    props.isTransparent
      ? css`
          display: none;
        `
      : css`
          display: block;
        `;
  }};
  z-index: 999;
`;

const ModalContainer = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1rem;
  color: var(--color-darkgray);
  background-color: var(--color-white);
  width: 20rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

const Contents = styled.div`
  padding: 2rem 0.25rem;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const Title = styled.div`
  margin-bottom: 1rem;
  font-family: Interop-Semibold;
  font-size: 1.25rem;
`;

const Warning = styled.div`
  font-family: Interop-Regular;
  color: var(--color-gray);
  font-size: 0.925rem;
  line-height: var(--lineHeight-relaxed);
`;

const ButtonContainer = styled.div`
  display: flex;
  height: 2.4rem;
  padding: 0 0.25rem;
  > * {
    font-size: 0.825rem;
    line-height: 1.4rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    width: 100%;
    height: 100%;
    margin-right: 0.5rem;
    :last-of-type {
      margin-right: 0;
    }
  }
`;

const CancelBtn = styled.button`
  color: var(--color-gray);
  background-color: var(--color-darkwhite);
  :hover {
    color: var(--color-black);
    background-color: var(--color-lightgray);
    opacity: 0.75;
  }
`;

const ComfirmBtn = styled.button`
  color: var(--color-white);
  background-color: var(--color-maingreen--100);
  :hover {
    opacity: 0.75;
  }
`;

const ConfirmModal = ({ isTransparent, content }) => {
  const dispatch = useDispatch();
  const handleCancelClick = () => {
    dispatch(modalOffAction);
  };
  const handleConfirmClick = async () => {
    try {
      await content.func();
      dispatch(modalOffAction);
    } catch (err) {
      alert(err);
    }
  };
  useEffect(() => {
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
  }, []);
  return (
    <Portal elementId="root-dimmed">
      <ModalOverlay isTransparent={isTransparent} />
      <ModalWrapper tabIndex="-1">
        <ModalContainer tabIndex="0">
          <Contents>
            <Title>{content.title}</Title>
            <Warning>{content.body}</Warning>
          </Contents>
          <ButtonContainer>
            <CancelBtn onClick={handleCancelClick}>아니요, 취소할래요</CancelBtn>
            <ComfirmBtn onClick={handleConfirmClick}>네, 그렇게 할래요</ComfirmBtn>
          </ButtonContainer>
        </ModalContainer>
      </ModalWrapper>
    </Portal>
  );
};

ConfirmModal.defaultProps = {
  isTransparent: false,
};

ConfirmModal.propTypes = {
  isTransparent: PropTypes.bool,
  content: PropTypes.exact({
    title: PropTypes.string,
    body: PropTypes.string,
    func: PropTypes.func,
  }).isRequired,
};

export default ConfirmModal;
