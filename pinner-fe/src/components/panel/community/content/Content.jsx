import React, {useState} from 'react'
import {useRecoilState} from "recoil";
import {commState, commStateKeys} from "states/community/sidebar";
import Summary from "./ContentElement/Summary";

export default function Content() {

    const [navbarSelector, setNavbarSelector] = useRecoilState(commState);
    
    return (
        <>
            {
                (() => {
                    switch (navbarSelector) {
                        case commStateKeys.MAIN:
                            return <Summary/>;
                        case commStateKeys.NOTICE:
                            return '11';
                        case commStateKeys.COMMUNITY:
                            return '22';
                        case commStateKeys.TRAVEL:
                            return '33';
                        case commStateKeys.QNA:
                            return '44';
                        default:
                            return <Summary/>;
                    }
                })()
            }
        </>
    )
}