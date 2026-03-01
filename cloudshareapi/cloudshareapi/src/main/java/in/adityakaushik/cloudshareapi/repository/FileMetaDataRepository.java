package in.adityakaushik.cloudshareapi.repository;

import in.adityakaushik.cloudshareapi.document.FileMetadataDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface FileMetaDataRepository extends MongoRepository<FileMetadataDocument, String> {
    List<FileMetadataDocument> findByClerkId(String clerkId);

    long countByClerkId(String clerkId);
    
    Optional<FileMetadataDocument> findByIdAndClerkId(String id, String clerkId);
}
