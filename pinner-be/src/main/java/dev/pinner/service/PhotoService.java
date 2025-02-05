package dev.pinner.service;

import dev.pinner.domain.dto.PhotoDto;
import dev.pinner.domain.entity.Photo;
import dev.pinner.exception.BusinessException;
import dev.pinner.exception.SystemException;
import dev.pinner.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.lang.Math.max;
import static javax.imageio.ImageIO.read;
import static javax.imageio.ImageIO.write;

@Slf4j
@Service
@RequiredArgsConstructor
public class PhotoService {
    @Value("${path.url}")
    private String urlPath;

    @Value("${path.image}")
    private String imageFolder;

    static final int MAX_SIZE = 1080;

    private final PhotoRepository photoRepository;

    private byte[] tryResize(ByteArrayInputStream imageStream) throws IOException {
        BufferedImage originImage = read(imageStream);

        originImage = stripAlphaChannel(originImage);

        int width = originImage.getWidth();
        int height = originImage.getHeight();
        log.debug("업로드된 이미지 크기 ({}, {})", width, height);

        // 이미지 크기를 체크하고 제한보다 작을 경우 통과시킨다.
        if (max(width, height) < MAX_SIZE) {
            log.debug("업로드된 이미지가 제한 크기보다 작습니다. 압축을 하지 않습니다.");
            imageStream.reset();
            return imageStream.readAllBytes();
        }

        BufferedImage resizedImage = resize(originImage, MAX_SIZE);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        write(resizedImage, "jpg", outputStream);

        return outputStream.toByteArray();
    }

    /**
     * 알파 채널을 없애기 위해 배경색이 있는 {@code BufferedImage}을 생성하고, 주어진 {@code image}를 그 위에 덮어씁니다.<p>
     * See also  <a href=https://stackoverflow.com/a/60677340>스택 오버플로</a><p>
     *
     * @param image 이미지, PNG 혹은 JPG 인코딩일 수 있음
     * @return 알파 채널이 없어진 {@code BufferedImage}
     */
    BufferedImage stripAlphaChannel(BufferedImage image) {
        // NOTE: JPG일 경우 early return 하여 쓸모없는 CPU 파워를 아낄 수 있음.
        BufferedImage originImage = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
        originImage.createGraphics().drawImage(image, 0, 0, Color.WHITE, null);
        return originImage;
    }

    /**
     * <a href=https://mkyong.com/java/how-to-convert-bufferedimage-to-byte-in-java/>참조</a>
     * <a href=https://mkyong.com/java/how-to-convert-byte-to-bufferedimage-in-java/>참조</a>
     */
    @SuppressWarnings("SameParameterValue")
    BufferedImage resize(BufferedImage originalImage, int targetSize) {
        return Scalr.resize(originalImage, Scalr.Method.QUALITY, targetSize);
    }

    public String findPhotoByFileName(String fileName) {
        if(fileName.isBlank()){
            throw new BusinessException(HttpStatus.BAD_REQUEST, "잘못된 경로입니다.");
        }

        Photo entity = photoRepository.findByFileName(fileName)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 파일이 존재하지 않습니다."));

        return entity.getFullPath();
    }

    public List<Photo> processPhotosForJourney(List<MultipartFile> multipartFiles)  {
        // 반환할 파일 리스트
        List<Photo> fileList = new ArrayList<>();

        // 전달되어 온 파일이 존재할 경우
        if (CollectionUtils.isEmpty(multipartFiles)) {
            return null;
        }

        for (MultipartFile multipartFile : multipartFiles) {

            // 파일의 확장자 추출
            String originalFileExtension = getFileExtension(multipartFile);

            // 이미지 가로,세로 추출
            byte[] imageBytes;
            BufferedImage image;
            try {
                imageBytes = multipartFile.getBytes();
                ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
                image = ImageIO.read(bis);
            } catch (IOException io) {
                throw new SystemException(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 문제가 발생했습니다.", io);
            }
            int actualWidth = image.getWidth();
            int actualHeight = image.getHeight();

            // 파일명 중복 피하고자 UUID사용.
            String fileName = UUID.randomUUID().toString();

            // 이미지 폴더 생성
            String imagePath = createImagePath();
            String fullPath = getFullImagePath(imagePath, fileName, originalFileExtension);
            String srcPath = getSrcPath(fileName);

            PhotoDto.Request photoDto = PhotoDto.Request.builder()
                    .originFileName(multipartFile.getOriginalFilename())
                    .fileName(fileName)
                    .fullPath(fullPath)
                    .src(srcPath)
                    .width(actualWidth)
                    .height(actualHeight)
                    .fileSize(multipartFile.getSize())
                    .build();

            Photo photo = photoDto.toEntity();

            // 생성 후 리스트에 추가
            fileList.add(photo);

            // 업로드 한 파일 데이터를 지정한 파일에 저장
            String absolutePath = new File("").getAbsolutePath() + File.separator;
            File directoryPath = new File(absolutePath + imagePath + File.separator + fileName + originalFileExtension);
            try {
                multipartFile.transferTo(directoryPath);
            } catch (Exception ex) {
                throw new SystemException(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 문제가 발생했습니다.", ex);
            }

        }

        return fileList;
    }

    public static String getFileExtension(MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.getOriginalFilename() == null) {
            return "";
        }

        String originalFilename = multipartFile.getOriginalFilename();
        int dotIndex = originalFilename.lastIndexOf('.');

        if (dotIndex == -1 || dotIndex == originalFilename.length() - 1) {
            return "";
        }

        // return .jpg, .png, .gif
        return originalFilename.substring(dotIndex);
    }

    private String createImagePath() {
        // 파일명을 업로드 한 날짜로 변환하여 저장
        String current_date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 파일을 저장할 세부 경로 지정
        String path = imageFolder + File.separator + current_date;
        File directoryPath = new File(path);

        // 디렉터리가 존재하지 않을 경우 생성
        if (!directoryPath.exists()) {
            boolean wasSuccessful = directoryPath.mkdirs();

            // 디렉터리 생성에 실패했을 경우 처리
            if (!wasSuccessful)
                throw new RuntimeException("Failed to create image directory.");
        }

        return path;
    }

    private String getFullImagePath(String imagePath, String fileName, String originalFileExtension) {
        return imagePath + File.separator + fileName + originalFileExtension;
    }

    private String getSrcPath(String fileName) {
        return urlPath + File.separator + "photo" + File.separator + fileName;
    }
}
