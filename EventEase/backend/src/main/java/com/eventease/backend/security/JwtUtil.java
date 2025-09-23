package com.eventease.backend.security;

import io. jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    // 🔑 مفتاح التوقيع (secret) — لازم تخليه environment variable بالإنتاج
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // مدة صلاحية التوكن (مثلاً: 24 ساعة)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    // 🟢 توليد التوكن
    public static String generateToken(String userId, String role) {
        return Jwts.builder()
            .setSubject(userId)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(SECRET_KEY)
            .compact();
    }

    // 🟢 استخراج الـ Claims من التوكن
    private static Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(SECRET_KEY)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    // 🟢 استخراج الـ userId
    public static String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 🟢 استخراج الـ role
    public static String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // 🟢 التحقق من صلاحية التوكن
    public static boolean validateToken(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
