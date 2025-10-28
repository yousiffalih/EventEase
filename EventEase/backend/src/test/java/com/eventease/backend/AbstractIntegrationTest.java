package com.eventease.backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;

/**
 * 🐳 Base class للاختبارات - يشغّل MongoDB تلقائياً في Docker
 * 
 * جميع الاختبارات يجب أن ترث من هذا الكلاس
 * 
 * Uses a singleton MongoDB container shared across all tests to avoid port conflicts
 */
@SpringBootTest
public abstract class AbstractIntegrationTest {

    // Singleton MongoDB container shared across all test classes
    private static final MongoDBContainer mongoDBContainer;

    static {
        mongoDBContainer = new MongoDBContainer("mongo:8.0")
                .withReuse(true);
        mongoDBContainer.start();
    }

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }
}
