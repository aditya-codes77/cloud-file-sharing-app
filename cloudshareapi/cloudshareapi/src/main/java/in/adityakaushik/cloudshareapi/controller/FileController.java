package in.adityakaushik.cloudshareapi.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import in.adityakaushik.cloudshareapi.document.FileMetadataDocument;
import in.adityakaushik.cloudshareapi.dto.FileMetadataDTO;
import in.adityakaushik.cloudshareapi.service.FileMetadataService;
import in.adityakaushik.cloudshareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:5173", "https://cloud-file-sharing-app.vercel.app"})
@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {
    private final FileMetadataService fileMetadataService;
    private final UserCreditsService userCreditsService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFiles(@RequestPart("files") MultipartFile[] files) {
        try {
            List<FileMetadataDTO> fileList = fileMetadataService.uploadFiles(files);
            return ResponseEntity.ok(Map.of(
                    "message", "Files uploaded successfully!",
                    "files", fileList,
                    "fileCount", files.length
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Upload failed",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/my-files")
    public ResponseEntity<?> getUserFiles() {
        try {
            List<FileMetadataDTO> userFiles = fileMetadataService.getUserFiles();
            return ResponseEntity.ok(Map.of(
                    "files", userFiles,
                    "totalFiles", userFiles.size()
            ));
        } catch (Exception e) {
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
            return streamFile(file);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or not public",
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable String fileId) {
        try {
            FileMetadataDocument file = fileMetadataService.getFileForDownload(fileId);
            return streamFile(file);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of(
                "error", "File not found or access denied",
                "message", e.getMessage()
            ));
        }
    }

    private ResponseEntity<?> streamFile(FileMetadataDocument file) {
        String location = file.getFileLocation();
        if (location == null || !location.startsWith("http")) {
            return ResponseEntity.status(410).body(Map.of(
                "error", "File no longer available",
                "message", "This file was stored on the old server and is no longer accessible. Please re-upload."
            ));
        }
        try {
            // Generate a signed Cloudinary URL to avoid 401 on raw/non-image delivery
            String fetchUrl = location;
            if (file.getCloudinaryPublicId() != null) {
                fetchUrl = fileMetadataService.buildSignedUrl(file);
            }
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(fetchUrl).openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
            int status = conn.getResponseCode();
            if (status >= 400) {
                return ResponseEntity.status(502).body(Map.of(
                    "error", "Could not fetch file from storage",
                    "message", "Storage returned " + status + ". Please re-upload the file."
                ));
            }
            byte[] bytes = conn.getInputStream().readAllBytes();
            String contentType = conn.getContentType() != null ? conn.getContentType() : "application/octet-stream";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                "error", "Failed to fetch file from storage",
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/cleanup-legacy")
    public ResponseEntity<?> cleanupLegacyFiles() {
        try {
            int deleted = fileMetadataService.deleteLegacyFiles();
            return ResponseEntity.ok(Map.of(
                "message", "Cleanup complete",
                "deletedCount", deleted
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId) {
        try {
            boolean deleted = fileMetadataService.deleteUserFile(fileId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully", "fileId", fileId));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to delete file"));
            }
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
