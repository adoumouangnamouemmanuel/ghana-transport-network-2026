package api.dto;

/**
 * Request body for edge mutation endpoints (add, update, remove).
 */
public record EdgeRequest(
        String source,
        String target,
        int distanceKm,
        int travelTimeMin) {
}
