import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    text-align: center;
    border-top: 1px solid #9E9E9E;
    font-size: 12px;
    margin: 0;
    padding: 24px 0;
    color: #9E9E9E;
    @media screen and (max-width: 768px) {
      padding: 18px 0;
      font-size: 8px;
    }
`;

export default function Footer() {
  return (
    <Container>
        &copy; 2023 All rights reserved
    </Container>
  )
}
