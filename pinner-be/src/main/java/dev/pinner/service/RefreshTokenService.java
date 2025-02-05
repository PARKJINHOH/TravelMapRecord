package dev.pinner.service;

import dev.pinner.domain.entity.Admin;
import dev.pinner.domain.entity.RefreshToken;
import dev.pinner.domain.entity.Traveler;
import dev.pinner.exception.BusinessException;
import dev.pinner.repository.AdminRepository;
import dev.pinner.repository.RefreshTokenRepository;
import dev.pinner.repository.TravelerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    @Value("${token.app.jwtRefreshExpirationMs}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final TravelerRepository travelerRepository;
    private final AdminRepository adminRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(String from, String email) {
        RefreshToken refreshToken = new RefreshToken();

        if(from.equals("admin")){
            Optional<Admin> admin = adminRepository.findByEmail(email);
            if (admin.isEmpty()) {
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "사용자가 없습니다.");
            }
            refreshToken.setAdmin(admin.get());

        } else {
            Optional<Traveler> traveler = travelerRepository.findByEmail(email);
            if (traveler.isEmpty()) {
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "사용자가 없습니다.");
            }
            refreshToken.setTraveler(traveler.get());

        }
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken = refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BusinessException(HttpStatus.UNAUTHORIZED, token.getToken() + "Refresh token was expired. Please make a new signin request");
        }

        return token;
    }

    @Transactional
    public void deleteRefreshTokenByEmail(String email) {
        Optional<Traveler> travelerOpt = travelerRepository.findByEmail(email);
        if(travelerOpt.isPresent()){
            refreshTokenRepository.deleteByTravelerId(travelerOpt.get().getId());
        } else {
            log.warn("[RefreshToken] Traveler not found with email: {}", email);
        }

    }
}

