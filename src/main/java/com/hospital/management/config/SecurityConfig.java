package com.hospital.management.config;

import com.hospital.management.security.CustomUserDetailsService;
import com.hospital.management.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/styles.css", "/app.js", "/favicon.ico").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/infrastructure/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/infrastructure/**").hasAnyRole("ADMIN", "NURSE")
                .requestMatchers(HttpMethod.GET, "/api/infrastructure/**").hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "ACCOUNTANT")

                .requestMatchers(HttpMethod.POST, "/api/admissions/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                .requestMatchers(HttpMethod.PATCH, "/api/admissions/*/discharge").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                .requestMatchers(HttpMethod.GET, "/api/admissions/**").hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "ACCOUNTANT")

                .requestMatchers(HttpMethod.POST, "/api/mar/prescriptions/**").hasAnyRole("ADMIN", "DOCTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/mar/orders/*/administer").hasAnyRole("ADMIN", "NURSE")
                .requestMatchers(HttpMethod.GET, "/api/mar/**").hasAnyRole("ADMIN", "DOCTOR", "NURSE", "ACCOUNTANT")

                .requestMatchers(HttpMethod.POST, "/api/lab/tests").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/lab/orders").hasAnyRole("ADMIN", "DOCTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/lab/orders/*/results").hasAnyRole("ADMIN", "LAB_TECHNICIAN")
                .requestMatchers(HttpMethod.GET, "/api/lab/**").hasAnyRole("ADMIN", "DOCTOR", "LAB_TECHNICIAN", "ACCOUNTANT")

                .requestMatchers(HttpMethod.POST, "/api/ot/rooms").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/ot/schedules").hasAnyRole("ADMIN", "DOCTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/ot/schedules/**").hasAnyRole("ADMIN", "DOCTOR")
                .requestMatchers(HttpMethod.GET, "/api/ot/**").hasAnyRole("ADMIN", "DOCTOR", "NURSE")

                .requestMatchers("/api/billing/**").hasAnyRole("ADMIN", "ACCOUNTANT")

                .anyRequest().authenticated()
            )
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}