package com.hospital.management.service;

import com.hospital.management.dto.AuthResponseDTO;
import com.hospital.management.dto.LoginRequestDTO;
import com.hospital.management.entity.User;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final UserDetailsService userDetailsService;
	private final JwtService jwtService;
	private final UserRepository userRepository;

	public AuthService(AuthenticationManager authenticationManager, UserDetailsService userDetailsService,
			JwtService jwtService, UserRepository userRepository) {
		this.authenticationManager = authenticationManager;
		this.userDetailsService = userDetailsService;
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	public AuthResponseDTO login(LoginRequestDTO request) {
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

		UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
		User user = userRepository.findByUsername(request.getUsername())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		String jwtToken = jwtService.generateToken(userDetails, user.getRole().name());
		return new AuthResponseDTO(jwtToken, user.getUsername(), user.getRole());
	}
}