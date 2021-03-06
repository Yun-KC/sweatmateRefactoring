import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { modalOffAction } from "../store/actions";
import { useDispatch } from "react-redux";
import { IoClose } from "react-icons/io5";
import media from "styled-media-query";
import Portal from "../Portal";

const ModalWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  outline: none;
  z-index: 1000;
`;

const ModalOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-modalbg);
  z-index: 999;
`;

const ModalContainer = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 auto;
  width: fit-content;
  height: fit-content;
  border-radius: 1rem;
  color: var(--color-darkgray);
  background-color: var(--color-white);
  ${(props) => {
    props.bgColor &&
      css`
        background-color: ${props.bgColor};
      `;
  }};
  ${media.lessThan("medium")`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    transform: translateY(0);
    min-height: 100%;
    min-width: 100%;
    border-radius: 0;
  `};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CloseBtn = styled.div`
  border-radius: 0.5rem;
  padding: 0.25rem;
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1.75rem;
  ${media.lessThan("small")`
    right: 1rem;
    top: 1rem;
    width: 2rem;
    height: 2rem;
    font-size: 1.5rem;
  `};
  color: var(--color-gray);
  :hover {
    color: var(--color-black);
    background-color: var(--color-lightgray);
    opacity: 0.8;
  }
`;

const Modal = ({ children, bgColor }) => {
  const dispatch = useDispatch();
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) dispatch(modalOffAction);
  };
  const handleCloseClick = () => {
    dispatch(modalOffAction);
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
      <ModalOverlay />
      <ModalWrapper onClick={handleBackgroundClick} tabIndex="-1">
        <ModalContainer tabIndex="0" bgColor={bgColor}>
          <CloseBtn onClick={handleCloseClick}>
            <IoClose />
          </CloseBtn>
          {children}
        </ModalContainer>
      </ModalWrapper>
    </Portal>
  );
};

Modal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.node]).isRequired,
  bgColor: PropTypes.string,
};

export default Modal;
