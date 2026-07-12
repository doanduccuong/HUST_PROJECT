package com.tms.api.controller;

import com.tms.api.dto.LoginRequest;
import com.tms.api.dto.LoginResponse;
import com.tms.entity.User;
import com.tms.repository.UserRepository;
import com.tms.api.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        User user = userOpt.get();
        if (Boolean.TRUE.equals(user.getIsLocked())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User account is locked");
        }

        String token = jwtTokenUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullname(user.getFullname())
                .role(user.getUserType())
                .build());
    }
}
