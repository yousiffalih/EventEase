package com.eventease.backend.config;

import com.eventease.backend.event.Event;
import com.eventease.backend.event.EventRepository;
import com.eventease.backend.user.User;
import com.eventease.backend.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(EventRepository eventRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            // ✅ إضافة الأحداث الافتراضية
            if (eventRepo.count() == 0) {
                Event e1 = new Event();
                e1.setTitle("AI Conference");
                e1.setDescription("Conference about the future of AI");
                e1.setDate(Instant.parse("2025-10-01T10:00:00Z"));
                e1.setLocation("Paris");
                e1.setCapacity(50);
                e1.setReservedCount(0);
                e1.setStatus("ACTIVE");

                Event e2 = new Event();
                e2.setTitle("Blockchain Meetup");
                e2.setDescription("Networking event for blockchain enthusiasts");
                e2.setDate(Instant.parse("2025-11-15T18:00:00Z"));
                e2.setLocation("London");
                e2.setCapacity(30);
                e2.setReservedCount(0);
                e2.setStatus("ACTIVE");

                eventRepo.saveAll(List.of(e1, e2));
                System.out.println("✅ Sample events inserted into MongoDB");
            }

            // ✅ إنشاء حساب أدمن افتراضي
            if (userRepo.findByEmail("admin@eventease.com").isEmpty()) {
                User admin = new User();
                admin.setUsername("Admin");
                admin.setEmail("admin@eventease.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // كلمة السر مشفرة
                admin.setRole("ADMIN");
                userRepo.save(admin);

                System.out.println("✅ Admin account created successfully:");
                System.out.println("   Email: admin@eventease.com");
                System.out.println("   Password: admin123");
            }
        };
    }
}
