package com.hospital.management.controller;

import com.hospital.management.dto.AuthResponseDTO;
import com.hospital.management.dto.LoginRequestDTO;
import com.hospital.management.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
		return ResponseEntity.ok(authService.login(request));
	}
}