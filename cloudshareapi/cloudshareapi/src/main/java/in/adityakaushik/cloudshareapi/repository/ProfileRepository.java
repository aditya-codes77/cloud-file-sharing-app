package in.adityakaushik.cloudshareapi.repository;

import in.adityakaushik.cloudshareapi.document.ProfileDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProfileRepository extends MongoRepository<ProfileDocument, String> {

    Optional<ProfileDocument> findByEmail(String email);

    Optional<ProfileDocument> findByClerkId(String clerkId);

    Boolean existsByClerkId(String clerkId);
}
