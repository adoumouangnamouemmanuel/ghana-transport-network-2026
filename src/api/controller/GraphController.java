package api.controller;

import api.TransportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Handles graph structure endpoints: towns, neighbors, full graph, stats.
 */
@RestController
@RequestMapping("/api")
public class GraphController {

    private final TransportService service;

    public GraphController(TransportService service) {
        this.service = service;
    }

    /** GET /api/towns */
    @GetMapping("/towns")
    public ResponseEntity<?> towns() {
        List<String> towns = service.getAllTowns();
        return ResponseEntity.ok(Map.of("towns", towns));
    }

    /** GET /api/neighbors?town=Accra */
    @GetMapping("/neighbors")
    public ResponseEntity<?> neighbors(@RequestParam String town) {
        if (service.notContainsTown(town)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Town not found: " + town));
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("town", town);
        resp.put("neighbors", service.getNeighbors(town));
        return ResponseEntity.ok(resp);
    }

    /** GET /api/graph — all edges for visualization */
    @GetMapping("/graph")
    public ResponseEntity<?> graph() {
        return ResponseEntity.ok(Map.of("edges", service.getAllEdges()));
    }

    /** GET /api/stats */
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(service.getStats());
    }
}
