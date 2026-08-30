package com.hospital.management.dto;

import com.hospital.management.enums.Role;

public class AuthResponseDTO {
	private String token;
	private String username;
	private Role role;
	private String tokenType = "Bearer";

	public AuthResponseDTO(String token, String username, Role role) {
		this.token = token;
		this.username = username;
		this.role = role;
	}

	public String getToken() {
		return token;
	}

	public String getUsername() {
		return username;
	}

	public Role getRole() {
		return role;
	}

	public String getTokenType() {
		return tokenType;
	}
}