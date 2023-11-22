package dev.pinner.controller;

import dev.pinner.domain.dto.TravelerDto;
import dev.pinner.exception.CustomException;
import dev.pinner.service.TravelerService;
import dev.pinner.service.oauth.OAuthAfterLoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/traveler")
@RequiredArgsConstructor
public class TravelerController {

    private final TravelerService travelerService;
    private final OAuthAfterLoginService afterLoginService;

    @GetMapping("/echo")
    public String echo(@AuthenticationPrincipal OAuth2User principal) {
        log.info("principal : {}", principal);
        return "hello " + principal.getAttribute("email");
    }

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> createAccount(@RequestBody TravelerDto.Request travelerDto) {
        String nickname = travelerService.register(travelerDto);
        return ResponseEntity.ok().body(nickname + "님 회원가입에 성공했습니다.");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody TravelerDto.Request travelerDto) {
        TravelerDto.Response response = travelerService.doLogin(travelerDto);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        if (response.getEmail().equals(travelerDto.getEmail())) {
            return ResponseEntity.ok().body(response);
        }

        return ResponseEntity.notFound().build();
    }


    // Oauth 로그인
    @PostMapping("/afteroauth/{jwtTicket}")
    public ResponseEntity<?> afterOauth(@PathVariable String jwtTicket) {
        Long travelerId = afterLoginService.get(jwtTicket);
        if (travelerId == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to longin via OAuth: afteroauth entry(%s) are does not exists or expired".formatted(jwtTicket));
        }

        TravelerDto.Response getResult = travelerService.doLoginBySocial(travelerId);
        if (getResult == null) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to login via OAuth: no user found who has id(%d)".formatted(travelerId));
        }

        return ResponseEntity.ok().body(getResult);
    }

    // 내정보 수정) 비밀번호 체크
    @PostMapping("/password/check")
    public ResponseEntity<?> passwordCheck(@RequestBody TravelerDto.Request travelerDto) {
        boolean isPasswordValid = travelerService.passwordCheck(travelerDto);

        if (isPasswordValid) {
            return ResponseEntity.ok().build();
        } else {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "비밀번호가 일치하지 않습니다.");
        }

    }

    // 내정보 수정
    @PutMapping()
    public ResponseEntity<?> putTraveler(@RequestBody TravelerDto.Request travelerDto) {
        TravelerDto.Response response = travelerService.updateTraveler(travelerDto);
        return ResponseEntity.ok().body(response);
    }

    // token 갱신
    @PostMapping("/renewal/token")
    public ResponseEntity<?> refreshToken(@RequestBody TravelerDto.Request travelerDto) {
        TravelerDto.Response response = travelerService.getRefreshToken(travelerDto);
        return ResponseEntity.ok().body(response);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logoutTraveler(@RequestBody TravelerDto.Request travelerDto) {
        travelerService.doLogout(travelerDto);
        return ResponseEntity.ok("정상적으로 로그아웃되었습니다.");
    }

    // 일반회원 탈퇴
    @PostMapping("/delete")
    public ResponseEntity<?> deleteTraveler(@RequestBody TravelerDto.Request travelerDto) {
        boolean isSuccess = travelerService.deleteTraveler(travelerDto);
        if(isSuccess){
            return ResponseEntity.ok().build();
        } else {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "탈퇴에 실패했습니다. 관리자에게 문의하세요");
        }
    }

    // 소셜로그인 탈퇴
    @PostMapping("/delete/afteroauth")
    public ResponseEntity<?> deleteOauthTraveler(@RequestBody TravelerDto.Request travelerDto) {
        boolean isSuccess = travelerService.deleteTraveler(travelerDto);
        if(isSuccess){
            return ResponseEntity.ok().build();
        } else {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "탈퇴에 실패했습니다. 관리자에게 문의하세요");
        }
    }

}
