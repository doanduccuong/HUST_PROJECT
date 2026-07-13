package com.tms.api.config;

import com.tms.entity.PDProduct;
import com.tms.repository.PDProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductDataInitializer implements CommandLineRunner {

    private final PDProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            List<PDProduct> products = new ArrayList<>();
            
            products.add(PDProduct.builder()
                    .prodId(953)
                    .orgId(2)
                    .code("AREX98RM-MY")
                    .category("Male Enhancement")
                    .name("Arex98RM-MY")
                    .price("149,199,249")
                    .dscr("Male Enhancement (capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(952)
                    .orgId(2)
                    .code("HENOX108RM-MY")
                    .category("Hemorrhoids")
                    .name("Henoxol108RM-MY")
                    .price("149,169")
                    .dscr("Hemorrhoids (capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(951)
                    .orgId(2)
                    .code("CARTI108RM-MY")
                    .category("Cholesterol")
                    .name("Cartiolite108RM-MY")
                    .price("149,199")
                    .dscr("Cholesterol (Capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(950)
                    .orgId(2)
                    .code("VARICAP108RM-MY")
                    .category("Heart Heath")
                    .name("Varicap108RM-MY")
                    .price("149")
                    .dscr("Heart Heath (capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(949)
                    .orgId(2)
                    .code("DIABENOL-NEURO-PE")
                    .category("Diabetes")
                    .name("Diabenol-Neuro-PE")
                    .price("149")
                    .dscr("Diabetes (capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(948)
                    .orgId(2)
                    .code("PROSTINOL-PROSTATE-PE")
                    .category("Prostate")
                    .name("Prostinol-Prostate-PE")
                    .price("149")
                    .dscr("Prostate (Capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(947)
                    .orgId(2)
                    .code("PROSTINOL-POTENCY-PE")
                    .category("Prostate")
                    .name("Prostinol-Potency-PE")
                    .price("149")
                    .dscr("Prostate (Capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(946)
                    .orgId(2)
                    .code("GAMATMAS-ID")
                    .category("Joint")
                    .name("GamatMas-ID")
                    .price("390000")
                    .dscr("Joint (capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(945)
                    .orgId(2)
                    .code("SKEPTICS-CPL-TH")
                    .category("Slim")
                    .name("Skeptics-CPL-TH")
                    .price("990")
                    .dscr("Slim (Capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            products.add(PDProduct.builder()
                    .prodId(944)
                    .orgId(2)
                    .code("UTORINIC-ENG-IN")
                    .category("Prostate")
                    .name("Utorinic-ENG-IN")
                    .price("2490")
                    .dscr("Prostate (Capsule)")
                    .status(1)
                    .country("VN")
                    .build());

            productRepository.saveAll(products);
            System.out.println(">>> Seeded 10 products from products.xlsx successfully!");
        }
    }
}
