package in.adityakaushik.cloudshareapi.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import in.adityakaushik.cloudshareapi.document.UserCredits;
import in.adityakaushik.cloudshareapi.document.FileMetadataDocument;
import in.adityakaushik.cloudshareapi.dto.FileMetadataDTO;
import in.adityakaushik.cloudshareapi.service.FileMetadataService;
import in.adityakaushik.cloudshareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "https://cloud-file-sharing-app.vercel.app"})
@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {
    private final FileMetadataService fileMetadataService;
    private final UserCreditsService userCreditsService;

    // 👇 NEW METHOD GOES HERE
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(@RequestPart("files") MultipartFile[] files) {
        try {
            List<FileMetadataDTO> fileList = fileMetadataService.uploadFiles(files);

            return ResponseEntity.ok(Map.of(
                    "message", "FileMetadataService works!",
                    "files", fileList,
                    "fileCount", files.length
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "FileMetadataService failed",
                    "message", e.getMessage(),
                    "cause", e.getClass().getSimpleName()
            ));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("File controller is working!");
    }

    @GetMapping("/my-files")
    public ResponseEntity<?> getUserFiles() {
        try {
            List<FileMetadataDTO> userFiles = fileMetadataService.getUserFiles(); // Show only user's files
            System.out.println("DEBUG: Returning " + userFiles.size() + " files for current user");

            return ResponseEntity.ok(Map.of(
                    "files", userFiles,
                    "totalFiles", userFiles.size()
            ));
        } catch (Exception e) {
            System.out.println("DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch files",
                    "message", e.getMessage()
            ));
        }
    }


    @GetMapping("/public/{fileId}")
    public ResponseEntity<?> getPublicFile(@PathVariable String fileId) {
        try {
            FileMetadataDTO publicFile = fileMetadataService.getPublicFile(fileId);
            return ResponseEntity.ok(publicFile);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or not public",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/public/{fileId}/download")
    public ResponseEntity<?> downloadPublicFile(@PathVariable String fileId) {
        try {
            FileMetadataDocument file = fileMetadataService.getPublicFileForDownload(fileId);
            Path filePath = Paths.get(file.getFileLocation());
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(404).body(Map.of("error", "Physical file not found"));
            }
            Resource resource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, file.getType())
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.getSize()))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or not public",
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId) {
        try {
            boolean deleted = fileMetadataService.deleteUserFile(fileId);
            
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                    "message", "File deleted successfully",
                    "fileId", fileId
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete file"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or access denied",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String fileId) {
        try {
             FileMetadataDocument file = fileMetadataService.getFileForDownload(fileId);
            
            Path filePath = Paths.get(file.getFileLocation());
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Physical file not found"
                ));
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, file.getType())
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.getSize()))
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or access denied",
                "message", e.getMessage()
            ));
        }
    }

    @PatchMapping("/{fileId}/toggle")
    public ResponseEntity<?> toggleFileVisibility(@PathVariable String fileId) {
        try {
            FileMetadataDTO updatedFile = fileMetadataService.toggleFileVisibility(fileId);
            
            return ResponseEntity.ok(Map.of(
                "message", "File visibility toggled successfully",
                "file", updatedFile,
                "isPublic", updatedFile.isPublic()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or access denied",
                "message", e.getMessage()
            ));
        }
    }
}

