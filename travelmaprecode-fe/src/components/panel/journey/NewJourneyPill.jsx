import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";

// api
import {HTTPStatus, useAPIv1} from '../../../apis/apiv1'
import iso3166_1 from 'apis/iso3166_1.json';

// css
import style from './NewJourneyPill.module.css';

// component
import {journeyListViewWidth, sidebarWidth, travelListViewWidth} from "../../../states/panel/panelWidth";
import {travelState} from "../../../states/travel";
import {NewJourneyStep, newJourneyStepState, newLocationState} from "../../../states/modal";

// mui
import {Tooltip, Input} from "@mui/joy";
import {Alert, Autocomplete, Box, Button, CircularProgress, ImageList, ImageListItem, ImageListItemBar, Paper, Stack, TextField, Typography} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import IconButton from "@mui/material/IconButton";

// mui Icon
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// mantine
import {Divider} from "@mantine/core";
import {IMAGE_MIME_TYPE} from "@mantine/dropzone";

// etc
import Tags from "@yaireo/tagify/dist/react.tagify";
import dayjs from "dayjs";
import {toast} from "react-hot-toast";


/**
 * Journey 글쓰기 컴포넌트
 * @param travel
 * @param editingCancel
 */
export default function NewJourneyPill({ travel, editingCancel }) {
    const apiv1 = useAPIv1();
    const inputRef = useRef(null);

    // Panel Width
    const _sidebarWidth = useRecoilValue(sidebarWidth);
    const _travelListViewWidth = useRecoilValue(travelListViewWidth);
    const _journeyPanelWidth = useRecoilValue(journeyListViewWidth);

    const setTravels = useSetRecoilState(travelState);
    const [newJourneyStep, setNewJourneyStep] = useRecoilState(newJourneyStepState);
    const [newLocation, setNewLocation] = useRecoilState(newLocationState);

    const currentDate = dayjs().format('YYYY-MM-DD');
    const [pickerDate, setPickerDate] = useState(dayjs(currentDate));
    const [hashtags, setHashtags] = useState([])
    const [photos, _setPhotos] = useState([]);
    const [countryKrNm, setCountryKrNm] = useState(null);

    const [saving, setSaving] = useState(false);

    const [countries, setCountries] = useState(iso3166_1);

    const removePhoto = (idx) => _setPhotos([...photos.slice(0, idx), ...photos.slice(idx + 1, photos.length)]);

    useEffect(() => {
        setNewLocation({lat: 0, lng: 0, name: "", countryCd: ""});
    }, []);
    useEffect(() => {
        const countryCdToFind = newLocation.countryCd;
        const hasCountry = countries.find((country) => country.country_iso_alp2 === countryCdToFind);

        if (hasCountry) {
            setCountryKrNm(hasCountry.country_nm);
        }

    }, [newLocation]);


    async function onCreate() {
        // 사진 최대 용량 (10MB)
        const maxPhotoSize = 10475274;

        if (saving) {
            return;
        }

        if (newLocation.name === "") {
            toast.error("여행한 지역을 선택해주세요.");
            return;
        }
        if (hashtags.length === 0) {
            toast.error("여행을 대표하는 태그를 1개 이상 입력해주세요.");
            return;
        }
        if (photos.length !== 0 && hasExceededSize(photos, maxPhotoSize)) {
            toast.error('10MB 이하 파일만 등록할 수 있습니다.');
            return;
        } else if (photos.length === 0 && !window.confirm('사진이 없습니다. 그래도 저장하시겠습니까?\n(저장 후 수정으로 사진 추가가 가능합니다.)')) {
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            if (photos.length !== 0) {
                photos.forEach(photo => {
                    formData.append('photo', photo);
                });
            }
            const journeyData = JSON.stringify({
                date: dayjs(pickerDate).format('YYYY-MM-DD'),
                geoLocation: newLocation,
                hashtags: hashtags
            });
            formData.append('newJourney', new Blob([journeyData], {type: 'application/json'}));

            await apiv1.post(`/travel/${travel.id}/journey`, formData)
                .then((response) => {
                    if (response.status === HTTPStatus.OK) {
                        setTravels(response.data);
                        editingCancel();
                    }
                });
        } catch (error) {
            console.error('error : ', error);
            toast.error('여정을 저장하지 못했습니다.');
        } finally {
            setSaving(false);
        }
    }

    function hasExceededSize(photos, maxPhotoSize) {
        return photos.some(photo => photo.size > maxPhotoSize);
    }

    /**
     * HashTag
     */
    const onHashTagChange = useCallback((e) => {
        const map = e.detail.tagify.value.map(e => e.value);
        const hashtagsOver7 = map.filter(value => value.length > 10);
        if (hashtagsOver7.length > 0) {
            toast.error('해시태그는 10글자 이하여야 합니다.');
        }
        const validHashtags = map.filter(value => value.length <= 10);
        setHashtags(validHashtags);
    }, []);

    const onClickAddPhotos = (event) => {
        // 개별사진 10MB, 총합 최대 100MB
        let limitPhoto = 10; // 최대 사진 갯수

        const files = event.target.files;
        if (files && files.length > 0) {
            const newPhotos = Array.from(files); // FileList를 배열로 변환하여 newPhotos 배열에 추가

            if(newPhotos.length + photos.length > 10) {
                toast.error('사진 갯수는 최대 10장입니다.');
                return;
            }
            const currentPhotoCount = photos.length;
            const additionalPhotoCount = Math.min(newPhotos.length, limitPhoto - currentPhotoCount);
            const additionalPhotos = newPhotos.slice(0, additionalPhotoCount);
            const combinedPhotos = [...photos, ...additionalPhotos];
            _setPhotos(combinedPhotos);
        }
    };

    function setLocationTitle(title){
        if (title.length > 50) {
            toast("50글자 이내로 입력해주세요");
            return;
        }

        setNewLocation({...newLocation, name: title});
    }

    /**
     * DatePicker용 Button 함수
     * @param props
     * @returns {JSX.Element}
     * @constructor
     */
    function ButtonField(props) {
        const {
            setOpen,
            label,
            id,
            disabled,
            InputProps: { ref } = {},
        } = props;

        return (
            <Button
                sx={{padding: 0, width: '100%'}}
                variant="text"
                id={id}
                disabled={disabled}
                ref={ref}
                onClick={() => setOpen?.((prev) => !prev)}
            >
                {label}
            </Button>
        );
    }

    /**
     * 클릭시 DatePicker 관련 함수
     * @param props
     * @returns {JSX.Element}
     * @constructor
     */
    function ButtonDatePicker(props) {
        const [open, setOpen] = useState(false);

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    dayOfWeekFormatter={(day) => day}
                    slots={{ field: ButtonField, ...props.slots }}
                    slotProps={{ field: { setOpen } }}
                    {...props}
                    open={open}
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                />
            </LocalizationProvider>
        );
    }

    return (
        <>
            <Paper
                className={style.root_paper}
                sx={{width: _journeyPanelWidth, left: _sidebarWidth + _travelListViewWidth,}}
            >
                <Box>
                    <div className={style.journey_title_group}>
                        <Input
                            sx={{'--Input-gap': '1px'}}
                            label="여행한 장소를 입력해주세요."
                            startDecorator={
                                <LocationOnIcon
                                    sx={{cursor: 'pointer'}}
                                    onClick={() => {
                                        toast('지도를 클릭해주세요', {duration: 2000,});
                                        setNewJourneyStep(NewJourneyStep.LOCATING);
                                    }}
                                />
                            }
                            value={newLocation.name}
                            onChange={e => setLocationTitle(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div className={style.journey_country_group}>
                        <Autocomplete
                            value={countryKrNm}
                            onChange={(event, newValue) => {
                                setCountryKrNm(newValue.country_nm);
                            }}
                            sx={{ width: '70%' }}
                            options={countries}
                            autoHighlight
                            getOptionLabel={(option) => option.country_nm || option}
                            isOptionEqualToValue={(option, newValue) => {
                                return option.country_nm === newValue;
                            }}
                            renderOption={(props, country) => (
                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                    <img
                                        loading="lazy"
                                        width="20"
                                        src={`https://flagcdn.com/w20/${country.country_iso_alp2.toLowerCase()}.png`}
                                        srcSet={`https://flagcdn.com/w40/${country.country_iso_alp2.toLowerCase()}.png 2x`}
                                        alt=""
                                    />
                                    {country.country_nm}
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="국가를 선택해주세요."
                                />
                            )}
                        />
                        <Divider sx={{marginLeft : '11px'}} orientation="vertical" />
                        <div className={style.newJourney_date_group}>
                            <Typography sx={{fontSize: '16px'}}>여행날짜</Typography>
                            <ButtonDatePicker
                                sx={{cursor: 'pointer'}}
                                label={`${pickerDate.format('YYYY-MM-DD')}`}
                                value={pickerDate}
                                onChange={(newPickerDate) => setPickerDate(newPickerDate)}
                            />
                        </div>
                    </div>

                    <div className={style.newJourney_tags}>
                        <Tags
                            className={style.newJourney_tag}
                            settings={{maxTags: '5'}}
                            onChange={onHashTagChange}
                            placeholder='태그 최대 5개'
                        />
                    </div>
                </Box>

                <div className={style.newJourney_tool}>
                    <IconButton
                        className={style.arrow_icon_btn}
                        onClick={() => {
                            editingCancel();
                        }}
                    >
                        <ArrowBackIosOutlinedIcon
                            sx={{fontSize: '30px'}}
                        />
                    </IconButton>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={IMAGE_MIME_TYPE} // 이미지 파일만 선택할 수 있도록 설정
                        style={{ display: 'none' }}
                        onChange={onClickAddPhotos}
                        multiple
                    />
                    <label className={style.add_icon}>
                        <Tooltip title="사진 추가" variant="outlined" size="lg">
                            <AddBoxOutlinedIcon
                                sx={{fontSize: '30px'}}
                                onClick={() => inputRef.current.click()}
                            />
                        </Tooltip>
                    </label>
                    <Tooltip title="저장" variant="outlined" size="lg">
                        <CheckBoxOutlinedIcon
                            className={style.save_icon}
                            sx={{
                                fontSize: '30px',
                                color: saving ? 'gray' : '#10bb00',
                                pointerEvents: saving ? 'none' : 'auto',
                            }}
                            onClick={onCreate}
                        />
                    </Tooltip>
                </div>

                <Divider />
                <Box className={style.newJourney_imageBox}>
                    {saving && (
                        <CircularProgress
                            className={style.saving_icon}
                            size={48}
                        />
                    )}
                    {
                        photos.length > 0 ?
                            <ImageList variant="masonry" cols={2} gap={8}>
                                {photos.map((photo, index) => {
                                    const tmpPhotoUrl = URL.createObjectURL(photo);
                                    return (
                                        <ImageListItem key={index}>
                                            <ImageListItemBar
                                                sx={{
                                                    background: "transparent"
                                                }}
                                                position="top"
                                                actionPosition="left"
                                                actionIcon={
                                                    <IconButton
                                                        sx={{color: 'red'}}
                                                        onClick={() => removePhoto(index)}>
                                                        <DeleteForeverOutlinedIcon />
                                                    </IconButton>
                                                }
                                            />
                                            <img
                                                style={{ border: photo.size > 10400000 ? '3px solid red' : '1px solid #cbcbcb' }}
                                                src={tmpPhotoUrl}
                                                srcSet={tmpPhotoUrl}
                                                loading="lazy"
                                                alt="tmpImg"
                                            />
                                        </ImageListItem>
                                    );
                                })}
                            </ImageList>
                            :
                            <div className={style.no_picture}>
                                <Stack sx={{width: '80%'}}>
                                    <Alert variant="outlined" severity="info" sx={{justifyContent: 'center'}}>
                                        사진을 추가해주세요.
                                    </Alert>
                                </Stack>
                            </div>
                    }
                </Box>
            </Paper>
        </>
    );
}