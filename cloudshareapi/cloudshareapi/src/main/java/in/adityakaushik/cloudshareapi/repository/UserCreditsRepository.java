package in.adityakaushik.cloudshareapi.repository;

import in.adityakaushik.cloudshareapi.document.UserCredits;
import org.springframework.data.mongodb.repository.MongoRepository;
//import org.springframework.stereotype.Repository;
import java.util.Optional;

public interface UserCreditsRepository extends MongoRepository<UserCredits, String> {
    Optional<UserCredits> findByClerkId(String clerkId);

}
