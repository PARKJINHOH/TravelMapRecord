import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ModalVisibility, modalVisibilityState } from '../../states/modal';
import { isLoggedInState, travelerState, useDoLogout } from '../../states/traveler';
import './TravelerPill.css'

export default function TravelerPill() {

    const traveler = useRecoilValue(travelerState);
    const isLoggedIn = useRecoilValue(isLoggedInState);
    const doLogout = useDoLogout();

    const setModalVisibility = useSetRecoilState(modalVisibilityState);

    return (
        <Dropdown>
            <Dropdown.Toggle id='traveler-dropdown-toggle' className="align-items-center e-caret-hide">
                {isLoggedIn && <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2" />}
                <strong>{isLoggedIn ? traveler.email : "시작하기"} </strong>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {
                    isLoggedIn ?
                        <Dropdown.Item onClick={doLogout} > 로그아웃</Dropdown.Item>
                        :
                        <>
                            <Dropdown.Item onClick={() => setModalVisibility(ModalVisibility.SHOW_LOGIN)}>로그인</Dropdown.Item>
                            <Dropdown.Item onClick={() => setModalVisibility(ModalVisibility.SHOW_REGISTER)}>회원가입</Dropdown.Item>
                        </>
                }
            </Dropdown.Menu>
        </Dropdown >
    );
}
