import * as React from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

function AlertComponent(props) {
    return (
        <Stack sx={{width: '100%'}} spacing={2}>
            <Alert severity={props.type}>{props.message}</Alert>
        </Stack>
    );
}

function errorAlert(str) {
    return <AlertComponent type="error" message={str}/>;
}

function warningAlert(str) {
    return <AlertComponent type="warning" message={str}/>;
}

function infoAlert(str) {
    return <AlertComponent type="info" message={str}/>;
}

function successAlert(str) {
    return <AlertComponent type="info" message={str}/>;
}

export {errorAlert, warningAlert, infoAlert, successAlert};