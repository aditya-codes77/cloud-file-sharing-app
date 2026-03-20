package in.adityakaushik.cloudshareapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import in.adityakaushik.cloudshareapi.document.FileMetadataDocument;
import in.adityakaushik.cloudshareapi.document.ProfileDocument;
import in.adityakaushik.cloudshareapi.dto.FileMetadataDTO;
import in.adityakaushik.cloudshareapi.repository.FileMetaDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetaDataRepository fileMetadataRepository;
    private final Cloudinary cloudinary;

    public List<FileMetadataDTO> uploadFiles(MultipartFile[] files) {
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            List<FileMetadataDocument> savedFiles = new ArrayList<>();

            for (MultipartFile file : files) {
                System.out.println("DEBUG upload: uploading " + file.getOriginalFilename() + " size=" + file.getSize());
                Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                        "resource_type", "auto",
                        "original_filename", file.getOriginalFilename(),
                        "use_filename", true
                    )
                );
                System.out.println("DEBUG upload result: " + uploadResult);

                String cloudinaryUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                if (cloudinaryUrl == null) {
                    throw new RuntimeException("Cloudinary upload failed - no URL returned. Result: " + uploadResult);
                }

                FileMetadataDocument fileMetadata = FileMetadataDocument.builder()
                        .fileLocation(cloudinaryUrl)
                        .cloudinaryPublicId(publicId)
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


    public int deleteLegacyFiles() {
        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<FileMetadataDocument> userFiles = fileMetadataRepository.findByClerkId(clerkId);
        int count = 0;
        for (FileMetadataDocument f : userFiles) {
            String loc = f.getFileLocation();
            boolean isLegacy = (loc == null || !loc.startsWith("http"));
            boolean isDeadCloudinary = false;
            if (!isLegacy) {
                try {
                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(loc).openConnection();
                    conn.setRequestMethod("HEAD");
                    conn.setConnectTimeout(5000);
                    conn.setReadTimeout(5000);
                    isDeadCloudinary = conn.getResponseCode() >= 400;
                } catch (Exception ignored) {
                    isDeadCloudinary = true;
                }
            }
            if (isLegacy || isDeadCloudinary) {
                fileMetadataRepository.delete(f);
                count++;
            }
        }
        return count;
    }

    public String buildSignedUrl(FileMetadataDocument file) {
        String location = file.getFileLocation();
        if (location == null || !location.startsWith("http")) {
            return null;
        }
        if (file.getCloudinaryPublicId() == null) {
            return location;
        }
        try {
            // Determine resource type from MIME type
            String resourceType = "image";
            String mimeType = file.getType();
            if (mimeType != null) {
                if (mimeType.startsWith("video/")) resourceType = "video";
                else if (!mimeType.startsWith("image/")) resourceType = "raw";
            }
            return cloudinary.url()
                .resourceType(resourceType)
                .type("upload")
                .signed(true)
                .transformation(new com.cloudinary.Transformation().flags("attachment"))
                .generate(file.getCloudinaryPublicId());
        } catch (Exception e) {
            System.out.println("DEBUG buildSignedUrl error: " + e.getMessage());
            return location;
        }
    }

    public String getSignedDownloadUrl(FileMetadataDocument file) {
        try {
            if (file.getCloudinaryPublicId() != null) {
                return cloudinary.url()
                    .resourceType("auto")
                    .type("upload")
                    .signed(true)
                    .transformation(new com.cloudinary.Transformation().flags("attachment"))
                    .generate(file.getCloudinaryPublicId());
            }
            return file.getFileLocation();
        } catch (Exception e) {
            return file.getFileLocation();
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

    public FileMetadataDocument getPublicFileForDownload(String fileId) {
        Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
        if (fileOpt.isEmpty()) throw new RuntimeException("File not found");
        FileMetadataDocument file = fileOpt.get();
        if (!file.isPublic()) throw new RuntimeException("File is not public");
        return file;
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
        Optional<FileMetadataDocument> fileOpt = fileMetadataRepository.findById(fileId);
        if (fileOpt.isEmpty()) throw new RuntimeException("File not found");

        FileMetadataDocument file = fileOpt.get();
        System.out.println("DEBUG getFileForDownload - fileId: " + fileId);
        System.out.println("DEBUG getFileForDownload - file.clerkId: " + file.getClerkId());
        System.out.println("DEBUG getFileForDownload - file.isPublic: " + file.isPublic());

        // Public files — no auth check needed
        if (file.isPublic()) return file;

        // Private files — check ownership
        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG getFileForDownload - JWT clerkId: " + clerkId);
        
        if (file.getClerkId() == null || file.getClerkId().equals(clerkId)) {
            return file;
        }

        System.out.println("DEBUG getFileForDownload - ACCESS DENIED: file.clerkId=" + file.getClerkId() + " != JWT clerkId=" + clerkId);
        throw new RuntimeException("File not found or access denied");
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
