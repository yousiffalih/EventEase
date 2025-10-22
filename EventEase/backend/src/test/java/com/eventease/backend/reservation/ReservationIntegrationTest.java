package com.eventease.backend.reservation;

import com.eventease.backend.AbstractIntegrationTest;
import com.eventease.backend.event.Event;
import com.eventease.backend.event.EventRepository;
import com.eventease.backend.reservation.dto.ReservationRequest;
import com.eventease.backend.security.JwtUtil;
import com.eventease.backend.user.User;
import com.eventease.backend.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 اختبارات التكامل لـ User Story: "حجز مكان في حدث"
 * 
 * User Story:
 * En tant que: utilisateur connecté
 * Je voudrais: réserver une place pour un événement
 * Afin de: participer à l'événement si des places sont disponibles
 * 
 * Critères d'acceptation:
 * 1. L'utilisateur doit être connecté pour réserver
 * 2. Le système doit vérifier si des places sont disponibles
 * 3. Si une place est disponible → réservation confirmée
 * 4. Si aucune place disponible → message d'erreur
 * 5. Une confirmation de réservation est affichée
 * 
 * 🐳 يستخدم Testcontainers - MongoDB يعمل تلقائياً في Docker
 */
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ReservationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReservationRepository reservationRepo;

    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Event testEvent;
    private String validToken;

    @BeforeEach
    void setUp() {
        // 🧹 تنظيف قاعدة البيانات قبل كل اختبار
        reservationRepo.deleteAll();
        eventRepo.deleteAll();
        userRepo.deleteAll();

        // 👤 إنشاء مستخدم تجريبي
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@eventease.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole("USER");
        testUser = userRepo.save(testUser);

        // 🎉 إنشاء حدث تجريبي مع أماكن متاحة
        testEvent = new Event();
        testEvent.setTitle("AI Conference 2025");
        testEvent.setDescription("Conference about AI");
        testEvent.setDate(Instant.parse("2025-12-01T10:00:00Z"));
        testEvent.setLocation("Paris");
        testEvent.setCapacity(50);
        testEvent.setReservedCount(0);
        testEvent.setStatus("ACTIVE");
        testEvent = eventRepo.save(testEvent);

        // 🔑 توليد JWT Token صالح
        validToken = JwtUtil.generateToken(testUser.getId(), testUser.getRole());
    }

    @AfterEach
    void tearDown() {
        // 🧹 تنظيف بعد كل اختبار
        reservationRepo.deleteAll();
        eventRepo.deleteAll();
        userRepo.deleteAll();
    }

    // ========================================
    // ✅ TC1: الحالة الطبيعية - حجز ناجح
    // ========================================
    @Test
    @Order(1)
    @DisplayName("TC1 - Cas nominal: Utilisateur connecté réserve un événement avec places disponibles")
    void testCasNominal_ReservationAvecPlacesDisponibles() throws Exception {
        // GIVEN: مستخدم متصل وحدث فيه أماكن متاحة
        ReservationRequest request = new ReservationRequest(testEvent.getId(), testUser.getId());

        // WHEN: المستخدم يرسل طلب حجز
        MvcResult result = mockMvc.perform(post("/api/reservations")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                // THEN: يجب أن يكون الرد 200 OK
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.eventId").value(testEvent.getId()))
                .andExpect(jsonPath("$.userId").value(testUser.getId()))
                .andReturn();

        // ✅ التحقق من أن الحجز تم حفظه في قاعدة البيانات
        assertEquals(1, reservationRepo.count(), "يجب أن يكون هناك حجز واحد في قاعدة البيانات");

        // ✅ التحقق من أن عدد الأماكن المحجوزة زاد
        Event updatedEvent = eventRepo.findById(testEvent.getId()).orElseThrow();
        assertEquals(1, updatedEvent.getReservedCount(), "يجب أن يزيد عدد المحجوزين بمقدار 1");
    }

    // ========================================
    // ❌ TC2: الحالة البديلة 1 - الحدث ممتلئ
    // ========================================
    @Test
    @Order(2)
    @DisplayName("TC2 - Cas alternatif 1: L'événement est complet (aucune place disponible)")
    void testCasAlternatif1_EvenementComplet() throws Exception {
        // GIVEN: حدث ممتلئ (عدد المحجوزين = السعة)
        testEvent.setCapacity(10);
        testEvent.setReservedCount(10); // ممتلئ
        eventRepo.save(testEvent);

        ReservationRequest request = new ReservationRequest(testEvent.getId(), testUser.getId());

        // WHEN: المستخدم يحاول الحجز
        mockMvc.perform(post("/api/reservations")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                // THEN: يجب أن يرجع خطأ 400 مع رسالة "No more places available"
                .andExpect(status().is4xxClientError())
                .andExpect(content().string(containsString("No more places available")));

        // ✅ التحقق من عدم إنشاء حجز
        assertEquals(0, reservationRepo.count(), "يجب ألا يتم إنشاء أي حجز");
    }

    // ========================================
    // 🔒 TC3: الحالة البديلة 2 - مستخدم غير موجود
    // ========================================
    @Test
    @Order(3)
    @DisplayName("TC3 - Cas alternatif 2: L'utilisateur n'existe pas dans la base")
    void testCasAlternatif2_UtilisateurNonConnecte() throws Exception {
        // GIVEN: طلب حجز بمستخدم غير موجود
        ReservationRequest request = new ReservationRequest(testEvent.getId(), "nonexistent-user-id");

        // WHEN: إرسال الطلب
        mockMvc.perform(post("/api/reservations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                // THEN: يجب أن يرجع 401 Unauthorized
                .andExpect(status().isUnauthorized());

        // ✅ التحقق من عدم إنشاء حجز
        assertEquals(0, reservationRepo.count(), "يجب ألا يتم إنشاء أي حجز لمستخدم غير موجود");
    }

    // ========================================
    // 🔁 TC4: الحالة البديلة 3 - حجز مكرر
    // ========================================
    @Test
    @Order(4)
    @DisplayName("TC4 - Cas alternatif 3: L'utilisateur tente de réserver le même événement 2 fois")
    void testCasAlternatif3_ReservationDupliquee() throws Exception {
        // GIVEN: المستخدم حجز الحدث مسبقاً
        Reservation existingReservation = new Reservation();
        existingReservation.setEventId(testEvent.getId());
        existingReservation.setUserId(testUser.getId());
        existingReservation.setStatus("PENDING");
        reservationRepo.save(existingReservation);

        ReservationRequest request = new ReservationRequest(testEvent.getId(), testUser.getId());

        // WHEN: المستخدم يحاول الحجز مرة أخرى
        mockMvc.perform(post("/api/reservations")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                
                // THEN: يجب أن يرجع 409 Conflict
                .andExpect(status().isConflict());

        // ✅ التحقق من عدم إنشاء حجز جديد
        assertEquals(1, reservationRepo.count(), "يجب أن يبقى حجز واحد فقط");
    }

    // ========================================
    // ⚡ TC5: حالة الحد - تزامن (Concurrency)
    // ========================================
    @Test
    @Order(5)
    @DisplayName("TC5 - Cas limite: 2 utilisateurs réservent la dernière place simultanément")
    void testCasLimite_ConcurrenceLastPlace() throws Exception {
        // GIVEN: حدث فيه مكان واحد فقط
        testEvent.setCapacity(1);
        testEvent.setReservedCount(0);
        eventRepo.save(testEvent);

        // إنشاء مستخدم ثاني
        User user2 = new User();
        user2.setUsername("user2");
        user2.setEmail("user2@eventease.com");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setRole("USER");
        final User finalUser2 = userRepo.save(user2);

        final String token2 = JwtUtil.generateToken(finalUser2.getId(), finalUser2.getRole());

        // WHEN: مستخدمان يحاولان الحجز في نفس الوقت
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(2);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        // Thread 1: User 1 يحجز
        executor.submit(() -> {
            try {
                ReservationRequest req1 = new ReservationRequest(testEvent.getId(), testUser.getId());
                MvcResult result = mockMvc.perform(post("/api/reservations")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                        .andReturn();
                
                if (result.getResponse().getStatus() == 200) {
                    successCount.incrementAndGet();
                } else {
                    failCount.incrementAndGet();
                }
            } catch (Exception e) {
                failCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        // Thread 2: User 2 يحجز
        executor.submit(() -> {
            try {
                ReservationRequest req2 = new ReservationRequest(testEvent.getId(), finalUser2.getId());
                MvcResult result = mockMvc.perform(post("/api/reservations")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                        .andReturn();
                
                if (result.getResponse().getStatus() == 200) {
                    successCount.incrementAndGet();
                } else {
                    failCount.incrementAndGet();
                }
            } catch (Exception e) {
                failCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        latch.await(); // انتظار انتهاء الـ threads
        executor.shutdown();

        // THEN: يجب أن ينجح واحد فقط ويفشل الآخر
        assertEquals(1, successCount.get(), "يجب أن ينجح مستخدم واحد فقط");
        assertEquals(1, failCount.get(), "يجب أن يفشل المستخدم الثاني");

        // ✅ التحقق من أن هناك حجز واحد فقط
        long reservationCount = reservationRepo.count();
        assertTrue(reservationCount <= 1, "يجب أن يكون هناك حجز واحد كحد أقصى");

        // ✅ التحقق من أن الحدث ممتلئ
        Event finalEvent = eventRepo.findById(testEvent.getId()).orElseThrow();
        assertTrue(finalEvent.getReservedCount() <= finalEvent.getCapacity(), 
                   "عدد المحجوزين يجب ألا يتجاوز السعة");
    }
}
