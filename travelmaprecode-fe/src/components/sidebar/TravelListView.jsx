import React, {useEffect, useState} from 'react'
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil'
import {selectedTravelIdState, travelState} from '../../states/travel'
import {isLoggedInState, travelerState} from '../../states/traveler'
import {useAPIv1} from '../../apis/apiv1'
import NewTravelPill from './NewTravelPill'
import TravelPill from './TravelPill'
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Box, Button, List, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import PanToolIcon from '@mui/icons-material/PanTool';

export default function TravelListView() {
    const apiv1 = useAPIv1();

    const isLoggedIn = useRecoilValue(isLoggedInState);
    const [travelData, setTravelData] = useRecoilState(travelState);
    const [isEditingNewTravel, setIsEditingNewTravel] = useState(false);
    const traveler = useRecoilValue(travelerState);
    const [dndState, setDndState] = useState(true); // 드래그 앤 드롭 상태(초기값: true)
    const [selectedId, setSelectedId] = useRecoilState(selectedTravelIdState);

    

    // GET /api/v1/travel
    useEffect(() => {
        if (!traveler) {
            setTravelData([]);
            return;
        }

        apiv1.get("/travel")
            .then(resp => {
                setTravelData(resp.data);
            })
            .catch(error => {
                console.error(`can not load data: ${error}`);
                setTravelData([]);
            });
    }, [traveler]);

    const onDragEnd = (result) => {
        if (!result.destination) {
            // 1개만 있을 때 옮기면 생기는 오류 방지
            return;
        }
        const sourceIndex = result.source.index;
        const targetIndex = result.destination.index;
        const workValue = travelData.slice();
        const [deletedItem,] = workValue.splice(sourceIndex, 1);
        workValue.splice(targetIndex, 0, deletedItem);

        const newTravelData = workValue.map((t, i) => ({ ...t, "orderKey": i }));
        setTravelData(newTravelData);

        // PUT /api/v1/travel/orderKey
        apiv1.put("/travel/orderKey", newTravelData)
            .then((response) => {
                if (!response.status === 200) {
                    setTravelData([...travelData]);
                }
            });

    }

    const dndHandleClick = () => {
        setDndState(!dndState);
        setSelectedId(null);
    };


    return (
        <List className='sidebar-list-div'>
            {
                isLoggedIn ?
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ margin: '10px', fontSize: '20px', fontWeight: 'bold', color: 'Black' }}>
                                나의 여행 둘러보기
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button onClick={dndHandleClick}>
                                <PanToolIcon
                                    color = {dndState ? 'disabled' : 'primary'}
                                />
                            </Button>
                        </Box>

                        {
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="ROOT">
                                    {provided => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {
                                                travelData.map((t) => {
                                                    return (
                                                        <Draggable draggableId={String(t.orderKey)} index={t.orderKey} key={t.orderKey} isDragDisabled={dndState}>
                                                            {
                                                                provided => (
                                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                        <TravelPill draggable="true" key={t.id} travel={t} />
                                                                    </div>
                                                                )
                                                            }
                                                        </Draggable>
                                                    )
                                                })
                                            }
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        }

                        {
                            <Box
                                className="travel-box"
                                sx={{
                                    backgroundColor: '#cecece', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: "column"
                                }}
                                onClick={() => {
                                    setIsEditingNewTravel(!isEditingNewTravel);
                                    if (dndState === false) {
                                        setDndState(true);
                                    }
                                    setSelectedId(null);
                                }}>
                                <AddIcon sx={{fontSize: '60px'}}/>
                                <Typography>
                                    Click to add new Travel
                                </Typography>
                            </Box>
                        }
                        {
                            isEditingNewTravel && <NewTravelPill onCancle={() => setIsEditingNewTravel(false)}/>
                        }
                    </>
                    :
                    <Box sx={{ padding: 2, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: 'grey' }}>
                        로그인 후 이용해주세요. ✈
                    </Box>
            }
        </List>
    )
}
