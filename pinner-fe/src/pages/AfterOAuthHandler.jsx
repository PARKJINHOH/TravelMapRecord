import { postLoginAfterOAuth } from 'apis/traveler/auth';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDoLogin } from 'states/traveler';

export default function AfterOAuthHandler() {
    const doLogin = useDoLogin();

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const ticket = searchParams.get('ticket');


        postLoginAfterOAuth(ticket)
            .then((response) => {
                doLogin({
                    email: response.data.email,
                    nickname: response.data.nickname,
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                    signupServices: response.data.signupServices,
                });
            })
            .catch((error) => {
                alert(error.response.data.message);
            })
            .finally(() => {
                window.location = "/";
            });
    }, [])


    return <p>wait a sec</p>
}