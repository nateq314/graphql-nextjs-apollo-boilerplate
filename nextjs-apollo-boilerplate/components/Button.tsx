import * as React from "react";
import styled from "styled-components";

const Button = styled.span`
  display: inline-block;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: 0.25s background-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

interface ButtonProps {
  [key: string]: any;
}

export default (props: ButtonProps) => (
  <Button {...props}>{props.children}</Button>
);
