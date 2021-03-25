import React, { HTMLAttributes, useCallback } from 'react';
import ReactGA from 'react-ga';
import styled from 'styled-components';

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`;

interface DefaultProps {
  target?: string;
  href?: string;
  rel?: string;
}

interface Props extends HTMLAttributes<HTMLAnchorElement>, DefaultProps {

}

/**
 * Outbound link that handles firing google analytics events
 */
export const ExternalLink = (props: Props) => {
  const target = '_blank';
  const rel = 'noopener noreferrer';
  const { href, ...rest } = props;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        ReactGA.outboundLink({ label: href || '/' }, () => {
          console.debug('Fired outbound link event', href);
        })
      } else {
        event.preventDefault();
        // send a ReactGA event and then trigger a location change
        ReactGA.outboundLink({ label: href || '/' }, () => {
          window.location.href = href || '/';
        });
      }
    },
    [href, target],
  );
  return <StyledLink target={target} rel={rel} href={href} onClick={handleClick} {...rest} />;
};
