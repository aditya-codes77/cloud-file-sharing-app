//package in.adityakaushik.cloudshareapi.controller;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import in.adityakaushik.cloudshareapi.dto.ProfileDTO;
//import in.adityakaushik.cloudshareapi.service.UserCreditsService;
//import lombok.RequiredArgsConstructor;
////import lombok.Value;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Profile;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.server.ResponseStatusException;
//import in.adityakaushik.cloudshareapi.service.ProfileService;
//
//
//@RestController
//@RequestMapping("/webhooks")
//@RequiredArgsConstructor
//
//public class ClerkWebhookController {
//    @Value("${clerk.webhook.secret}")
//    private String webhookSecret;
//    private final ProfileService profileService;
//    private final UserCreditsService userCreditsService;
//
//    @PostMapping("/clerk")
//
//    public ResponseEntity<?> handleClerkWebhook(@RequestHeader("svix-id")String svixId,
//                                                @RequestHeader("svix-timestamp")String svixTimestamp,
//                                                @RequestHeader("svix-signature")String svixSignature,
//                                                @RequestBody String payload){
//        try {
//            boolean isValid =  verifyWebhookSignature(svixId,svixTimestamp,svixSignature,payload);
//            if (!isValid){
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
//            }
//            ObjectMapper mapper = new ObjectMapper();
//            JsonNode rootNode = mapper.readTree(payload);
//            String eventtype = rootNode.path("type").asText();
//            switch(eventtype){
//                case "user.created":
//                    handleUserCreated(rootNode.path("data"));
//                    break;
//                case "user.updated":
//                    handleUserUpdated(rootNode.path("data"));
//                    break;
//                case "user.deleted":
//                    handleUserDeleted(rootNode.path("data"));
//                    break;
//
//            }
//            return ResponseEntity.ok().build();
//        }catch (Exception e){
//            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
//
//        }
//
//    }
//
//    private void handleUserDeleted(JsonNode data) {
//        String clerkId = data.path("id").asText();
//        profileService.deleteProfile(clerkId);
//    }
//
//    private void handleUserUpdated(JsonNode data) {
//        String clerkId = data.path("id").asText();
//
//        String email ="";
//        JsonNode emailAddresses = data.path("email_addresses");
//        if (emailAddresses.isArray() && emailAddresses.size() > 0){
//            email = emailAddresses.get(0).path("email_address").asText();
//
//            String firstName = data.path("first_name").asText("");
//            String lastName = data.path("last_name").asText("");
//            String photoUrl = data.path("image_url").asText("");
//
//            ProfileDTO newProfile = ProfileDTO.builder()
//                    .clerkId(clerkId)
//                    .email(email)
//                    .firstName(firstName)
//                    .photoUrl(photoUrl)
//                    .build();
//
//            ProfileDTO updatedProfile = profileService.updateProfile(newProfile);
//            if (updatedProfile == null){
//                handleUserCreated(data);
//            }
//        }
//    }
//
//    private void handleUserCreated(JsonNode data) {
//        String clerkId = data.path("id").asText();
//
//        String email = "";
//        JsonNode emailAddresses = data.path("email_addresses");
//        if (emailAddresses.isArray() && emailAddresses.size() > 0){
//            email = emailAddresses.get(0).path("email_address").asText();
//        }
//        String firstName = data.path("first_name").asText("");
//        String lastName = data.path("last_name").asText("");
//        String photoUrl = data.path("image_url").asText("");
//
//        ProfileDTO newProfile = ProfileDTO.builder()
//                .clerkId(clerkId)
//                .email(email)
//                .firstName(firstName)
//                .photoUrl(photoUrl)
//                .build();
//        profileService.createProfile(newProfile);
//        userCreditsService.createInitialCredits(clerkId);
//
//    }
//
//    private boolean verifyWebhookSignature(String svixId, String svixTimestamp, String svixSignature, String payload) {
//       // validate the signature
//        return true;
//    }
//}

package in.adityakaushik.cloudshareapi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.adityakaushik.cloudshareapi.dto.ProfileDTO;
import in.adityakaushik.cloudshareapi.service.ProfileService;
import in.adityakaushik.cloudshareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class ClerkWebhookController {

    @Value("${clerk.webhook.secret}")
    private String webhookSecret;

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;

    @PostMapping("/clerk")
    public ResponseEntity<?> handleClerkWebhook(
            @RequestHeader(value = "svix-id", required = false) String svixId,
            @RequestHeader(value = "svix-timestamp", required = false) String svixTimestamp,
            @RequestHeader(value = "svix-signature", required = false) String svixSignature,
            @RequestBody String payload) {

        try {
            System.out.println("🚀 [WEBHOOK RECEIVED] Clerk webhook called!");
            System.out.println("➡️ Payload: " + payload);

            // For local testing, skip signature verification
            boolean isValid = true; // change this to actual verification later
            if (!isValid) {
                System.out.println("❌ Invalid webhook signature");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
            }

            // Parse JSON payload
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(payload);
            String eventType = rootNode.path("type").asText();
            JsonNode data = rootNode.path("data");

            System.out.println("📨 Event Type: " + eventType);

            switch (eventType) {
                case "user.created":
                    handleUserCreated(data);
                    break;
                case "user.updated":
                    handleUserUpdated(data);
                    break;
                case "user.deleted":
                    handleUserDeleted(data);
                    break;
                default:
                    System.out.println("⚠️ Unknown event type: " + eventType);
                    break;
            }

            return ResponseEntity.ok("✅ Webhook processed successfully");

        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error processing webhook: " + e.getMessage());
        }
    }

    private void handleUserCreated(JsonNode data) {
        try {
            String clerkId = data.path("id").asText();
            String email = getEmail(data);
            String firstName = data.path("first_name").asText("");
            String lastName = data.path("last_name").asText("");
            String photoUrl = data.path("image_url").asText("");

            ProfileDTO newProfile = ProfileDTO.builder()
                    .clerkId(clerkId)
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .photoUrl(photoUrl)
                    .build();

            profileService.createProfile(newProfile);
            userCreditsService.createInitialCredits(clerkId);

            System.out.println("🎉 [USER CREATED] Saved user: " + email);
        } catch (Exception e) {
            System.out.println("❌ Error creating user: " + e.getMessage());
        }
    }

    private void handleUserUpdated(JsonNode data) {
        try {
            String clerkId = data.path("id").asText();
            String email = getEmail(data);
            String firstName = data.path("first_name").asText("");
            String lastName = data.path("last_name").asText("");
            String photoUrl = data.path("image_url").asText("");

            ProfileDTO updatedProfile = ProfileDTO.builder()
                    .clerkId(clerkId)
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .photoUrl(photoUrl)
                    .build();

            ProfileDTO result = profileService.updateProfile(updatedProfile);
            if (result == null) {
                System.out.println("⚠️ [USER NOT FOUND] Creating new user...");
                handleUserCreated(data);
            } else {
                System.out.println("✅ [USER UPDATED] " + email);
            }
        } catch (Exception e) {
            System.out.println("❌ Error updating user: " + e.getMessage());
        }
    }

    private void handleUserDeleted(JsonNode data) {
        String clerkId = data.path("id").asText();
        profileService.deleteProfile(clerkId);
        System.out.println("🗑️ [USER DELETED] Clerk ID: " + clerkId);
    }

    private String getEmail(JsonNode data) {
        JsonNode emailAddresses = data.path("email_addresses");
        if (emailAddresses.isArray() && emailAddresses.size() > 0) {
            return emailAddresses.get(0).path("email_address").asText();
        }
        return "";
    }
}
