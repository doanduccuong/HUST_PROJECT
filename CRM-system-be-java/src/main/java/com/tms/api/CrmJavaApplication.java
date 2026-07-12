package com.tms.api;

import com.tms.entity.User;
import com.tms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"com.tms"})
@EnableJpaRepositories(basePackages = "com.tms.repository")
@EntityScan(basePackages = "com.tms.entity")
public class CrmJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrmJavaApplication.class, args);
    }

    @Bean
    public CommandLineRunner initUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Optional<User> adminOpt = userRepository.findByUsername("admin");
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                admin.setPassword(passwordEncoder.encode("admin"));
                userRepository.save(admin);
                System.out.println(">>> Re-encoded admin password successfully using Spring BCrypt!");
            }
            Optional<User> agentOpt = userRepository.findByUsername("agent");
            if (agentOpt.isPresent()) {
                User agent = agentOpt.get();
                agent.setPassword(passwordEncoder.encode("admin"));
                userRepository.save(agent);
                System.out.println(">>> Re-encoded agent password successfully using Spring BCrypt!");
            }
        };
    }
}
