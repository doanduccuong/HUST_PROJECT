package com.tms.api.config;

import com.tms.entity.Customer;
import com.tms.entity.User;
import com.tms.repository.CustomerRepository;
import com.tms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final String managerPassword;

    public DemoDataInitializer(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo.manager-password:demo123}") String managerPassword) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.managerPassword = managerPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        User manager = userRepository.findByUsername("manager")
                .orElseGet(() -> userRepository.save(User.builder()
                        .username("manager")
                        .password(passwordEncoder.encode(managerPassword))
                        .fullname("Demo CRM Manager")
                        .email("manager@example.local")
                        .userType("MANAGER")
                        .orgId(1)
                        .isLocked(false)
                        .build()));

        Customer keanu = ensureCustomer(
                "Keanu Reeves (Demo)",
                "Male",
                61,
                "https://commons.wikimedia.org/wiki/Special:Redirect/file/Keanu_Reeves-2019.jpg"
        );
        Customer emma = ensureCustomer(
                "Emma Watson (Demo)",
                "Female",
                36,
                "https://commons.wikimedia.org/wiki/Special:Redirect/file/Emma_Watson_2013.jpg"
        );

        seedCustomerCommerce(keanu, manager, "DEMO-SO-001", "Arex98RM-MY", 199.0, "PAID");
        seedCustomerCommerce(keanu, manager, "DEMO-SO-002", "Cartiolite108RM-MY", 149.0, "DELIVERED");
        seedCustomerCommerce(emma, manager, "DEMO-SO-003", "Diabenol-Neuro-PE", 249.0, "PAID");
        seedCustomerCommerce(emma, manager, "DEMO-SO-004", "Skeptics-CPL-TH", 99.0, "CANCELLED");

        seedInteraction(keanu.getId(), manager.getUserId(), "DEMO-SO-001",
                "IN_STORE_CONSULTATION", "IN_PERSON", "PURCHASED",
                "Demo: tư vấn nhu cầu và chốt đơn.");
        seedInteraction(emma.getId(), manager.getUserId(), "DEMO-SO-003",
                "FOLLOW_UP", "PHONE", "SATISFIED",
                "Demo: gọi lại sau mua để ghi nhận trải nghiệm.");

        seedCameraJourney(keanu.getId(), "DEMO-SO-001", true);
        seedCameraJourney(emma.getId(), "DEMO-SO-003", false);
    }

    private Customer ensureCustomer(String name, String gender, int age, String imageUrl) {
        return customerRepository.findByName(name)
                .orElseGet(() -> customerRepository.saveAndFlush(Customer.builder()
                        .name(name)
                        .gender(gender)
                        .age(age)
                        .userImage(imageUrl)
                        .build()));
    }

    private void seedCustomerCommerce(
            Customer customer,
            User manager,
            String orderCode,
            String productName,
            double amount,
            String status) {
        jdbcTemplate.update(
                """
                INSERT INTO so_sales_order
                    (so_code, lead_name, lead_phone, product_name, amount, assigned,
                     customer_id, staff_id, quantity, currency, status, paid_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'USD', ?,
                        CASE WHEN ? = 'PAID' THEN NOW() - INTERVAL '1 day' ELSE NULL END,
                        NOW() - INTERVAL '2 days')
                ON CONFLICT (so_code)
                DO UPDATE SET customer_id = EXCLUDED.customer_id,
                              staff_id = EXCLUDED.staff_id,
                              status = EXCLUDED.status,
                              amount = EXCLUDED.amount
                """,
                orderCode,
                customer.getName(),
                "09000000" + customer.getId(),
                productName,
                amount,
                manager.getFullname(),
                customer.getId(),
                manager.getUserId(),
                status,
                status
        );
    }

    private void seedInteraction(
            Integer customerId,
            Integer staffId,
            String orderCode,
            String type,
            String channel,
            String outcome,
            String notes) {
        jdbcTemplate.update(
                """
                INSERT INTO sales_interactions
                    (customer_id, staff_id, order_id, interaction_type, channel,
                     started_at, ended_at, outcome, notes)
                SELECT ?, ?, so_id, ?, ?, NOW() - INTERVAL '3 days',
                       NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', ?, ?
                FROM so_sales_order
                WHERE so_code = ?
                  AND NOT EXISTS (
                    SELECT 1 FROM sales_interactions
                    WHERE customer_id = ? AND notes = ?
                  )
                """,
                customerId,
                staffId,
                type,
                channel,
                outcome,
                notes,
                orderCode,
                customerId,
                notes
        );
    }

    private void seedCameraJourney(Integer customerId, String orderCode, boolean positiveJourney) {
        String[] cameras = {"CAM-01", "CAM-02", "CAM-03", "CAM-04", "CAM-05", "CAM-06"};
        String[] zones = {"ENTRANCE", "WAITING", "CONSULTING", "PRODUCT", "CHECKOUT", "EXIT"};
        String[] expressions = positiveJourney
                ? new String[]{"neutral", "surprise", "neutral", "happy", "happy", "happy"}
                : new String[]{"neutral", "neutral", "fear", "neutral", "happy", "neutral"};
        String[] states = positiveJourney
                ? new String[]{"NEUTRAL", "CONFUSED", "ENGAGED", "ENGAGED", "DELIGHTED", "DELIGHTED"}
                : new String[]{"NEUTRAL", "IMPATIENT", "CONFUSED", "ENGAGED", "DELIGHTED", "NEUTRAL"};

        for (int index = 0; index < cameras.length; index++) {
            UUID sessionId = UUID.nameUUIDFromBytes(
                    ("demo-" + customerId + "-" + cameras[index]).getBytes()
            );
            String probabilityJson = "neutral".equals(expressions[index])
                    ? "{\"neutral\":0.78}"
                    : "{\"" + expressions[index] + "\":0.78,\"neutral\":0.22}";
            jdbcTemplate.update(
                    """
                    INSERT INTO experience_sessions
                        (id, customer_id, camera_id, zone, local_track_id,
                         started_at, ended_at, data_origin)
                    VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL '2 days',
                            NOW() - INTERVAL '2 days' + INTERVAL '5 minutes',
                            'SYNTHETIC_METADATA')
                    ON CONFLICT (id) DO NOTHING
                    """,
                    sessionId,
                    customerId,
                    cameras[index],
                    zones[index],
                    "track-demo-" + customerId + "-" + index
            );
            jdbcTemplate.update(
                    """
                    INSERT INTO experience_state_events
                        (session_id, customer_id, camera_id, zone, observed_at,
                         raw_expression, raw_expression_confidence,
                         experience_state, state_confidence,
                         expression_probabilities, source, model_version)
                    SELECT ?, ?, ?, ?, NOW() - INTERVAL '2 days' + (? * INTERVAL '2 minutes'),
                           ?, 0.78, ?, 0.72,
                           CAST(? AS jsonb), 'SYNTHETIC_DEMO', 'demo-sequence-v1'
                    WHERE NOT EXISTS (
                        SELECT 1 FROM experience_state_events
                        WHERE session_id = ? AND camera_id = ?
                    )
                    """,
                    sessionId,
                    customerId,
                    cameras[index],
                    zones[index],
                    index,
                    expressions[index],
                    states[index],
                    probabilityJson,
                    sessionId,
                    cameras[index]
            );
        }

        Integer orderId = jdbcTemplate.queryForObject(
                "SELECT so_id FROM so_sales_order WHERE so_code = ?",
                Integer.class,
                orderCode
        );
        String preState = positiveJourney ? "CONFUSED" : "IMPATIENT";
        String postState = positiveJourney ? "DELIGHTED" : "NEUTRAL";
        double preScore = positiveJourney ? 0.40 : 0.30;
        double postScore = positiveJourney ? 0.92 : 0.55;
        jdbcTemplate.update(
                """
                INSERT INTO purchase_experience_summary
                    (order_id, customer_id, pre_purchase_state, post_purchase_state,
                     pre_purchase_score, post_purchase_score, experience_delta,
                     confidence, evidence_count, calculated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0.82, 6, NOW())
                ON CONFLICT (order_id)
                DO UPDATE SET pre_purchase_state = EXCLUDED.pre_purchase_state,
                              post_purchase_state = EXCLUDED.post_purchase_state,
                              pre_purchase_score = EXCLUDED.pre_purchase_score,
                              post_purchase_score = EXCLUDED.post_purchase_score,
                              experience_delta = EXCLUDED.experience_delta,
                              confidence = EXCLUDED.confidence,
                              evidence_count = EXCLUDED.evidence_count,
                              calculated_at = NOW()
                """,
                orderId,
                customerId,
                preState,
                postState,
                preScore,
                postScore,
                postScore - preScore
        );
    }
}
