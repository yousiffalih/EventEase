package com.eventease.backend.user;

import com.eventease.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }


    // ✅ Signup
    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody User user) {
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        user.setPassword(passwordEncoder.encode(user.getPassword())); // 👈 hash password
        return ResponseEntity.ok(repo.save(user));
    }


    // ✅ Login (بسيط حالياً بدون JWT)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User login) {
        var user = repo.findByEmail(login.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getId(), user.getRole());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "role", user.getRole(),
            "userId", user.getId()
        ));
    }

}
