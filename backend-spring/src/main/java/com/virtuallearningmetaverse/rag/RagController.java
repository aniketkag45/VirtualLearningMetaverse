package com.virtuallearningmetaverse.rag;

import com.virtuallearningmetaverse.common.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rag")
public class RagController {
    @PostMapping("/ask")
    public ApiResponse<RagAnswerResponse> ask(@RequestBody RagQuestionRequest request) {
        // TODO Phase 4:
        // 1. Retrieve course material chunks from pgvector/Qdrant.
        // 2. Rerank chunks.
        // 3. Generate cited answer through Spring AI/LangChain4j.
        // 4. Verify answer support against retrieved context.
        return ApiResponse.ok(
                "RAG placeholder response",
                new RagAnswerResponse(
                        "AI/RAG pipeline is reserved here. Connect embeddings + LLM provider in Phase 4.",
                        List.of()
                )
        );
    }

    public record RagQuestionRequest(@NotNull UUID courseId, @NotBlank String question) {}
    public record RagAnswerResponse(String answer, List<String> citations) {}
}
