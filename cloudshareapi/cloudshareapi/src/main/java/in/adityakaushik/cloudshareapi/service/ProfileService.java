package in.adityakaushik.cloudshareapi.service;

import com.mongodb.DuplicateKeyException;
import in.adityakaushik.cloudshareapi.document.ProfileDocument;
import in.adityakaushik.cloudshareapi.dto.ProfileDTO;
import in.adityakaushik.cloudshareapi.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;

    public ProfileDTO createProfile(ProfileDTO profileDTO) {
        if (profileRepository.existsByClerkId(profileDTO.getClerkId())) {
            return updateProfile(profileDTO);

        }
        ProfileDocument profile = ProfileDocument.builder()
                .clerkId(profileDTO.getClerkId())
                .email(profileDTO.getEmail())
                .firstName(profileDTO.getFirstName()) // Fixed: was using getPhotoUrl()
                .lastName(profileDTO.getLastName())
                .photoUrl(profileDTO.getPhotoUrl())
                .credits(5)
                .createdAt(Instant.now())
                .build();

        profile = profileRepository.save(profile);

        return ProfileDTO.builder()
                .id(profile.getId())
                .clerkId(profile.getClerkId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName()) // Fixed: was using getPhotoUrl()
                .lastName(profile.getLastName())
                .photoUrl(profile.getPhotoUrl())
                .credits(profile.getCredits())
                .createdAt(profile.getCreatedAt())
                .build();
    }

    public ProfileDTO updateProfile(ProfileDTO profileDTO) {
        Optional<ProfileDocument> existingProfileOpt = profileRepository.findByClerkId(profileDTO.getClerkId());

        if (existingProfileOpt.isPresent()) {
            ProfileDocument existingProfile = existingProfileOpt.get();
            if (profileDTO.getEmail() != null && !profileDTO.getEmail().isEmpty()) {
                existingProfile.setEmail(profileDTO.getEmail());
            }
            if (profileDTO.getPhotoUrl() != null && !profileDTO.getPhotoUrl().isEmpty()) {
                existingProfile.setPhotoUrl(profileDTO.getPhotoUrl());
            }
            profileRepository.save(existingProfile);

            return profileDTO.builder()
                    .id(existingProfile.getId())
                    .email(existingProfile.getEmail())
                    .clerkId(existingProfile.getClerkId())
                    .firstName(existingProfile.getFirstName())
                    .lastName(existingProfile.getLastName())
                    .credits(existingProfile.getCredits())
                    .createdAt(existingProfile.getCreatedAt())
                    .photoUrl(existingProfile.getPhotoUrl())
                    .build();
        }
        return null;
    }

    public boolean existsByClerkId(String clerkId) {
        return profileRepository.existsByClerkId(clerkId);

    }

    public void deleteProfile(String clerkId) {
        Optional<ProfileDocument> existingProfileOpt = profileRepository.findByClerkId(clerkId);
        if (existingProfileOpt.isPresent()) {
            profileRepository.delete(existingProfileOpt.get());
        }
    }


    public ProfileDocument getCurrentProfile() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UsernameNotFoundException("User not authenticated");
        }
        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<ProfileDocument> profileOpt = profileRepository.findByClerkId(clerkId);
        
        // Auto-create profile if it doesn't exist
        if (profileOpt.isEmpty()) {
            ProfileDocument profile = ProfileDocument.builder()
                    .clerkId(clerkId)
                    .email(clerkId + "@clerk.user") // Unique email based on clerkId
                    .firstName("User")
                    .lastName("Name")
                    .photoUrl("")
                    .credits(5) // Default credits
                    .createdAt(Instant.now())
                    .build();
            try {
                return profileRepository.save(profile);
            } catch (Exception e) {
                // If still duplicate, try to fetch existing profile
                profileOpt = profileRepository.findByClerkId(clerkId);
                if (profileOpt.isPresent()) {
                    return profileOpt.get();
                }
                throw e;
            }
        }
        
        return profileOpt.get();
    }
}