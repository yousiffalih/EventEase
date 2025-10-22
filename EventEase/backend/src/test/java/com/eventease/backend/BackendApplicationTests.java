package com.eventease.backend;

import org.junit.jupiter.api.Test;

/**
 * 🧪 اختبار تحميل Spring Context
 * يستخدم MongoDB من Testcontainers (Docker)
 */
class BackendApplicationTests extends AbstractIntegrationTest {

	@Test
	void contextLoads() {
		// ✅ هذا الاختبار يتحقق من أن Spring Context يتم تحميله بنجاح
		// MongoDB يعمل تلقائياً من Docker عبر Testcontainers
	}

}
