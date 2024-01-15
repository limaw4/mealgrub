import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Center from './Center';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import HamburgerIcon from './icons/Hamburger';
import CloseIcon from './icons/CloseIcon';

const StyledNav = styled.div`
  background-color: #111;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
`;

const LogoWrapper = styled.div`
  user-select: none;
  color: #fff;
  text-decoration: none;
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  img {
    height: 64px;
    width: 64px;
  }
`;

const NavLink = styled(Link)`
  display: block;
  color: #aaa;
  text-decoration: none;
  &:hover {
    color: #fff;
    transition: all .4s;
  }
`;

const LinksWrapper = styled.div`
  ${props => props.mobileNavActive ? `
  display: block;
  ` : `
  display: none;
  `}
  justify-content: center;
  gap: 30px;
  align-items: center;
  gap: 20px;
  position: fixed;
  top: 50px;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 20px 20px;
  background-color: #111;
  z-index: 1000;
  @media screen and (min-width: 768px) {
    display: flex;
    position: static;
    padding: 0;
  }
`;

const NavButton = styled.button`
  background-color: transparent;
  width: 40px;
  height: 30px;
  border: 0;
  cursor: pointer;
  color: white;
  position: relative;
  z-index: 3;
  display: block;

  @media screen and (min-width: 768px) {
    display: none;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover {
    svg {
    }
  }
`;



export default function NavBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileNavActive, setMobileNavActive] = useState(false);

  useEffect(() => {
    if (session && router.pathname === '/login') {
      router.push('/home');
    }
  }, [session, router]);

  return (
    <div>
      <StyledNav>
        <Center>
          <Wrapper>
            <LogoWrapper>
              MealGrub
            </LogoWrapper>
            <LinksWrapper mobileNavActive={mobileNavActive}>
              <NavLink href={"/"}>Home</NavLink>
              <NavLink href="/#about-section">About Us</NavLink>
              <NavLink href={"/"}>Contact Us</NavLink>
              <NavLink href={"/login"}>Login</NavLink>
              <NavLink href={"/register"}>Register</NavLink>
            </LinksWrapper>
            <NavButton onClick={() => setMobileNavActive((prev) => !prev)}>
              {mobileNavActive ? <CloseIcon /> : <HamburgerIcon />}
            </NavButton>
          </Wrapper>
        </Center>
      </StyledNav>
    </div>
  );
}
