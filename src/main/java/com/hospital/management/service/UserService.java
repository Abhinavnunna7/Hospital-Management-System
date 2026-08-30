package com.hospital.management.service;

import com.hospital.management.dto.UserDTO;
import com.hospital.management.entity.User;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public UserDTO registerUser(UserDTO dto) {
		if (userRepository.existsByUsername(dto.getUsername())) {
			throw new IllegalStateException("Username " + dto.getUsername() + " already exists.");
		}
		if (userRepository.existsByEmail(dto.getEmail())) {
			throw new IllegalStateException("Email " + dto.getEmail() + " already exists.");
		}

		User user = new User();
		user.setUsername(dto.getUsername());
		user.setPassword(passwordEncoder.encode(dto.getPassword()));
		user.setEmail(dto.getEmail());
		user.setRole(dto.getRole());

		User saved = userRepository.save(user);
		dto.setId(saved.getId());
		dto.setPassword(null);
		return dto;
	}

	public UserDTO getUserById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
		return mapToDTO(user);
	}

	public List<UserDTO> getAllUsers() {
		return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
	}

	private UserDTO mapToDTO(User user) {
		UserDTO dto = new UserDTO();
		dto.setId(user.getId());
		dto.setUsername(user.getUsername());
		dto.setEmail(user.getEmail());
		dto.setRole(user.getRole());
		return dto;
	}
}