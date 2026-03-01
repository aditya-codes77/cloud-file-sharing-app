package in.adityakaushik.cloudshareapi.service;

import in.adityakaushik.cloudshareapi.document.FileMetadataDocument;
import in.adityakaushik.cloudshareapi.document.ProfileDocument;
import in.adityakaushik.cloudshareapi.dto.FileMetadataDTO;
import in.adityakaushik.cloudshareapi.repository.FileMetaDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetaDataRepository fileMetadataRepository;

    public List<FileMetadataDTO> uploadFiles(MultipartFile[] files) {
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            List<FileMetadataDocument> savedFiles = new ArrayList<>();

            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            for (MultipartFile file : files) {
                String cleaned = StringUtils.cleanPath(file.getOriginalFilename());
                String fileName = UUID.randomUUID().toString() + "_" + cleaned;
                Path targetLocation = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                FileMetadataDocument fileMetadata = FileMetadataDocument.builder()
                        .fileLocation(targetLocation.toString())
                        .name(file.getOriginalFilename())
                        .size(file.getSize())
                        .type(file.getContentType())
                        .clerkId(currentProfile.getClerkId())
                        .isPublic(false)
                        .uploadedAt(LocalDateTime.now())
                        .build();

                FileMetadataDocument saved = fileMetadataRepository.save(fileMetadata);
                savedFiles.add(saved);
            }

            return savedFiles.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error uploading files: " + e.getMessage(), e);
        }
    }

    public List<FileMetadataDTO> getUserFiles() {
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            String clerkId = currentProfile.getClerkId();
            System.out.println("DEBUG: Getting files for clerkId: " + clerkId);
            
            List<FileMetadataDocument> userFiles = fileMetadataRepository.findByClerkId(clerkId);
            System.out.println("DEBUG: Found " + userFiles.size() + " files for this user");

            return userFiles.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("DEBUG ERROR in getUserFiles: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching user files: " + e.getMessage(), e);
        }
    }

    public List<FileMetadataDTO> getAllFiles() {
        try {
            List<FileMetadataDocument> allFiles = fileMetadataRepository.findAll();

            return allFiles.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching all files: " + e.getMessage(), e);
        }
    }


    public FileMetadataDTO getPublicFile(String fileId) {
        try {
            Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
            
            if (fileOpt.isEmpty()) {
                throw new RuntimeException("File not found");
            }
            
            FileMetadataDocument file = fileOpt.get();
            
            if (!file.isPublic()) {
                throw new RuntimeException("File is not public");
            }
            
            return mapToDTO(file);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching public file: " + e.getMessage(), e);
        }
    }

    public boolean deleteUserFile(String fileId) {
        try {
            Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
            
            if (fileOpt.isEmpty()) {
                throw new RuntimeException("File not found");
            }
            
            FileMetadataDocument file = fileOpt.get();
            
            // Check ownership if file has clerkId
            if (file.getClerkId() != null) {
                ProfileDocument currentProfile = profileService.getCurrentProfile();
                if (!file.getClerkId().equals(currentProfile.getClerkId())) {
                    throw new RuntimeException("Access denied");
                }
            }
            
            // Delete physical file
            try {
                Path filePath = Paths.get(file.getFileLocation());
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                System.out.println("Warning: Could not delete physical file: " + e.getMessage());
            }
            
            // Delete database record
            fileMetadataRepository.delete(file);
            
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file: " + e.getMessage(), e);
        }
    }

    public FileMetadataDocument getFileForDownload(String fileId) {
        try {
            Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
            
            if (fileOpt.isEmpty()) {
                throw new RuntimeException("File not found");
            }
            
            FileMetadataDocument file = fileOpt.get();
            
            // If file is public, allow download without auth check
            if (file.isPublic()) {
                return file;
            }
            
            // For private files, check ownership
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            if (file.getClerkId() == null || !file.getClerkId().equals(currentProfile.getClerkId())) {
                throw new RuntimeException("File not found or access denied");
            }
            
            return file;
        } catch (Exception e) {
            throw new RuntimeException("Error accessing file: " + e.getMessage(), e);
        }
    }

    public FileMetadataDTO toggleFileVisibility(String fileId) {
        try {
            Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
            
            if (fileOpt.isEmpty()) {
                throw new RuntimeException("File not found");
            }
            
            FileMetadataDocument file = fileOpt.get();
            
            // Check ownership if file has clerkId
            if (file.getClerkId() != null) {
                ProfileDocument currentProfile = profileService.getCurrentProfile();
                if (!file.getClerkId().equals(currentProfile.getClerkId())) {
                    throw new RuntimeException("Access denied");
                }
            }
            
            // Toggle the public status
            file.setPublic(!file.isPublic());
            
            // Save the updated file
            FileMetadataDocument updatedFile = fileMetadataRepository.save(file);
            
            return mapToDTO(updatedFile);
        } catch (Exception e) {
            throw new RuntimeException("Error toggling file visibility: " + e.getMessage(), e);
        }
    }

    private FileMetadataDTO mapToDTO(FileMetadataDocument fileMetadataDocument) {
        return FileMetadataDTO.builder()
                .id(fileMetadataDocument.getId())
                .fileLocation(fileMetadataDocument.getFileLocation())
                .name(fileMetadataDocument.getName())
                .size(fileMetadataDocument.getSize())
                .type(fileMetadataDocument.getType())
                .clerkId(fileMetadataDocument.getClerkId())
                .isPublic(fileMetadataDocument.isPublic())   // boolean getter is isPublic()
                .uploadedAt(fileMetadataDocument.getUploadedAt())
                .build();
    }
}
