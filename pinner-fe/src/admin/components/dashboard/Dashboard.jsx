import React from 'react';

// component

// mui
import {Box} from "@mui/material";
import IconButton from '@mui/joy/IconButton';
import Typography from "@mui/joy/Typography";
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';

// recharts
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

// css
import style from './Dashboard.module.css';

import {SvgIcon} from "@mui/joy";
import Button from "@mui/joy/Button";


export default function Dashboard() {

    const data = [
        {
            name: '23.04',
            traveler: 5,
        },
        {
            name: '23.05',
            traveler: 7,
        },
        {
            name: '23.06',
            traveler: 5,
        },
        {
            name: '23.07',
            traveler: 15,
        },
        {
            name: '23.08',
            traveler: 12,
        },
        {
            name: '23.09',
            traveler: 15,
        },
        {
            name: '23.10',
            traveler: 26,
        },
        {
            name: '23.11',
            traveler: 57,
        },
        {
            name: '23.12',
            traveler: 86,
        },
        {
            name: '24.01',
            traveler: 58,
        },
        {
            name: '24.02',
            traveler: 80,
        },
    ];

    return (
        <Box>
            <Box className={style.container_top}>
                <div className={style.container_top_left}>
                    <Box className={style.summary_1}>
                        <Box className={style.summary_traveler}>
                            <Typography></Typography>
                            <Typography level="h1" sx={{color: '#ffffff'}}>100명</Typography>
                            <Typography level="title-md" sx={{color: '#b39ddb'}}>Total Traveler</Typography>
                        </Box>
                    </Box>
                    <Box className={style.summary_1}>
                        <Box className={style.summary_traveler}>
                            <Typography></Typography>
                            <Typography level="h1" sx={{color: '#ffffff'}}>21398개</Typography>
                            <Typography level="title-md" sx={{color: '#b39ddb'}}>Total Travel</Typography>
                        </Box>
                    </Box>
                </div>
                <div className={style.container_top_right}>
                    <Box className={style.summary_2}>
                        <Box className={style.problem_cnt}>
                            <IconButton variant="outlined" sx={{backgroundColor: '#1565c0'}}>
                                <WarningAmberOutlinedIcon sx={{color: 'white'}}/>
                            </IconButton>
                            <Box sx={{marginLeft: '15px'}}>
                                <Typography level="title-lg" sx={{color: '#ffffff'}}>12개</Typography>
                                <Typography level="body-xs" sx={{color: '#ffffff'}}>문의갯수</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box className={style.summary_2}>
                        <Box className={style.problem_cnt}>
                            <IconButton variant="outlined" sx={{backgroundColor: '#1565c0'}}>
                                <CampaignIcon sx={{color: 'white'}}/>
                            </IconButton>
                            <Box sx={{marginLeft: '15px'}}>
                                <Typography level="title-lg" sx={{color: '#ffffff'}}>2개</Typography>
                                <Typography level="body-xs" sx={{color: '#ffffff'}}>현재 공지사항</Typography>
                            </Box>
                        </Box>
                    </Box>
                </div>
            </Box>

            <Box className={style.container_middle}>
                <Typography level="h3" sx={{color: '#000000', marginLeft:'20px', paddingTop: '10px'}}>Traveler 회원추이(1년)</Typography>
                <ResponsiveContainer className={style.container_charts_container}>
                    <AreaChart
                        data={data}
                        margin={{top: 50, right: 60, left: 0, bottom: 0,}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Area type="monotone" dataKey="traveler" stroke="#8884d8" fill="#8884d8"/>
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
