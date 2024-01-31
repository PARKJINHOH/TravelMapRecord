import React from 'react';
import {useAPIv1} from "apis/apiv1";

// component
import {Link} from 'react-router-dom';

// mui
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StorageIcon from '@mui/icons-material/Storage';
import MailIcon from '@mui/icons-material/Mail';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

// css
import style from './Sidebar.module.css';

export default function Sidebar() {

    return (
        <div className={style.sidebar}>
            <div className={style.sidebarWrapper}>
                <div className={style.sidebarMenu}>
                    <h3 className={style.sidebarTitle}>Dashboard</h3>
                    <ul className={style.sidebarList}>
                        <Link to="home">
                            <li className={style.sidebarListItem}>
                                <HomeWorkIcon className={style.sidebarIcon}/>
                                Home
                            </li>
                        </Link>
                        <Link to="users">
                            <li className={style.sidebarListItem}>
                                <PeopleAltIcon className={style.sidebarIcon}/>
                                Users
                            </li>
                        </Link>
                        <Link to="server_status">
                            <li className={style.sidebarListItem}>
                                <StorageIcon className={style.sidebarIcon}/>
                                Server Status
                            </li>
                        </Link>
                    </ul>

                    <h3 className={style.sidebarTitle}>notifications</h3>
                    <ul className={style.sidebarList}>
                        <li className={style.sidebarListItem}>
                            <MailIcon className={style.sidebarIcon}/>
                            Mail
                        </li>
                        <li className={style.sidebarListItem}>
                            <ReportGmailerrorredIcon className={style.sidebarIcon}/>
                            Reports
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
