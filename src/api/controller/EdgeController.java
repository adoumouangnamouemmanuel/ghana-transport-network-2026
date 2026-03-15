package api.controller;

import api.TransportService;
import api.dto.EdgeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles edge mutation endpoints: add, update, remove.
 */
@RestController
@RequestMapping("/api/edge")
public class EdgeController {

    private final TransportService service;

    public EdgeController(TransportService service) {
        this.service = service;
    }

    /** POST /api/edge/update */
    @PostMapping("/update")
    public ResponseEntity<?> update(@RequestBody EdgeRequest req) {
        if (req.source() == null || req.target() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "source and target are required"));
        }
        boolean updated = service.updateEdge(req.source(), req.target(), req.distanceKm(), req.travelTimeMin());
        if (!updated) {
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Edge not found between " + req.source() + " and " + req.target()));
        }
        return ResponseEntity
                .ok(Map.of("success", true, "message", "Road updated: " + req.source() + " ↔ " + req.target()));
    }

    /** POST /api/edge/remove */
    @PostMapping("/remove")
    public ResponseEntity<?> remove(@RequestBody EdgeRequest req) {
        if (req.source() == null || req.target() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "source and target are required"));
        }
        boolean removed = service.removeEdge(req.source(), req.target());
        if (!removed) {
            return ResponseEntity.ok(Map.of("success", false, "message",
                    "Edge not found between " + req.source() + " and " + req.target()));
        }
        return ResponseEntity
                .ok(Map.of("success", true, "message", "Road removed: " + req.source() + " ↔ " + req.target()));
    }

    /** POST /api/edge/add */
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody EdgeRequest req) {
        if (req.source() == null || req.target() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "source and target are required"));
        }
        if (req.distanceKm() <= 0 || req.travelTimeMin() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "distanceKm and travelTimeMin must be positive"));
        }
        service.addEdge(req.source(), req.target(), req.distanceKm(), req.travelTimeMin());
        return ResponseEntity
                .ok(Map.of("success", true, "message", "Road added: " + req.source() + " ↔ " + req.target()));
    }
}
