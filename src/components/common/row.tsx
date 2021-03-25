import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

interface RowProps {
  width?: string;
  align?: string;
  justify?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  gap?: string;
}

export const Row = styled(Box) <RowProps>`
  ${({ width }) => width && `width: 100%`};
  ${({ align }) => align && `align-items: center`};
  ${({ justify }) => justify && `justify-content: flex-start`};
  display: flex;
  padding: 0;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowBetween = styled(Row)`
  justify-content: space-between;
`;

export const RowFlat = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const AutoRow = styled(Row)`
  flex-wrap: wrap;
  margin: ${({ gap }) => gap && `-${gap}`};
  justify-content: ${({ justify }) => justify && justify};

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`;

export const RowFixed = styled(Row)`
  width: fit-content;
  margin: ${({ gap }) => gap && `-${gap}`};
`;
