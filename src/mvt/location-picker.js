import React from 'react'
import styled from 'styled-components'

const StyledA = styled.a`
  margin-left: 0.3rem;
`

export default function ({ flatten }) {
  return (
    <div>
      <StyledA href='#yyj'>YYJ</StyledA>
      <StyledA href='#sfo'>SFO</StyledA>
      <StyledA href='#yvr'>YVR</StyledA>
      <StyledA href='#lhr'>LHR</StyledA>
      <StyledA href='#hnd'>HND</StyledA>
      <StyledA href='#jfk'>JFK</StyledA>
      <StyledA href='#bom'>BOM</StyledA>
      <StyledA href='#tfn'>TFN</StyledA>
      <StyledA href='#' onClick={flatten}>
        Flat
      </StyledA>
    </div>
  )
}
