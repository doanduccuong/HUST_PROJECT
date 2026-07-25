package com.tms.api.service;

import com.tms.api.dto.face.FaceAnalysisResponse;
import com.tms.api.dto.face.FaceEnrollmentResponse;
import com.tms.entity.Customer;
import com.tms.repository.CustomerRepository;
import com.tms.repository.FaceVectorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerEnrollmentService {

    private final PythonFaceAnalysisClient analysisClient;
    private final CustomerRepository customerRepository;
    private final FaceVectorRepository vectorRepository;

    public CustomerEnrollmentService(
            PythonFaceAnalysisClient analysisClient,
            CustomerRepository customerRepository,
            FaceVectorRepository vectorRepository) {
        this.analysisClient = analysisClient;
        this.customerRepository = customerRepository;
        this.vectorRepository = vectorRepository;
    }

    @Transactional
    public FaceEnrollmentResponse enroll(
            MultipartFile file,
            String name,
            String userImage) {
        String cleanName = name == null ? "" : name.trim();
        if (cleanName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name is required");
        }

        FaceAnalysisResponse analysis = analysisClient.analyze(file);
        if (!analysis.primaryFace().quality().accepted()) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Face image quality rejected: " +
                            String.join(", ", analysis.primaryFace().quality().reasons())
            );
        }

        Customer customer = customerRepository.findByName(cleanName)
                .orElseGet(() -> Customer.builder().name(cleanName).build());
        if (userImage != null && !userImage.isBlank()) {
            customer.setUserImage(userImage);
        }
        customer = customerRepository.saveAndFlush(customer);
        vectorRepository.upsertEmbeddings(customer.getId(), analysis);

        return new FaceEnrollmentResponse(
                "success",
                customer.getId(),
                customer.getName(),
                analysis.modelVersion(),
                analysis.primaryFace().quality().score(),
                "Đã đăng ký khuôn mặt và lưu đủ 3 embedding tại Java CRM"
        );
    }
}
