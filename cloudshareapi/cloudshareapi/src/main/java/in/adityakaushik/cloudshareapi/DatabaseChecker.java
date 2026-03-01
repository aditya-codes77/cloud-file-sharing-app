package in.adityakaushik.cloudshareapi;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DatabaseChecker implements CommandLineRunner {

    @Autowired
    private MongoClient mongoClient;

    @Override
    public void run(String... args) {
        try {
            MongoDatabase database = mongoClient.getDatabase("cloudshare");
            database.listCollectionNames().first(); // triggers a test query
            System.out.println("✅ Connected to MongoDB successfully!");
        } catch (Exception e) {
            System.out.println("❌ Failed to connect to MongoDB: " + e.getMessage());
        }
    }
}