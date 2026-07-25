package com.tms.api.service;

import com.tms.api.dto.dashboard.SalesPerformanceResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalesPerformanceService {

    private final JdbcTemplate jdbcTemplate;

    public SalesPerformanceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SalesPerformanceResponse getPerformance() {
        List<SalesPerformanceResponse.SalePerformance> sales = jdbcTemplate.query(
                """
                SELECT u.user_id, u.fullname, u.username,
                       (SELECT COUNT(*) FROM so_sales_order so
                        WHERE so.staff_id = u.user_id) AS order_count,
                       (SELECT COUNT(*) FROM so_sales_order so
                        WHERE so.staff_id = u.user_id AND UPPER(so.status) = 'PAID') AS paid_order_count,
                       (SELECT COALESCE(SUM(so.amount), 0) FROM so_sales_order so
                        WHERE so.staff_id = u.user_id AND UPPER(so.status) = 'PAID') AS paid_revenue,
                       (SELECT COUNT(*) FROM sales_interactions si
                        WHERE si.staff_id = u.user_id) AS interaction_count,
                       (SELECT COUNT(*) FROM log_cdr c
                        WHERE LOWER(c.agent) IN (LOWER(u.username), LOWER(u.fullname))) AS calls_handled,
                       (SELECT AVG(pes.experience_delta)
                        FROM purchase_experience_summary pes
                        JOIN so_sales_order so ON so.so_id = pes.order_id
                        WHERE so.staff_id = u.user_id) AS average_experience_delta,
                       COALESCE((
                           SELECT COALESCE(p.category, so2.product_name)
                           FROM so_sales_order so2
                           LEFT JOIN pd_product p ON LOWER(p.name) = LOWER(so2.product_name)
                           WHERE so2.staff_id = u.user_id
                           GROUP BY COALESCE(p.category, so2.product_name)
                           ORDER BY COUNT(*) DESC
                           LIMIT 1
                       ), 'Chưa đủ dữ liệu') AS specialty
                FROM or_user u
                WHERE UPPER(u.user_type) IN ('AGENT', 'MANAGER')
                ORDER BY paid_revenue DESC, paid_order_count DESC, u.user_id
                """,
                (rs, rowNum) -> {
                    long orders = rs.getLong("order_count");
                    long paidOrders = rs.getLong("paid_order_count");
                    double revenue = rs.getDouble("paid_revenue");
                    double average = paidOrders == 0 ? 0.0 : revenue / paidOrders;
                    double conversion = orders == 0 ? 0.0 : paidOrders * 100.0 / orders;
                    double delta = rs.getDouble("average_experience_delta");
                    Double nullableDelta = rs.wasNull() ? null : round(delta, 3);
                    return new SalesPerformanceResponse.SalePerformance(
                            rs.getInt("user_id"),
                            rs.getString("fullname"),
                            rs.getString("username"),
                            rs.getString("specialty"),
                            orders,
                            paidOrders,
                            round(revenue, 2),
                            round(average, 2),
                            round(conversion, 2),
                            rs.getLong("interaction_count"),
                            rs.getLong("calls_handled"),
                            nullableDelta
                    );
                }
        );

        long totalOrders = sales.stream()
                .mapToLong(SalesPerformanceResponse.SalePerformance::orderCount)
                .sum();
        long paidOrders = sales.stream()
                .mapToLong(SalesPerformanceResponse.SalePerformance::paidOrderCount)
                .sum();
        double paidRevenue = sales.stream()
                .mapToDouble(SalesPerformanceResponse.SalePerformance::paidRevenue)
                .sum();
        double conversion = totalOrders == 0 ? 0.0 : paidOrders * 100.0 / totalOrders;

        return new SalesPerformanceResponse(
                round(paidRevenue, 2),
                paidOrders,
                totalOrders,
                round(conversion, 2),
                sales
        );
    }

    private double round(double value, int precision) {
        double factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }
}
