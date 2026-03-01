package in.adityakaushik.cloudshareapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "✅ Server is running properly!";
    }

    @GetMapping("/test/public")
    public String publicEndpoint() {
        return "✅ This is a public endpoint!";
    }
}
