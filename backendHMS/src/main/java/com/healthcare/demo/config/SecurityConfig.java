package com.healthcare.demo.config;

import com.healthcare.demo.utils.JwtUtil;
import com.healthcare.demo.config.JwtAuthenticationFilter;
import com.healthcare.demo.config.JwtAuthorizationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            if ("admin".equals(username)) {
                return new User("admin", passwordEncoder().encode("admin"), true, true, true, true, new ArrayList<>());
            }
            throw new UsernameNotFoundException("User not found");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth endpoints
                        .requestMatchers("/auth/login/**", "/auth/register/**", "/auth/refresh").permitAll()

                        // Admin seed endpoint - MUST be public for initial setup
                        .requestMatchers(HttpMethod.POST, "/admin/seed").permitAll()

                        // Patient endpoints
                        .requestMatchers(HttpMethod.POST, "/patient").permitAll()
                        .requestMatchers(HttpMethod.GET, "/doctors/**", "/patient/doctors/**").permitAll()

                        // Doctor endpoints
                        .requestMatchers(HttpMethod.GET, "/doctors/*/profile").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/doctors/*/profile").authenticated()

                        // Appointment endpoints
                        .requestMatchers(HttpMethod.POST, "/appointments/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/appointments/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/appointments/**").permitAll()

                        // Prescription endpoints
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/**").authenticated()

                        // Admin endpoints - require authentication (except seed)
                        .requestMatchers("/admin/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtAuthenticationFilter(authenticationManager, jwtUtil), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new JwtAuthorizationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:5173");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}