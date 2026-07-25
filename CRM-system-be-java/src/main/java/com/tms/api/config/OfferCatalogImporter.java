package com.tms.api.config;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "app.offers.import-enabled", havingValue = "true")
public class OfferCatalogImporter implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final Path workbookPath;

    public OfferCatalogImporter(
            JdbcTemplate jdbcTemplate,
            @Value("${app.offers.xlsx-path:../products.xlsx}") String workbookPath) {
        this.jdbcTemplate = jdbcTemplate;
        this.workbookPath = Path.of(workbookPath).toAbsolutePath().normalize();
    }

    @Override
    public void run(String... args) throws Exception {
        if (!Files.isRegularFile(workbookPath)) {
            throw new IllegalStateException("Offer workbook not found: " + workbookPath);
        }

        List<OfferRow> offers;
        try (InputStream input = Files.newInputStream(workbookPath);
             Workbook workbook = WorkbookFactory.create(input)) {
            offers = readOffers(workbook.getSheetAt(0));
        }
        upsert(offers);
        System.out.printf(">>> Imported %d offers from %s%n", offers.size(), workbookPath);
    }

    private List<OfferRow> readOffers(Sheet sheet) {
        DataFormatter formatter = new DataFormatter();
        Row header = sheet.getRow(sheet.getFirstRowNum());
        Map<String, Integer> columns = new HashMap<>();
        for (int index = 0; index < 34; index++) {
            String name = formatter.formatCellValue(header.getCell(index)).trim();
            if (!name.isBlank()) {
                columns.put(name, index);
            }
        }

        List<OfferRow> rows = new ArrayList<>();
        for (int rowIndex = header.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null || text(row, columns, "ID", formatter).isBlank()) {
                continue;
            }
            rows.add(new OfferRow(
                    integer(row, columns, "ID", formatter),
                    text(row, columns, "Offer", formatter),
                    text(row, columns, "Status", formatter),
                    nullableInteger(row, columns, "Advertiser ID", formatter),
                    text(row, columns, "Advertiser", formatter),
                    text(row, columns, "Description", formatter),
                    text(row, columns, "Internal Information", formatter),
                    text(row, columns, "Landing Page", formatter),
                    text(row, columns, "Landing Page Preview", formatter),
                    text(row, columns, "Categories", formatter),
                    text(row, columns, "Tags", formatter),
                    text(row, columns, "Traffic Types", formatter),
                    text(row, columns, "Currency", formatter),
                    text(row, columns, "Expiration Date", formatter),
                    text(row, columns, "Updated", formatter),
                    text(row, columns, "Created", formatter),
                    nullableInteger(row, columns, "Goal 1 ID", formatter),
                    text(row, columns, "Goal 1", formatter),
                    text(row, columns, "Goal Type 1", formatter),
                    nullableDouble(row, columns, "Revenue 1", formatter),
                    nullableDouble(row, columns, "Payout 1", formatter),
                    text(row, columns, "Goal Status 1", formatter),
                    text(row, columns, "Targeting", formatter),
                    text(row, columns, "External ID", formatter)
            ));
        }
        return rows;
    }

    private void upsert(List<OfferRow> offers) {
        String sql = """
                INSERT INTO offers
                    (offer_id, offer_name, status, advertiser_id, advertiser_name,
                     description, internal_information, landing_page, landing_page_preview,
                     categories, tags, traffic_types, currency, expiration_date,
                     source_updated_at, source_created_at, goal_1_id, goal_1_name,
                     goal_type_1, goal_revenue_1, goal_payout_1, goal_status_1,
                     targeting, external_id, imported_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON CONFLICT (offer_id)
                DO UPDATE SET offer_name = EXCLUDED.offer_name,
                              status = EXCLUDED.status,
                              advertiser_id = EXCLUDED.advertiser_id,
                              advertiser_name = EXCLUDED.advertiser_name,
                              description = EXCLUDED.description,
                              internal_information = EXCLUDED.internal_information,
                              landing_page = EXCLUDED.landing_page,
                              landing_page_preview = EXCLUDED.landing_page_preview,
                              categories = EXCLUDED.categories,
                              tags = EXCLUDED.tags,
                              traffic_types = EXCLUDED.traffic_types,
                              currency = EXCLUDED.currency,
                              expiration_date = EXCLUDED.expiration_date,
                              source_updated_at = EXCLUDED.source_updated_at,
                              source_created_at = EXCLUDED.source_created_at,
                              goal_1_id = EXCLUDED.goal_1_id,
                              goal_1_name = EXCLUDED.goal_1_name,
                              goal_type_1 = EXCLUDED.goal_type_1,
                              goal_revenue_1 = EXCLUDED.goal_revenue_1,
                              goal_payout_1 = EXCLUDED.goal_payout_1,
                              goal_status_1 = EXCLUDED.goal_status_1,
                              targeting = EXCLUDED.targeting,
                              external_id = EXCLUDED.external_id,
                              imported_at = NOW()
                """;
        jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement statement, int index) throws SQLException {
                OfferRow offer = offers.get(index);
                statement.setInt(1, offer.id());
                statement.setString(2, offer.name());
                statement.setString(3, offer.status());
                setNullableInteger(statement, 4, offer.advertiserId());
                statement.setString(5, offer.advertiser());
                statement.setString(6, offer.description());
                statement.setString(7, offer.internalInformation());
                statement.setString(8, offer.landingPage());
                statement.setString(9, offer.landingPagePreview());
                statement.setString(10, offer.categories());
                statement.setString(11, offer.tags());
                statement.setString(12, offer.trafficTypes());
                statement.setString(13, offer.currency());
                statement.setString(14, offer.expirationDate());
                statement.setString(15, offer.updated());
                statement.setString(16, offer.created());
                setNullableInteger(statement, 17, offer.goalId());
                statement.setString(18, offer.goalName());
                statement.setString(19, offer.goalType());
                setNullableDouble(statement, 20, offer.goalRevenue());
                setNullableDouble(statement, 21, offer.goalPayout());
                statement.setString(22, offer.goalStatus());
                statement.setString(23, offer.targeting());
                statement.setString(24, offer.externalId());
            }

            @Override
            public int getBatchSize() {
                return offers.size();
            }
        });
    }

    private String text(Row row, Map<String, Integer> columns, String name, DataFormatter formatter) {
        Integer index = columns.get(name);
        return index == null ? "" : formatter.formatCellValue(row.getCell(index)).trim();
    }

    private int integer(Row row, Map<String, Integer> columns, String name, DataFormatter formatter) {
        return Integer.parseInt(text(row, columns, name, formatter).replace(".0", ""));
    }

    private Integer nullableInteger(
            Row row, Map<String, Integer> columns, String name, DataFormatter formatter) {
        String value = text(row, columns, name, formatter);
        return value.isBlank() ? null : Integer.parseInt(value.replace(".0", ""));
    }

    private Double nullableDouble(
            Row row, Map<String, Integer> columns, String name, DataFormatter formatter) {
        String value = text(row, columns, name, formatter).replace(",", "");
        return value.isBlank() ? null : Double.parseDouble(value);
    }

    private void setNullableInteger(PreparedStatement statement, int index, Integer value)
            throws SQLException {
        if (value == null) statement.setNull(index, Types.INTEGER);
        else statement.setInt(index, value);
    }

    private void setNullableDouble(PreparedStatement statement, int index, Double value)
            throws SQLException {
        if (value == null) statement.setNull(index, Types.NUMERIC);
        else statement.setDouble(index, value);
    }

    private record OfferRow(
            int id, String name, String status, Integer advertiserId, String advertiser,
            String description, String internalInformation, String landingPage,
            String landingPagePreview, String categories, String tags, String trafficTypes,
            String currency, String expirationDate, String updated, String created,
            Integer goalId, String goalName, String goalType, Double goalRevenue,
            Double goalPayout, String goalStatus, String targeting, String externalId
    ) {}
}
