import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

// api
import { HTTPStatus, useAPIv1 } from 'apis/traveler/apiv1';

// css
import style from './TravelPill.module.css';

// component
import { representPhotoIdOfTravel } from 'common/travelutils';
import { googleMapState } from 'states/map';
import { newJourneyStepState } from 'states/modal';
import { selectedTravelIdState, travelState } from 'states/travel';
import { centerOfPoints } from 'utils';
import JourneyList from "components/panel/journey/JourneyList";
import RepresentImage from 'components/panel/RepresentImage';

// mui
import { Box, Chip, IconButton, Typography } from '@mui/material';

// icon
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

// etc
import "react-toastify/dist/ReactToastify.css";


/**
 * 여행 목록(Travel List)에서의 여행(Travel) 컴포넌트
 * @param {{"travel": Travel, "editMode": any, setEditMode: any}} props
 */
export default function TravelPill({ travel, editMode, setEditMode }) {
    const apiv1 = useAPIv1();

    const [isRenaming, setIsRenaming] = useState(false);

    const setNewJourneyStep = useSetRecoilState(newJourneyStepState);

    const [selectedId, setSelectedId] = useRecoilState(selectedTravelIdState);
    const isSelected = travel.id === selectedId;

    const setTravels = useSetRecoilState(travelState);

    // 맵 위치를 여행의 중심으로 이동
    const [gMap, setGMap] = useRecoilState(googleMapState);

    const journeyList = travel.journeys;
    const uniqueDate = [...new Set(journeyList.map((v) => v.date))]
    const newData = uniqueDate.reduce(
        (acc, v) => [...acc, [...journeyList.filter((d) => d.date === v)]], []
    );

    // journeySideBar 상태
    const [selectedTravelId, setSelectedTravelId] = useRecoilState(selectedTravelIdState);

    const journeyCnt = travel.journeys.length;
    const journeyPhotoCnt = journeyList.reduce((acc, v) => v.photos.length + acc, 0);

  /**
   * 여행을 클릭했을 때의 이벤트 핸들러
   * 화면이동은 BasePage.jsx의 map.fitBounds에서 처리
   */
  function onJourneyClick() {
      setEditMode("");

      if (selectedTravelId === travel.id) {
        setSelectedTravelId("");
        return;
      }
      setSelectedTravelId(travel.id);
    }

    /**
     * 이름 변경 중 ESC키를 누르면 취소를, 엔터를 누르면 적용한다.
     * @param {KeyboardEvent} e
     */
    async function onKeyDownRename(e) {
        const isEsc = e.key === "Escape";
        const isEnter = e.key === "Enter";

        if (isEsc || isEnter) {
            e.preventDefault();
            if (isEnter) {
                const titleJson = JSON.stringify({
                    title: e.target.value,
                });

                await apiv1.patch("/travel/" + travel.id, titleJson)
                    .then((response) => {
                        setTravels(response.data);
                    });
            }
            setIsRenaming(false);
        }
    }

    const renameTextInput = <input type="text" autoFocus={true} onKeyDown={onKeyDownRename} onBlur={() => setIsRenaming(false)}></input>;

    const travelTitle =
        <Box>
            <Typography sx={{ fontWeight: 'bold', fontSize: '19px' }}>
                {travel.title}
            </Typography>
        </Box>;

    const photo = representPhotoIdOfTravel(travel);

    async function onDeleteClick() {
        if (window.confirm(`"${travel.title}" 여행을 정말 삭제하실건가요?`)) {
            await apiv1.delete(`/travel/${travel.id}`)
                .then((response) => {
                    if (response.data.length === 0) {
                        setEditMode('');
                    }
                    setTravels(response.data);
                });
        }
    }

    return (
        <>
            <Box className={style.root_box}>
                <div onClick={onJourneyClick}>
                    {
                        editMode === 'DELETE' && (
                            <IconButton
                                aria-label="delete"
                                sx={{ position: 'absolute' }}
                                className={style.travel_delete_iconBtn}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteClick();
                                }}
                            >
                                <DeleteForeverOutlinedIcon
                                    className={style.travel_delete_icon}
                                    sx={{ fontSize: 30, color: 'red' }}
                                />
                            </IconButton>
                        )
                    }
                    <Box className={style.travel_box} >
                        {
                            photo !== null ?
                                <RepresentImage photo={photo} />
                                :
                                <Typography color="textSecondary">
                                    사진 없음
                                </Typography>
                        }
                        <div className={style.travel_info}>
                            <Chip
                                size="small"
                                sx={{
                                    backgroundColor: '#343434',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                                label={`${journeyCnt} 장소`}
                            />
                            <Chip
                                size="small"
                                sx={{
                                    backgroundColor: '#343434',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginLeft: '3px'
                                }}
                                label={`${journeyPhotoCnt} 이미지`}
                            />
                        </div>
                    </Box>
                    {isRenaming ? renameTextInput : travelTitle}
                </div>
            </Box>

            {
                /* 여정(Journey)목록 리스트 패널 */
                selectedTravelId === travel.id && (
                    <JourneyList travel={travel} />
                )
            }
        </>
    )
}